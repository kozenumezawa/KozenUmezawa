import _ from 'lodash';

import THREE from 'three';
import Stats from 'stats.js';
const OrbitControls = require('three-orbit-controls')(THREE);

import shader from './shader';
import getEffectComposer from 'three-effectcomposer';
const EffectComposer = getEffectComposer(THREE);
import EnsembleAveragePass from 'three-ensemble-average-pass';

import prismCell from './prism-cell';


export default class PBVRenderer {
  constructor (width, height) {
    this.N_ENSEMBLE = 1;

    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer();
    const PixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    this.renderer.setPixelRatio(PixelRatio);
    this.renderer.setSize(width, height);

    this.stats = new Stats();

    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.z = 70;

    //prepare points and scene with the same number of N_ENSEMBLE
    this.geometry = [];
    this.material = [];
    this.points = [];
    this.scene = [];
    const alphaZero = 0.2;
    const rZero = 0.1;
    for(let i=0; i<this.N_ENSEMBLE; i++){
      this.geometry.push(new THREE.BufferGeometry());
      this.material.push(new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
        uniforms: {
          alphaZero: {type: 'f', value: alphaZero},
          rZero: {type: 'f', value: rZero},
          maxValue: {type: 'f', value: 100},
          minValue: {type: 'f', value: 0.001},
          transferFunctionOpacity: {type: 't', value: 0.1},
          transferFunctionColor : {type: 't', value: 0.1}
        },
        vertexColors: THREE.VertexColors,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      })));
      this.points.push(new THREE.Points(this.geometry[i], this.material[i]));
      this.scene.push(new THREE.Scene());
    }

    //calculate initial parameters
    const delta_t = 0.005;
    this.baseDensity = - Math.log(1 - alphaZero) / (Math.PI * rZero * rZero * delta_t);
    const maxDensity = 1 / (8 * rZero * rZero * rZero);
    this.maxAlpha = 1 - Math.exp(- Math.PI * rZero * rZero * maxDensity * delta_t);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //prepare kvsml with the same numver of N_ENSEMBLE
    this.kvsml = [];
    for(let i=0; i<this.N_ENSEMBLE; i++){
      this.kvsml.push({maxValue: 0, minValue: 1});
    }

    //Add EffectComposer to ralize a Postprocess
    this.composer = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(width*PixelRatio, height*PixelRatio, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      warpT: THREE.ClampToEdgeWrapping,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      anisotropy: this.renderer.getMaxAnisotropy(),
      stencilBuffer: false
    }));
    this.composer.addPass(new EffectComposer.ShaderPass({
      vertexShader: `
       void main() {
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
       }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `
      }));
    this.scene.forEach((element,idx) => {
      const effect = new EnsembleAveragePass(this.scene[idx], this.camera, this.N_ENSEMBLE);
      if(idx == this.N_ENSEMBLE - 1)
        effect.renderToScreen = true;
      this.composer.addPass(effect);
    });
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.stats.update();
    this.composer.render();
  }

  getMaxValue () {
    var maxValueArray = new Array(this.N_ENSEMBLE);
    for(let i=0; i<this.N_ENSEMBLE; i++){
      maxValueArray[i] = this.kvsml[i].maxValue;
    }
    return _.max(maxValueArray);
  }

  getMinValue () {
    var minValueArray = new Array(this.N_ENSEMBLE);
    for(let i=0; i<this.N_ENSEMBLE; i++){
      minValueArray[i] = this.kvsml[i].minValue;
    }
    return _.min(minValueArray);
  }

  getNumberOfVertices () {
    return this.numberOfParticles;
  }

  setNumberOfParticles(numberOfParticles) {
    this.numberOfParticles = numberOfParticles;
  }

  getFramesPerSecond () {
    return this.stats.domElement.innerText.split(' ')[0];
  }

  getDomElement () {
    return this.renderer.domElement;
  }

  setVertexCoords (coords, idx) {
    this.kvsml[idx].numberOfVertices = coords.length / 3;
    this.geometry[idx].addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues (values, idx) {
    this.kvsml[idx].maxValue = _.max(values);
    this.kvsml[idx].minValue = _.min(values);
    this.material[idx].uniforms.maxValue.value = _.max(values);
    this.material[idx].uniforms.minValue.value = _.min(values);
    this.geometry[idx].addAttribute('valueData', new THREE.BufferAttribute(values, 1));
  }

  generateParticlesFromPrism(coords, values, connect, params) {
    let numberOfParticlesArray = new Array(Math.floor(connect.length / 6));
    let numberOfParticles = 0;
    const stopLength = connect.length - 5;

    //  create a prism cell and count the number of particles in each cell
    for(let i = 0, cellNumber = 0; i < stopLength; i = i + 6) {
      const v0 = this.getCoord(coords, connect[ i + 0 ]);
      const v1 = this.getCoord(coords, connect[ i + 1 ]);
      const v2 = this.getCoord(coords, connect[ i + 2 ]);
      const v3 = this.getCoord(coords, connect[ i + 3 ]);
      const v4 = this.getCoord(coords, connect[ i + 4 ]);
      const v5 = this.getCoord(coords, connect[ i + 5 ]);

      const s0 = values[ connect[ i + 0 ] ];
      const s1 = values[ connect[ i + 1 ] ];
      const s2 = values[ connect[ i + 2 ] ];
      const s3 = values[ connect[ i + 3 ] ];
      const s4 = values[ connect[ i + 4 ] ];
      const s5 = values[ connect[ i + 5 ] ];

      const prism = new prismCell(v0, v1, v2, v3, v4, v5, s0, s1, s2, s3, s4, s5);
      
      //  calculate the number of particles in the prism.
      const N_particle_float = this.baseDensity * prism.volume;
      let N_particle = Math.floor(N_particle_float);
      if (N_particle_float - N_particle > Math.random()) {
        N_particle++;
      }
      numberOfParticles += N_particle;
      numberOfParticlesArray[cellNumber++] = N_particle;
    }
    
    //  generate particles
    this.scene.forEach((element, idx) => {
      const stopLength = connect.length - 5;
      let tmpcoords = new Float32Array(numberOfParticles * 3);
      let tmpvalues = new Float32Array(numberOfParticles);

      let valueIndex = 0;
      let coordIndex = 0;
      //  create a prism cell and generate particles
      for(let i = 0, cellNumber = 0; i < stopLength; i = i + 6) {
        const v0 = this.getCoord(coords, connect[i + 0]);
        const v1 = this.getCoord(coords, connect[i + 1]);
        const v2 = this.getCoord(coords, connect[i + 2]);
        const v3 = this.getCoord(coords, connect[i + 3]);
        const v4 = this.getCoord(coords, connect[i + 4]);
        const v5 = this.getCoord(coords, connect[i + 5]);

        const s0 = values[connect[i + 0]];
        const s1 = values[connect[i + 1]];
        const s2 = values[connect[i + 2]];
        const s3 = values[connect[i + 3]];
        const s4 = values[connect[i + 4]];
        const s5 = values[connect[i + 5]];

        const prism = new prismCell(v0, v1, v2, v3, v4, v5, s0, s1, s2, s3, s4, s5);

        //  generate particles
        for(let j = 0; j < numberOfParticlesArray[cellNumber]; j++){
          const sample = prism.randomSampling();
          tmpvalues[valueIndex++] = prism.interpolateScalar(sample);

          const testcoords = prism.localToGlobal(sample);
          tmpcoords[coordIndex++] = testcoords[0];
          tmpcoords[coordIndex++] = testcoords[1];
          tmpcoords[coordIndex++] = testcoords[2];
        }
        cellNumber++;
      }
      this.setVertexCoords(tmpcoords, idx);
      this.setVertexValues(tmpvalues, idx);
      this.addPointsToScene(idx);
      this.updateAllAttributes(params, idx);
    });
    
    this.setNumberOfParticles(numberOfParticles);
    this.updateAllMaxMinValue();
  }
  
  getCoord(data, idx) {
    var result = [];
    result[0] = data[idx * 3];
    result[1] = data[idx * 3 + 1];
    result[2] = data[idx * 3 + 2];
    return result;
  }

  densityCalculator(coords) {
    const MAX_GRID = 200;
    let x = new Float32Array(coords.length / 3);
    let y = new Float32Array(coords.length / 3);
    let z = new Float32Array(coords.length / 3);

    for(let i = 0; i < coords.length; i += 3){
      x[i] = coords[i + 0];
      y[i] = coords[i + 1];
      z[i] = coords[i + 2];
    }

    const x_min = _.min(x);
    const y_min = _.min(y);
    const z_min = _.min(z);
    const x_max = _.max(x);
    const y_max = _.max(y);
    const z_max = _.max(z);

    const range_x = x_max - x_min;
    const range_y = y_max - y_min;
    const range_z = z_max - z_min;

    let range_max = range_x;
    if(range_max < range_y){
      range_max = range_y;
    }
    if(range_max < range_z){
      range_max = range_z;
    }

    let m_x, m_y, m_z;
    if(range_max == range_x){
      m_x = MAX_GRID;
      m_y = (range_y / range_x) * m_x;
      m_z = (range_z / range_x) * m_x;
    }else if(range_max == range_y){
      m_y = MAX_GRID;
      m_z = (range_z / range_y) * m_y;
      m_x = (range_x / range_y) * m_y;
    }else{
      m_z = MAX_GRID;
      m_x = (range_x / range_z) * m_z;
      m_y = (range_y / range_z) * m_z;
    }

    let dx = range_x / m_x;
    let dy = range_y / m_y;
    let dz = range_z / m_z;

    let cubeVolume = dx * dy * dz;
    const length = Math.floor(m_x * m_y * m_z);
    let table = new Array(length);
    table.fill(0);

    //  count the number of vertices in the grid
    for(let i = 0; i < coords.length / 3; i ++){
      let index_x = (x[i] - x_min) / dx;
      let index_y = (y[i] - y_min) / dy;
      let index_z = (z[i] - z_min) / dz;
      table[Math.floor(index_x + index_y * m_x + index_z * m_x * m_y)] += 1;
    }

    //calculate density
    for(let i = 0; i < length; i ++){
      table[i] = table[i] / cubeVolume;
    }

    const densityMap = {density: table,
                        x_min: x_min,
                        y_min: y_min,
                        z_min: z_min,
                        dx: dx,
                        dy: dy,
                        dz: dz,
                        m_x: m_x,
                        m_y: m_y };
    return densityMap;
  }

  addPointsToScene (idx) {
    this.scene[idx].add(this.points[idx]);
  }


  getTransferFunctionOpacity(opacity){
    const width = opacity.length;
    const height = 1;
    var data = new Float32Array(width * height);

    for(let i=0; i<width; i++){
      data[i] = opacity[i];
    }

    //use THREE.AlphaFormat because opacity is one dimension.
    var texture = new THREE.DataTexture(data, width, height, THREE.AlphaFormat, THREE.FloatType);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  getTransferFunctionColor(spectrum){
    const width = spectrum.length;
    const height = 1;
    var data = new Float32Array(width * height * 4);

    //spectrum is two dimension array. spectrum[][4]
    for(let i=0; i<width; i++){
      data[4*i] = spectrum[i][0];
      data[4*i+1] = spectrum[i][1];
      data[4*i+2] = spectrum[i][2];
      data[4*i+3] = spectrum[i][3];
    }

    //use THREE.RGBAFormat because spectrum is four dimensions.
    var texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  updateTransferFunction(params, idx){
    const opacityTexture = this.getTransferFunctionOpacity(params.opacity);
    const colorTexture = this.getTransferFunctionColor(params.spectrum);

    this.material[idx].uniforms.transferFunctionOpacity.value = opacityTexture;
    this.material[idx].uniforms.transferFunctionColor.value = colorTexture;
  }

  updateAllTransferFunction(params){
    const opacityTexture = this.getTransferFunctionOpacity(params.opacity);
    const colorTexture = this.getTransferFunctionColor(params.spectrum);

    this.scene.forEach((element,idx) => {
      this.material[idx].uniforms.transferFunctionOpacity.value = opacityTexture;
      this.material[idx].uniforms.transferFunctionColor.value = colorTexture;
    });
  }

  updateAllMaxMinValue(){
    const max = this.getMaxValue();
    const min = this.getMinValue();
    this.scene.forEach((element, idx) => {
      this.material[idx].uniforms.maxValue.value = max;
      this.material[idx].uniforms.minValue.value = min;
    });
  }

  updateAllAttributes (params, idx) {
    this.updateTransferFunction(params, idx);
  }

  updateAllParticles (params) {
    this.updateAllTransferFunction(params);
  }

}
