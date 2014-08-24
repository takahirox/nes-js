function Display(canvas) {
  this.cvs = canvas;
  this.ctx = canvas.getContext('2d');

  this.width = this.cvs.width = Display._WIDTH;
  this.height = this.cvs.height = Display._HEIGHT;

  this.data = this.ctx.createImageData(this.width, this.height);
};

Display._WIDTH = 256;
Display._HEIGHT = 240;


Display.prototype.renderPixel = function(x, y, c) {
  var index = (y * this.width + x) * 4;
  this.data.data[index+0] = c[0];
  this.data.data[index+1] = c[1];
  this.data.data[index+2] = c[2];
  this.data.data[index+3] = 255;
};


Display.prototype.updateScreen = function() {
  this.ctx.putImageData(this.data, 0, 0);
};
