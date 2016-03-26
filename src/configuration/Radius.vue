<template lang="jade">
.title Particle size
canvas#radius(width="430" height="200" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseleave="onMouseUp")
</template>

<script>
import _ from 'lodash';
import spline from 'cardinal-spline-js';

import helper from '../helper';

let pIndex = -1;
let isDown = false;

let radiuses = [[0, 200], [215, 100], [430, 0]];
const getCurvePoints = () => _.chunk(spline.getCurvePoints(_.flatten(radiuses), 0.2, 50, false), 2);

export default {
  computed: {
    radius: () => document.getElementById('radius'),
    context: () => document.getElementById('radius').getContext('2d'),
  },
  ready () {
    this.initGraph();

    this.$on('reset', () => {
      radiuses = [[0, 200], [215, 100], [430, 0]];
      this.initGraph();
      this.$parent.emit('render');
    });
  },
  methods: {
    initGraph () {
      this.context.clearRect(0, 0, radius.width, radius.height);
      this.drawLine();
      this.drawHandles();
      this.$parent.radius = _.map(getCurvePoints(), pt => 1.0 - pt[1] / radius.height);
    },
    drawLine () {
      const s = getCurvePoints();
      this.context.beginPath();
      this.context.moveTo(0, 0);
      for(let i=0; i < s.length - 1; i++) {
        this.context.lineTo(s[i][0], s[i][1]);
      }
      this.context.stroke();
    },
    drawHandles () {
      this.context.strokeStyle = 'black';
      this.context.beginPath();
      for(let i=1; i < radiuses.length - 1; i++){
        this.context.rect(radiuses[i][0] - 3, radiuses[i][1] - 3, 6, 6);
      }
      this.context.stroke();
    },
    onMouseDown (e) {
      const pos = helper.getClickedPoint(e);

      pIndex = -1;
      isDown = false;

  		for(let i=0; i < radiuses.length; i++) {
        if(Math.abs(pos.x - radiuses[i][0]) < 10 && Math.abs(pos.y - radiuses[i][1] < 10)){
          pIndex = i;
          isDown = true;
          return;
        }
  		}

      const s = getCurvePoints();
      const newHandlePos = s.find(pt => Math.abs(pt[0] - pos.x) < 10 && Math.abs(pt[1] - pos.y) < 10);

      if(!newHandlePos) return;

      radiuses = radiuses.concat([newHandlePos]).sort((a, b) => a[0] - b[0]);

      this.onMouseDown(e);
      this.initGraph();
    },
    onMouseMove (e) {
      if(!isDown || pIndex === 0 || pIndex === radiuses.length - 1) return;

      const pos = helper.getClickedPoint(e);
			radiuses[pIndex] = [pos.x, pos.y];

      // Remove the point if its position is overrapped with another point
      radiuses = _.uniqWith(radiuses.sort((a, b) => a[0] - b[0]), (a, b) => Math.abs(a[0] - b[0]) < 1);

      this.initGraph();
    },
    onMouseUp () {
      isDown = false;
    }
  }
};
</script>

<style scoped>
#radius {
  border: 1px solid #aaa;
  cursor: crosshair;
}
</style>
