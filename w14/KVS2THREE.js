/* eslint-disable no-undef */

KVS.THREEScreen = function() {
  this.width = 0;
  this.height = 0;
  this.scene = undefined;
  this.camera = undefined;
  this.light = undefined;
  this.renderer = undefined;
  this.trackball = undefined;
};
KVS.THREEScreen.prototype = {
  constructor: KVS.THREEScreen,
  init(a, c) {
    void 0 === c && (c = {});
    void 0 === c.width && (c.width = window.innerWidth);
    void 0 === c.height && (c.height = window.innerHeight);
    void 0 === c.enableAutoResize && (c.enableAutoResize = !0);
    void 0 === c.targetDom && (c.targetDom = document.body);
    this.width = c.width;
    this.height = c.height;
    const f = a.max_coord.clone().sub(a.min_coord).max();
    const d = a.objectCenter();
    const b = this.width / this.height;
    const e = 100 * f;
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(45, b, .1, e);
    this.camera.position.set(d.x, d.y, 2 * f);
    this.camera.up.set(0, 1, 0);
    this.scene.add(this.camera);
    this.light = new THREE.DirectionalLight(new THREE.Color('white'));
    this.renderer = new THREE.WebGLRenderer;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(new THREE.Color('black'));
    window.ctx = this.renderer.domElement.getContext('webgl', {
      preserveDrawingBuffer: true
    });
    c.targetDom.appendChild(this.renderer.domElement);
  },
  draw() {
    void 0 != this.renderer && (this.renderer.render(this.scene, this.camera));
  },
  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.draw();
  }
};
KVS.ToTHREELine = a => {
  const c = new THREE.Geometry;
  const f = new THREE.LineBasicMaterial;
  f.linewidth = a.width;
  if (0 == a.colors.length) f.color = new THREE.Color('white');
  else if (1 == a.colors.length) {
    const d = a.colors[0];
    f.color = new THREE.Color(d[0], d[1], d[2]);
  } else if (a.colors.length == a.coords.length) {
    f.vertexColors = THREE.VertexColors;
    for (let b = 0; b < a.colors.length; b++)
      d = a.colors[b], c.colors.push(new THREE.Color(d[0], d[1], d[2]));
  } else f.vertexColors = THREE.FaceColors, console.log('Not supported.');
  d = a.coords.length;
  for (b =
    0; b < d; b++) {
    const e = (new THREE.Vector3).fromArray(a.coords[b]);
    c.vertices.push(e);
  }
  return new THREE.Line(c, f, a.line_type == KVS.StripLine ? THREE.LineStrip : THREE.LinePieces);
};
KVS.ToTHREEMesh = function(polygon) {
  const geometry = new THREE.Geometry();
  const material = new THREE.MeshLambertMaterial();

  material.side = THREE.DoubleSide;

  const npolygons = polygon.connections.length;
  for (let i = 0; i < npolygons; i++) {
    const id = polygon.connections[i];
    geometry.faces.push(new THREE.Face3(id[0], id[1], id[2]));
  }

  if (polygon.colors.length == 0) {
    material.color = new THREE.Color('white');
  } else if (polygon.colors.length == 1) {
    const c = polygon.colors[0];
    material.color = new THREE.Color(c[0], c[1], c[2]);
  } else if (polygon.colors.length == polygon.coords.length) {
    material.vertexColors = THREE.VertexColors;
    for (let i = 0; i < npolygons; i++) {
      const id0 = geometry.faces[i].a;
      const id1 = geometry.faces[i].b;
      const id2 = geometry.faces[i].c;
      const c0 = polygon.colors[id0];
      const c1 = polygon.colors[id1];
      const c2 = polygon.colors[id2];
      geometry.faces[i].vertexColors.push(new THREE.Color(c0[0], c0[1], c0[2]));
      geometry.faces[i].vertexColors.push(new THREE.Color(c1[0], c1[1], c1[2]));
      geometry.faces[i].vertexColors.push(new THREE.Color(c2[0], c2[1], c2[2]));
    }
  } else if (polygon.colors.length == polygon.connections.length) {
    material.vertexColors = THREE.FaceColors;
    for (let i = 0; i < npolygons; i++) {
      const c = polygon.colors[i];
      geometry.faces[i].color = new THREE.Color(c[0], c[1], c[2]);
    }
  }

  const nvertices = polygon.numberOfVertices();
  for (let i = 0; i < nvertices; i++) {
    const v = new THREE.Vector3().fromArray(polygon.coords[i]);
    geometry.vertices.push(v);
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  return new THREE.Mesh(geometry, material);
};

KVS.ToTHREEParticleSystem = function(point) {
  // In order to draw a point as round-shaped point, the defulat fragment shader
  // defined for THREE.ParticleSystemMaterial is over-written with the following
  // fragment shader.
  THREE.ShaderLib['particle_basic'].fragmentShader = [
    'uniform vec3 psColor;',
    'uniform float opacity;',
    THREE.ShaderChunk['color_pars_fragment'],
    THREE.ShaderChunk['map_particle_pars_fragment'],
    THREE.ShaderChunk['fog_pars_fragment'],
    THREE.ShaderChunk['shadowmap_pars_fragment'],
    THREE.ShaderChunk['logdepthbuf_pars_fragment'],
    'void main() {',
    /*add*/
    'vec3 n;',
    /*add*/
    'n.xy = gl_PointCoord * 2.0 - 1.0;',
    /*add*/
    'n.z = 1.0 - dot( n.xy, n.xy );',
    /*add*/
    'if ( n.z < 0.0 ) discard;',
    '    gl_FragColor = vec4( psColor, opacity );',
    THREE.ShaderChunk['logdepthbuf_fragment'],
    THREE.ShaderChunk['map_particle_fragment'],
    THREE.ShaderChunk['alphatest_fragment'],
    THREE.ShaderChunk['color_fragment'],
    THREE.ShaderChunk['shadowmap_fragment'],
    THREE.ShaderChunk['fog_fragment'],
    '}'
  ].join('\n');

  const geometry = new THREE.Geometry();
  const material = new THREE.ParticleSystemMaterial();

  material.size = point.size;

  if (point.colors.length == 0) {
    material.color = new THREE.Color('white');
  } else if (point.colors.length == 1) {
    const c = point.colors[0];
    material.color = new THREE.Color(c[0], c[1], c[2]);
  } else {
    material.vertexColors = true;
    for (let i = 0; i < point.colors.length; i++) {
      const c = point.colors[i];
      geometry.colors.push(new THREE.Color(c[0], c[1], c[2]));
    }
  }

  const nvertices = point.coords.length;
  for (let i = 0; i < nvertices; i++) {
    const v = new THREE.Vector3().fromArray(point.coords[i]);
    geometry.vertices.push(v);
  }

  return new THREE.ParticleSystem(geometry, material);
};
