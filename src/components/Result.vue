<template lang="jade">
.title Result
#result
warning(:show.sync="warningVisible")
.row
  .column.column-50
    | Number of vertices: <b>{{ numberOfVertices }}</b><br>
    | Frames per second: <b>{{ framesPerSecond }}</b>
  .column.column-50
    | Maximum value: <b>{{ maxValue }}</b><br>
    | Minimum value: <b>{{ minValue }}</b>
</template>

<script>
import request from 'axios';
request.defaults.responseType = 'arraybuffer';

import PBVRenderer from '../PBVRenderer';

import Warning from './Warning.vue';

const pbvr = new PBVRenderer(640, 640);

export default {
  components: {
    Warning
  },
  ready () {
    this.$on('updateVertexColors', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateVertexColors(this.$parent.spectrum);
      }
    });

    this.$on('updateOpacity', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateOpacity(this.$parent.opacity);
      }
    });

    this.$on('updateOpacityParams', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateOpacityParams(this.$parent.alphaZero, this.$parent.rZero);
      }
    });

    this.$on('apply', () => pbvr.updateAllAttriutes(this.$parent));
    this.$on('reset', () => pbvr.updateAllAttriutes(this.$parent));

    document.getElementById('result').appendChild(pbvr.getDomElement());

    this.retrieveSampleKvsml();

    pbvr.animate();
  },
  data () {
    return {
      minValue: 0,
      maxValue: 0,
      framesPerSecond: 0,
      numberOfVertices: 0,
      warningVisible: false
    }
  },
  methods: {
    retrieveSampleKvsml () { // TODO: This block should be replaced with OPeNDAP request if needed.
      request.get('./assets/kvsml/test_coord.dat')
      .then(res => pbvr.setVertexCoords(new Float32Array(res.data)))
      .then(() => request.get('./assets/kvsml/test_value.dat'))
      .then(res => pbvr.setVertexValues(new Float32Array(res.data)))
      .then(() => {
        if(pbvr.getNumberOfVertices() > 1000000){
          this.warningVisible = true;
        } else {
          this.addPointsToScene();
        }
      })
      .then(() => pbvr.updateAllAttriutes(this.$parent))
      .then(this.updateStats);
    },
    addPointsToScene () {
      pbvr.addPointsToScene();
    },
    updateStats () {
      this.minValue = Math.floor(pbvr.getMinValue() * 100) / 100;
      this.maxValue = Math.floor(pbvr.getMaxValue() * 100) / 100;
      this.numberOfVertices = pbvr.getNumberOfVertices();

      setInterval(() => {
        this.framesPerSecond = pbvr.getFramesPerSecond();
      }, 1000);
    }
  }
}
</script>
