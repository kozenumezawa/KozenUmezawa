/* eslint-disable no-undef */

function BoundingBoxGeometry(volume) {
  const minx = volume.min_coord.x;
  const miny = volume.min_coord.y;
  const minz = volume.min_coord.z;

  const maxx = volume.max_coord.x;
  const maxy = volume.max_coord.y;
  const maxz = volume.max_coord.z;

  const vertices = [
    [minx, miny, minz], // 0
    [maxx, miny, minz], // 1
    [maxx, miny, maxz], // 2
    [minx, miny, maxz], // 3
    [minx, maxy, minz], // 4
    [maxx, maxy, minz], // 5
    [maxx, maxy, maxz], // 6
    [minx, maxy, maxz] // 7
  ];

  const faces = [
    [0, 1, 2], // f0
    [0, 2, 3], // f1
    [7, 6, 5], // f2
    [7, 5, 4], // f3
    [0, 4, 1], // f4
    [1, 4, 5], // f5
    [1, 5, 6], // f6
    [1, 6, 2], // f7
    [2, 6, 3], // f8
    [3, 6, 7], // f9
    [0, 3, 7], // f10
    [0, 7, 4], // f11
  ];

  const geometry = new THREE.Geometry();

  const nvertices = vertices.length;
  for (let i = 0; i < nvertices; i++) {
    const vertex = new THREE.Vector3().fromArray(vertices[i]);
    geometry.vertices.push(vertex);
  }

  const nfaces = faces.length;
  for (let i = 0; i < nfaces; i++) {
    const id = faces[i];
    const face = new THREE.Face3(id[0], id[1], id[2]);
    geometry.faces.push(face);
  }

  geometry.doubleSided = true;

  return geometry;
}

function VolumeTexture(volume) {
  const width = volume.resolution.x * volume.resolution.z;
  const height = volume.resolution.y;
  const data = new Uint8Array(width * height);
  for (let z = 0, index = 0; z < volume.resolution.z; z++) {
    for (let y = 0; y < volume.resolution.y; y++) {
      for (let x = 0; x < volume.resolution.x; x++, index++) {
        const u = volume.resolution.x * z + x;
        const v = y;
        data[width * v + u] = volume.values[index][0];
      }
    }
  }

  const format = THREE.AlphaFormat;
  const type = THREE.UnsignedByteType;

  const texture = new THREE.DataTexture(data, width, height, format, type);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function TransferFunctionTexture() {
  const resolution = 256;
  const width = resolution;
  const height = 1;
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < resolution; i++) {
    const color = KVS.RainbowColorMap(0, 255, i);
    const alpha = (i / 255.0);// > 0.8 ? 1 : 0;
    data[4 * i + 0] = color.x;
    data[4 * i + 1] = color.y;
    data[4 * i + 2] = color.z;
    data[4 * i + 3] = alpha;
  }

  const format = THREE.RGBAFormat;
  const type = THREE.FloatType;

  const texture = new THREE.DataTexture(data, width, height, format, type);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function main() {
  const volume = new KVS.LobsterData();
  const screen = new KVS.THREEScreen();

  screen.init(volume, {
    width: 640,
    height: 640,
    enableAutoResize: false
  });

  const exit_buffer = new THREE.Scene();
  const exit_texture = new THREE.WebGLRenderTarget(
    screen.width, screen.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
      generateMipmaps: false
    }
  );

  const bounding_geometry = BoundingBoxGeometry(volume);
  const volume_texture = VolumeTexture(volume);
  const transfer_function_texture = TransferFunctionTexture();

  const bounding_material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('bounding.vert').textContent,
    fragmentShader: document.getElementById('bounding.frag').textContent,
    side: THREE.BackSide
  });

  const bounding_mesh = new THREE.Mesh(bounding_geometry, bounding_material);
  exit_buffer.add(bounding_mesh);

  screen.camera = window.parent.camera;

  const raycaster_material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('raycaster.vert').textContent,
    fragmentShader: document.getElementById('raycaster.frag').textContent,
    side: THREE.FrontSide,
    uniforms: {
      volume_resolution: {
        type: 'v3',
        value: volume.resolution
      },
      exit_points: {
        type: 't',
        value: exit_texture
      },
      volume_data: {
        type: 't',
        value: volume_texture
      },
      transfer_function_data: {
        type: 't',
        value: transfer_function_texture
      },
      light_position: {
        type: 'v3',
        value: screen.light.position
      },
      camera_position: {
        type: 'v3',
        value: screen.camera.position
      },
      background_color: {
        type: 'v3',
        value: new THREE.Vector3().fromArray(screen.renderer.getClearColor().toArray())
      },
    }
  });

  const raycaster_mesh = new THREE.Mesh(bounding_geometry, raycaster_material);
  screen.scene.add(raycaster_mesh);
  screen.light.position.copy(screen.camera.position);

  window.addEventListener('resize', () => screen.resize([640, 640]));

  screen.loop();

  screen.draw = () => {
    if (screen.renderer == undefined) return;
    screen.scene.updateMatrixWorld();
    screen.renderer.render(exit_buffer, screen.camera, exit_texture, true);
    screen.renderer.render(screen.scene, screen.camera);
  };
}
