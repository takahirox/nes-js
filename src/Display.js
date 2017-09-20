/**
 *
 */
function Display(canvas) {
  this.ctx = canvas.getContext('2d');

  this.width = canvas.width = 256;
  this.height = canvas.height = 240;

  this.data = this.ctx.createImageData(this.width, this.height);
  this.uint32 = new Uint32Array(this.data.data.buffer);
}

Object.assign(Display.prototype, {
  isDisplay: true,

  /**
   *
   */
  renderPixel: function(x, y, c) {
    var index = y * this.width + x;
    this.uint32[index] = c;
  },

  /**
   *
   */
  updateScreen: function() {
    this.ctx.putImageData(this.data, 0, 0);
  }
});


export {Display};
