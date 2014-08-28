function Display(canvas) {
  this.cvs = canvas;
  this.ctx = canvas.getContext('2d');

  this.width = this.cvs.width = this._WIDTH;
  this.height = this.cvs.height = this._HEIGHT;

  this.data = this.ctx.createImageData(this.width, this.height);
  this.uint32 = new Uint32Array(this.data.data.buffer);
};

Display.prototype._WIDTH = 256;
Display.prototype._HEIGHT = 240;


Display.prototype.renderPixel = function(x, y, c) {
  var index = y * this.width + x;
  this.uint32[index] = c;
};


Display.prototype.updateScreen = function() {
  this.ctx.putImageData(this.data, 0, 0);
};
