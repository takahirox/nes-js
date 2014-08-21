function Display(canvas, nes) {
  this.cvs = canvas;
  this.nes = nes;
  this.ctx = canvas.getContext('2d');

  this.width = this.cvs.width = Display._WIDTH;
  this.height = this.cvs.height = Display._HEIGHT;

};

Display._WIDTH = 256;
Display._HEIGHT = 240;

Display.prototype.update = function() {
//  this.ctx.clearRect(0, 0, this.width, this.height);
  var data = this.ctx.createImageData(this.width, this.height);
  this.nes.ppu.initSprites();
  for(var i = 0; i < Display._HEIGHT; i++) {
    for(var j = 0; j < Display._WIDTH; j++) {
      var color = this.nes.ppu.getPixelRGB(j, i);
      var index = (i * this.width + j) * 4;
      data.data[index+0] = color[0];
      data.data[index+1] = color[1];
      data.data[index+2] = color[2];
      data.data[index+3] = 255;
    }
  } 
  this.ctx.putImageData(data, 0, 0);
};


Display.prototype._getRGBForCanvas2D = function(c) {
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
};

