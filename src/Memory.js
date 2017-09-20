import {Utility} from './Utility.js';


/**
 * Generic 8bit-word Memory.
 */

/**
 * @param {ArrayBuffer|integer} arg -
 */
function Memory(arg) {
  this.data = new Uint8Array(arg);
}

Object.assign(Memory.prototype, {
  isMemory: true,

  /**
   *
   */
  clear: function() {
    for(var i = 0, il = this.getCapacity(); i < il; i++)
      this.storeWithoutMapping(i, 0);
  },

  /**
   *
   */
  getCapacity: function() {
    return this.data.byteLength;
  },

  /**
   *
   */
  load: function(address) {
    return this.data[address];
  },

  /**
   *
   */
  loadWithoutMapping: function(address) {
    return this.data[address];
  },

  /**
   *
   */
  store: function(address, value) {
    this.data[address] = value;
  },

  /**
   *
   */
  storeWithoutMapping: function(address, value) {
    this.data[address] = value;
  },

  /**
   *
   */
  dump: function() {
    var buffer = '';
    var previousIsZeroLine = false;
    var offset = this._getStartDumpAddress();
    var end = this._getEndDumpAddress();
    for(var i = offset; i < end; i++) {
      if(i % 0x10 === 0) {
        if(previousIsZeroLine) {
          var skipZero = false;
          while(this._checkNext16BytesIsZero(i+0x10)) {
            i += 0x10;
            skipZero = true;
          }
          if(skipZero)
            buffer += '...\n';
        }
        buffer += Utility.convertDecToHexString(i-offset, 4) + ' ';
        previousIsZeroLine = true;
      }

      var value = this._loadForDump(i);
      buffer += Utility.convertDecToHexString(value, 2, true) + ' ';
      if(value != 0)
        previousIsZeroLine = false;

      if(i % 0x10 === 0xf)
        buffer += '\n';
    }
    return buffer;
  },

  /**
   *
   */
  _loadForDump: function(address) {
    return this.loadWithoutMapping(address);
  },

  /**
   *
   */
  _getStartDumpAddress: function() {
    return 0;
  },

  /**
   *
   */
  _getEndDumpAddress: function() {
    return this.getCapacity();
  },

  /**
   *
   */
  _checkNext16BytesIsZero: function(offset) {
    if(offset + 0x10 >= this._getEndDumpAddress())
      return false;

    var sum = 0;
    for(var i = offset; i < offset + 0x10; i++) {
      sum += this._loadForDump(i);
    }
    return sum === 0;
  }
});


export {Memory};
