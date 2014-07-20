function RAM() {
  var buffer = new ArrayBuffer(RAM._CAPACITY);
  this.uint8 = new Uint8Array(buffer);
  this._init();
};

RAM._CAPACITY = 64 * 1024; // 64KB
RAM._WORD_SIZE = 1; // 1 byte


RAM.prototype._init = function() {
  for(var i = 0; i < RAM._CAPACITY; i++)
    this.store(i, 0);
};


RAM.prototype.load = function(address) {
  return this.uint8[address];
};


RAM.prototype.store = function(address, value) {
  this.uint8[address] = value;
};

