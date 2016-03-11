<template lang="jade">
#result
</template>

<script>
import _ from 'lodash';

var camera, scene, renderer, particles, particleCount, points;
const xSpeed = 0.0005;
const ySpeed = 0.001;

export default {
  ready () {
    this.init();
    this.animate();
  },
  methods: {
    init () {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2('#222', 0.001);

      camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);
      camera.position.z = 500;

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3
      });

      particleCount = 15000;
      particles = new THREE.Geometry();

      _.times(particleCount, i => {
        const px = Math.random() * 2000 - 1000;
        const py = Math.random() * 2000 - 1000;
        const pz = Math.random() * 2000 - 1000;
        const particle = new THREE.Vector3(px, py, pz);
        particle.velocity = new THREE.Vector3(0, Math.random(), 0);
        particles.vertices.push(particle);
      });

      points = new THREE.Points(particles, material);
      points.sortParticles = true;
      scene.add(points);

      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize(this.$el.offsetWidth, this.$el.offsetWidth);
      renderer.setClearColor('#222', 1);

      this.$el.appendChild(renderer.domElement);
    },
    animate () {
      requestAnimationFrame(this.animate);

      scene.rotation.y += xSpeed;

      _.times(particleCount, i => {
        const particle = particles.vertices[i];

        if(particle.y > 1000){
          particle.y = -1000;
          particle.velocity.y = Math.random();
        }
        particle.velocity.y += Math.random() * ySpeed;
        particle.add(particle.velocity);
      })

      points.geometry.verticesNeedUpdate = true;

      this.render();
    },
    render () {
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
  }
}
</script>

<style scoped>
#result {
  overflow: hidden;
}
</style>
