<template lang="jade">
.title Opacity
canvas#opacity(width="430" height="200" @mousemove="onMouseMove" @mousedown="onMouseDown"
              @mouseup="onMouseUp" @mouseleave="onMouseUp")
.row
  .column.column-50
    {{ minValue }}
  .column.column-60
    .float-right: {{ maxValue }}
</template>

<script>
import _ from 'lodash';
import spline from 'cardinal-spline-js';
import SplineInterpolator from 'spline-interpolator';

import helper from '../helper';

let pIndex = -1;
let isDown = false;

let opacities = [[0, 180], [215, 100], [430, 20]]; //first position

//const getCurvePoints = () => _.chunk(spline.getCurvePoints(_.flatten(opacities), 0.2, 50, false), 2);
function getCurvePoints(){
  let x = new Array();
  let y = new Array();
  opacities.forEach((element, idx) => {
    x.push(opacities[idx][0]);
    y.push(opacities[idx][1]);
  });
  const interpolator = new SplineInterpolator(x, y);
  return interpolator.curve(101);
}

export default {
  data () {
    return {
      maxValue: '-',
      minValue: '-'
    }
  },
  computed: {
    opacity: () => document.getElementById('opacity'),
    context: () => document.getElementById('opacity').getContext('2d'),
  },
  ready () {
    this.initGraph();
    this.$on('reset', () => {
      opacities = [[0, 180], [215, 100], [430, 20]];
      this.initGraph();
      this.$parent.emit('updateOpacity');
    });

    this.$on('updateValue', () => {
      this.maxValue = this.$parent.maxValue;
      this.minValue = this.$parent.minValue;
    });
  },
  methods: {
    initGraph () {
      this.context.clearRect(0, 0, opacity.width, opacity.height);

      this.drawLine();
      this.drawHandles();
      this.drawGrid();
      // Additional 0.0001 is used to prevent divergence of particle size
      // The range of opacity is [0.0, 1.0]
      this.$parent.opacity = _.map(getCurvePoints(), pt => 1.00001 - pt[1] / opacity.height);
    },
    drawLine () {
      const s = getCurvePoints();
      this.context.beginPath();
      for(let i=0; i < s.length - 1; i++) {
        this.context.lineTo(s[i][0], s[i][1]);
      }
      this.context.stroke();
    },
    drawHandles () {
      this.context.beginPath();
      for(let i=1; i < opacities.length - 1; i++){
        this.context.rect(opacities[i][0] - 3, opacities[i][1] - 3, 6, 6);
      }
      this.context.stroke();
    },
    drawGrid () {
      this.context.lineWidth = 0.3;
      this.context.strokeStyle = '#202020';

      this.context.beginPath();
      this.context.moveTo(0, opacity.height / 2);
      this.context.lineTo(opacity.width, opacity.height / 2);
      this.context.stroke();

      this.context.beginPath();
      this.context.moveTo(opacity.width / 3, 0);
      this.context.lineTo(opacity.width / 3, opacity.height);
      this.context.stroke();

      this.context.beginPath();
      this.context.moveTo(opacity.width / 3 * 2, 0);
      this.context.lineTo(opacity.width / 3 * 2, opacity.height);
      this.context.stroke();

      this.context.strokeStyle = '#000000';
      this.context.lineWidth = 1.0;
    },
    onMouseDown (e) {
      const pos = helper.getClickedPoint(e);

      pIndex = -1;
      isDown = false;

  		for(let i=0; i < opacities.length; i++) {
        if(Math.abs(pos.x - opacities[i][0]) < 10 && Math.abs(pos.y - opacities[i][1] < 10)){
          pIndex = i;
          isDown = true;
          return;
        }
  		}

      const s = getCurvePoints();
      const newHandlePos = s.find(pt => Math.abs(pt[0] - pos.x) < 10 && Math.abs(pt[1] - pos.y) < 10);

      if(!newHandlePos) return;

      opacities = opacities.concat([newHandlePos]).sort((a, b) => a[0] - b[0]);

      this.onMouseDown(e);
      this.initGraph();
    },
    onMouseMove (e) {
      if(!isDown || pIndex === 0 || pIndex === opacities.length - 1) return;

      const pos = helper.getClickedPoint(e);
			opacities[pIndex] = [pos.x, pos.y];

      // Remove the point if its position is overrapped with another point
      opacities = _.uniqWith(opacities.sort((a, b) => a[0] - b[0]), (a, b) => Math.abs(a[0] - b[0]) < 1);

      this.initGraph();
    },
    onMouseUp () {
      isDown = false;
      this.$parent.emit('updateOpacity');
    }
  }
};
</script>

<style scoped>
#opacity {
  border: 1px solid #aaa;
  cursor: crosshair;
}
</style>
