function Display(canvas, nes) {
  this.cvs = canvas;
  this.nes = nes;
  this.ctx = canvas.getContext('2d');

  this.width = this.cvs.width = Display._WIDTH * Display._PIXEL_SIZE;
  this.height = this.cvs.height = Display._HEIGHT * Display._PIXEL_SIZE;

};

Display._WIDTH = 256;
Display._HEIGHT = 240;
Display._PIXEL_SIZE = 2;

Display.prototype.update = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
/*
  for(var i = 0; i < Display._WIDTH; i++) {
    for(var j = 0; j < Display._HEIGHT; j++) {
      var color = this.nes.ppu.getPixelRGB(i, j);
      this.ctx.fillStyle = this._getRGBForCanvas2D(color);
      this.ctx.fillRect(i * Display._PIXEL_SIZE,
                        j * Display._PIXEL_SIZE,
                        Display._PIXEL_SIZE,
                        Display._PIXEL_SIZE);
    }
  }
*/
  var data = this.ctx.createImageData(this.width, this.height);
  var pos = 0;
  for(var i = 0; i < Display._HEIGHT; i++) {
    for(var j = 0; j < Display._WIDTH; j++) {
      var color = this.nes.ppu.getPixelRGB(j, i);
      for(var k = 0; k < Math.pow(Display._PIXEL_SIZE, 2); k++) {
        var index = (i * this.width * Display._PIXEL_SIZE +
                     j * Display._PIXEL_SIZE +
                     k % Display._PIXEL_SIZE +
                     parseInt(k / Display._PIXEL_SIZE) * this.width) * 4;
        data.data[index+0] = color[0];
        data.data[index+1] = color[1];
        data.data[index+2] = color[2];
        data.data[index+3] = 255;
      }
    }
  } 
  this.ctx.putImageData(data, 0, 0);
};


Display.prototype._getRGBForCanvas2D = function(c) {
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
};

