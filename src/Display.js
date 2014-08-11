function Display(canvas, nes) {
  this.cvs = canvas;
  this.nes = nes;
  this.ctx = canvas.getContext('2d');

  this.cvs.width = Display._WIDTH * Display._PIXEL_SIZE;
  this.cvs.height = Display._HEIGHT * Display._PIXEL_SIZE;
};

Display._WIDTH = 256;
Display._HEIGHT = 240;
Display._PIXEL_SIZE = 2;

Display.prototype.update = function() {
  this.ctx.clearRect(0, 0, Display._WIDTH, Display._HEIGHT);
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
};


Display.prototype._getRGBForCanvas2D = function(c) {
  return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
};

