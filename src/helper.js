module.exports = {
  getClickedPoint: (e) => { // Normalizing the mouse event differences between browsers
    e = e || window.event;
    const target = e.target || e.srcElement;
    const rect = target.getBoundingClientRect();
    return {x: e.clientX - Math.floor(rect.left), y: e.clientY - Math.floor(rect.top)};
  }
}
