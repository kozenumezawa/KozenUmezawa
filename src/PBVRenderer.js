import _ from 'lodash';

import THREE from 'three';
import Stats from 'stats.js';
const OrbitControls = require('three-orbit-controls')(THREE);

import EnsembleShader from './EnsembleShader';
import shader from './shader';

export default class PBVRenderer {
  constructor (width, height) {
    this.N_ENSEMBLE = 5;

    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    this.renderer.setSize(width, height);

    this.stats = new Stats();

    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.z = 70;

    this.geometry = new THREE.BufferGeometry();

    this.material = new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
      uniforms: {
        alphaZero: {type: 'f', value: 0.3},
        rZero: {type: 'f', value: 0.9}
      },
      vertexColors: THREE.VertexColors,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    }));

    this.points = new THREE.Points(this.geometry, this.material);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.kvsml = {values: [], maxValue: 0, minValue: 1, numberOfVertices: 0};

    //prepare scene with the same number of N_ENSEMBLE 
    this.scene = new Array();
    for(var i=0; i<this.N_ENSEMBLE; i++){
      this.scene.push(new THREE.Scene());
    }
    
    //Create RenderTarget to realize ensemble average
    this.rt = new Array();
    for(var i=0; i<3; i++) {
      //CAUTION:: We multiply 'width' by 2.5 to improve the image quality but '2.5' is a baseless number.
      this.rt.push(new THREE.WebGLRenderTarget(width * 2.5, height * 2.5, {
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        warpT: THREE.ClampToEdgeWrapping,
        type: THREE.FloatType,
        anisotropy: this.renderer.getMaxAnisotropy()
      }));
    }
    
    this.imageGeometry = new THREE.PlaneBufferGeometry(width, height)
    this.imageMaterial = new THREE.ShaderMaterial(EnsembleShader);
    this.imageMaterial.uniforms['tDiffuse1'].value = this.rt[0];
    this.imageMaterial.uniforms['tDiffuse2'].value = this.rt[1];

    this.imageMesh = new THREE.Mesh(this.imageGeometry, this.imageMaterial);
    this.imageScene = new THREE.Scene();
    this.imageScene.add(this.imageMesh);

    this.imageCamera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 250, 300);
    this.imageCamera.position.z = 300;
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.stats.update();

    this.scene.forEach((element, idx)=>{
      switch(idx){
        case 0:
          this.renderer.render(this.scene[idx], this.camera, this.rt[0]);
          break;
        case 1:
          this.renderer.render(this.scene[idx], this.camera, this.rt[1]);
          break;
        default:
          this.renderer.render(this.imageScene, this.imageCamera, this.rt[2]);
          this.rt[0] = this.rt[2];
          this.renderer.render(this.scene[idx], this.camera, this.rt[1]);
          break;
      }
       this.renderer.render(this.scene[idx], this.camera, this.rt[idx]);   //offScreenRendering
    });
    this.renderer.render(this.imageScene, this.imageCamera);
  }

  getMaxValue () {
    return this.kvsml.maxValue;
  }

  getMinValue () {
    return this.kvsml.minValue;
  }

  getNumberOfVertices () {
    return this.kvsml.numberOfVertices;
  }

  getFramesPerSecond () {
    return this.stats.domElement.innerText.split(' ')[0];
  }

  getDomElement () {
    return this.renderer.domElement;
  }

  setVertexCoords (coords) {
    this.kvsml.numberOfVertices = coords.length / 3;
    this.geometry.addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues (values) {
    this.kvsml.maxValue = _.max(values);
    this.kvsml.minValue = _.min(values);
    this.kvsml.values = values;
  }

  setRandomVertex(coords, values, params){
    const N_particle = 1000000;
    this.scene.forEach((element, idx) => {
      var index = new Array(N_particle);

      index.forEach((element,idx) => {
        index[idx] = Math.floor(Math.random()*values.length);
      });
      index = index.sort((a,b) =>{return a-b});

      //Choose vertices at random
      index.forEach((element, idx) => {
        for(var i=0; i<3; i++){
          coords[idx*3+i] = coords[element*3+i];
        }
        values[idx] = values[element];
      });

      this.setVertexCoords(coords.slice(0, N_particle*3));
      this.setVertexValues(values.slice(0, N_particle));
      this.addPointsToScene(idx);
      this.updateAllAttributes(params);
    });
  }

  addPointsToScene (index) {
    this.scene[index].add(this.points);
  }

  updateVertexColors (spectrum) {
    const range = spectrum.length - 1;
    var colors = new Float32Array(_.flatMap(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return spectrum[idx];
    }));

    colors.forEach((element, idx) => {
      if((idx % 4) == 3)
        colors[idx] /= this.N_ENSEMBLE;
    });
    this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));
  }

  updateOpacity (opacity) {
    const range = opacity.length - 1;
    const opacities = new Float32Array(_.map(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return opacity[idx];
    }));
    this.geometry.addAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
  }

  updateOpacityParams (alphaZero, rZero) {
    this.material.uniforms.alphaZero.value = alphaZero;
    this.material.uniforms.rZero.value = rZero;
  }

  updateAllAttributes (params) {
    this.updateVertexColors(params.spectrum);
    this.updateOpacity(params.opacity);
    this.updateOpacityParams(params.alphaZero, params.rZero);
  }
}
