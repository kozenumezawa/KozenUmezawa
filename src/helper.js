module.exports = {
  getClickedPoint: (e) => { // Normalizing the mouse event differences between browsers
    e = e || window.event;
    const target = e.target || e.srcElement;
    const rect = target.getBoundingClientRect();
    return {offsetX: e.clientX - rect.left, offsetY: e.clientY - Math.floor(rect.top)};
  }
}
