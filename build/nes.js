/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Register8bit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Register16bit; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Utility_js__ = __webpack_require__(1);



/**
 * General Register implementation.
 * Specific register for CPU and PPU are implemented in each class.
 */

/**
 *
 */
function Register(type) {
  this.data = new type(1);  // Uint8Array or Uint16Array
  this.data[0] = 0;
}

Register.TYPE_8BIT = Uint8Array;
Register.TYPE_16BIT = Uint16Array;

Object.assign(Register.prototype, {
  isRegister: true,

  /**
   *
   */
  getWidth: function() {
    return this.data.byteLength * 8;
  },

  /**
   *
   */
  load: function() {
    return this.data[0];
  },

  /**
   *
   */
  loadBit: function(pos) {
    return (this.data[0] >> pos) & 1;
  },

  /**
   *
   */
  loadBits: function(offset, size) {
    return (this.data[0] >> offset) & ((1 << size) - 1);
  },

  /**
   *
   */
  store: function(value) {
    this.data[0] = value;
  },

  /**
   *
   */
  storeBit: function(pos, value) {
    value = value & 1;  // just in case
    this.data[0] = this.data[0] & ~(1 << pos) | (value << pos);
  },

  /**
   *
   */
  storeBits: function(offset, size, value) {
    var mask = (1 << size) - 1;
    value = value & mask;  // just in case
    this.data[0] = this.data[0] & ~(mask << offset) | (value << offset);
  },

  /**
   *
   */
  clear: function() {
    this.data[0] = 0;
  },

  /**
   *
   */
  setBit: function(pos) {
    this.storeBit(pos, 1);
  },

  /**
   *
   */
  clearBit: function(pos) {
    this.storeBit(pos, 0);
  },

  /**
   *
   */
  isBitSet: function(pos) {
    return this.loadBit(pos) === 1;
  },

  /**
   *
   */
  increment: function() {
    this.data[0]++;
  },

  /**
   *
   */
  incrementBy2: function() {
    this.data[0] += 2;
  },

  /**
   *
   */
  add: function(value) {
    this.data[0] += value;
  },

  /**
   *
   */
  decrement: function() {
    this.data[0]--;
  },

  /**
   *
   */
  decrementBy2: function() {
    this.data[0] -= 2;
  },

  /**
   *
   */
  sub: function(value) {
    this.data[0] -= value;
  },

  /**
   *
   */
  shift: function(value) {
    value = value & 1;  // just in case
    var carry = this.loadBit(this.getWidth() - 1);
    this.data[0] = (this.data[0] << 1) | value;
    return carry;
  },

  /**
   *
   */
  dump: function() {
    return __WEBPACK_IMPORTED_MODULE_0__Utility_js__["a" /* Utility */].convertDecToHexString(this.load(), this.getWidth() / 4);
  }
});

/**
 *
 */
function Register8bit() {
  Register.call(this, Register.TYPE_8BIT);
}

Register8bit.prototype = Object.assign(Object.create(Register.prototype), {
  isRegister8bit: true
});

/**
 *
 */
function Register16bit() {
  Register.call(this, Register.TYPE_16BIT);
  this.bytes = new Uint8Array(this.data.buffer);
}

Register16bit.prototype = Object.assign(Object.create(Register.prototype), {
  isRegister16bit: true,

  /**
   *
   */
  loadHigherByte: function() {
    return this.bytes[1];
  },

  /**
   *
   */
  loadLowerByte: function() {
    return this.bytes[0];
  },

  /**
   *
   */
  storeHigherByte: function(value) {
    this.bytes[1] = value;
  },

  /**
   *
   */
  storeLowerByte: function(value) {
    this.bytes[0] = value;
  }
});




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Utility; });
function Utility() {

}

/**
 *
 */
Utility.convertDecToHexString = function(num, width, noPrefix) {
  var str = num.toString(16);

  var prefix = '';

  if(num < 0)
    prefix += '-';

  if(noPrefix !== true)
    prefix += '0x';

  if(width === undefined)
    return prefix + str;

  var base = '';

  for(var i = 0; i < width; i++)
    base += '0';

  return prefix + (base + str).substr(-1 * width);
};





/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Memory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Utility_js__ = __webpack_require__(1);



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
        buffer += __WEBPACK_IMPORTED_MODULE_0__Utility_js__["a" /* Utility */].convertDecToHexString(i-offset, 4) + ' ';
        previousIsZeroLine = true;
      }

      var value = this._loadForDump(i);
      buffer += __WEBPACK_IMPORTED_MODULE_0__Utility_js__["a" /* Utility */].convertDecToHexString(value, 2, true) + ' ';
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





/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Joypad; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Register_js__ = __webpack_require__(0);



/**
 * Standard joypad implementation.
 * Refer to https://wiki.nesdev.com/w/index.php/Standard_controller
 */
function Joypad() {
  this.register = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();

  this.latch = 0;
  this.currentButton = 0;

  this.buttonNum = this.getButtonsNum();

  this.buttons = [];  // if buttons are being pressed.
                      // index is corresponded to Joypad.BUTTONS'
  for(var i = 0; i < this.buttonNum; i++)
    this.buttons[i] = false;
}

//

Joypad.BUTTONS = {
  A:      0,
  B:      1,
  SELECT: 2,
  START:  3,
  UP:     4,
  DOWN:   5,
  LEFT:   6,
  RIGHT:  7
};

//

Object.assign(Joypad.prototype, {
  isJoypad: true,

  //

  /**
   *
   */
  getButtonsNum: function() {
    var num = 0;
    for (var key in Joypad.BUTTONS) {
      num++;
    }
    return num;
  },

  //

  /**
   *
   */
  pressButton: function(type) {
    this.buttons[type] = true;
  },

  /**
   *
   */
  releaseButton: function(type) {
    this.buttons[type] = false;
  },

  //

  /**
   *
   */
  loadRegister: function() {
    var button = this.latch === 1 ? 0 : this.currentButton++;

    // 1: a button is being pressed or after eight reads
    // 0: otherwise
    var value = (button >= this.buttonNum || this.buttons[button]) ? 1 : 0;

    return value;
  },

  /**
   *
   */
  storeRegister: function(value) {
    this.register.store(value);

    value = value & 1;

    if (value === 1)
      this.currentButton = 0;

    this.latch = value;
  },

  // dump

  /**
   *
   */
  dump: function() {

  }
});





/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_Nes_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_Rom_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__src_Audio_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__src_Display_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__src_Joypad_js__ = __webpack_require__(3);






function NesJs() {}

NesJs.Nes = __WEBPACK_IMPORTED_MODULE_0__src_Nes_js__["a" /* Nes */];
NesJs.Rom = __WEBPACK_IMPORTED_MODULE_1__src_Rom_js__["a" /* Rom */];
NesJs.Audio = __WEBPACK_IMPORTED_MODULE_2__src_Audio_js__["a" /* Audio */];
NesJs.Display = __WEBPACK_IMPORTED_MODULE_3__src_Display_js__["a" /* Display */];
NesJs.Joypad = __WEBPACK_IMPORTED_MODULE_4__src_Joypad_js__["a" /* Joypad */];

if(window !== undefined)
  window.NesJs = NesJs;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Nes; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Cpu_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Ppu_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Apu_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Joypad_js__ = __webpack_require__(3);





/**
 *
 */
function Nes() {
  this.ppu = new __WEBPACK_IMPORTED_MODULE_1__Ppu_js__["a" /* Ppu */]();
  this.cpu = new __WEBPACK_IMPORTED_MODULE_0__Cpu_js__["a" /* Cpu */]();
  this.apu = new __WEBPACK_IMPORTED_MODULE_2__Apu_js__["a" /* Apu */]();
  this.pad1 = new __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */]();
  this.pad2 = new __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */]();

  this.rom = null;  // set by .setRom()

  //

  this.cpu.setPpu(this.ppu);
  this.cpu.setApu(this.apu);
  this.cpu.setJoypad1(this.pad1);
  this.cpu.setJoypad2(this.pad2);

  this.ppu.setCpu(this.cpu);

  this.apu.setCpu(this.cpu);

  //

  this.state = this.STATES.POWER_OFF;

  //

  this.audioEnabled = false;

  // for requestAnimationFrame()

  var self = this;
  this.runFunc = function() { self.run(); };

  // event listeners

  this.onFpsUpdates = [];
}

Object.assign(Nes.prototype, {
  isNes: true,

  //

  STATES: {
    POWER_OFF: 0,
    RUN: 1,
    STOP: 2
  },

  KEY_TO_PAD_BUTTONS: {
    13: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.START,   // enter
    32: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.SELECT,  // space
    37: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.LEFT,    // left arrow
    38: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.UP,      // up arrow
    39: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.RIGHT,   // right arrow
    40: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.DOWN,    // down arrow
    88: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.A,       // x
    90: __WEBPACK_IMPORTED_MODULE_3__Joypad_js__["a" /* Joypad */].BUTTONS.B        // z
  },

  // event listeners

  /**
   * Registered callbacks will be invoked when
   *   'fps': FPS number is updated
   */
  addEventListener: function(type, func) {
    switch(type) {
      case 'fps':
        this.onFpsUpdates.push(func);
        break;

      default:
        throw new Error('Nes.addEventListener: unknown type ' + type);
    }
  },

  invokeFpsUpdateListeners: function(fps) {
    for(var i = 0, il = this.onFpsUpdates.length; i < il; i++) {
      this.onFpsUpdates[i](fps);
    }
  },

  //

  /**
   *
   */
  setRom: function(rom) {
    this.rom = rom;
    this.cpu.setRom(rom);
    this.ppu.setRom(rom);
  },

  /**
   *
   */
  setDisplay: function(display) {
    this.ppu.setDisplay(display);
  },

  /**
   *
   */
  setAudio: function(audio) {
    this.apu.setAudio(audio);
    this.audioEnabled = true;
  },

  /**
   *
   */
  bootup: function() {
    this.cpu.bootup();
    this.ppu.bootup();
    this.apu.bootup();
    this.state = this.STATES.RUN;
  },

  /**
   *
   */
  reset: function() {
    this.cpu.reset();
    this.ppu.reset();
    this.apu.reset();
  },

  /**
   *
   */
  stop: function() {
    this.state = this.STATES.STOP;
  },

  /**
   *
   */
  resume: function() {
    this.state = this.STATES.RUN;
    this.run();
  },

  /**
   *
   */
  run: function() {
    this.measureFps();

    var cycles = (341 * 262 / 3) | 0; // TODO: temporal
    for(var i = 0; i < cycles; i++) {
      this.runCycle();
    }

    if(this.state === this.STATES.RUN)
      requestAnimationFrame(this.runFunc);
  },

  /**
   *
   */
  runCycle: function() {
    this.cpu.runCycle();
    this.ppu.runCycle();
    this.ppu.runCycle();
    this.ppu.runCycle();

    if(this.audioEnabled === true)
      this.apu.runCycle();
  },

  /**
   *
   */
  runStep: function() {
    if(this.state !== this.STATES.STOP)
      return;

    do {
      this.runCycle();
    } while(this.cpu.isStall())
  },

  // key input handlers

  handleKeyDown: function(e) {
    if(this.KEY_TO_PAD_BUTTONS[e.keyCode] !== undefined)
      this.pad1.pressButton(this.KEY_TO_PAD_BUTTONS[e.keyCode]);
    e.preventDefault();
  },

  handleKeyUp: function(e) {
    if(this.KEY_TO_PAD_BUTTONS[e.keyCode] !== undefined)
      this.pad1.releaseButton(this.KEY_TO_PAD_BUTTONS[e.keyCode]);
    e.preventDefault();
  },

  //

  measureFps: function() {
    var oldTime = null;
    var frame = 0;

    return function measureFps() {
      if(frame === 60) {
        var newTime = performance.now();

        if (oldTime !== null)
          this.invokeFpsUpdateListeners(60000 / (newTime - oldTime));

        oldTime = newTime;
        frame = 0;
      }
      frame++;
    };
  }(),

  // dump methods

  dumpCpu: function() {
    return this.cpu.dump();
  },

  dumpRam: function() {
    return this.cpu.dumpRAM();
  },

  dumpRom: function() {
    var buffer = '';
    buffer += this.rom.dumpHeader();
    buffer += '\n';
    buffer += this.rom.dump();
    buffer += '\n';
    buffer += this.cpu.disassembleROM();
    buffer += '\n';
    return buffer;
  },

  dumpPpu: function() {
    return this.ppu.dump();
  },

  dumpVRam: function() {
    return this.ppu.dumpVRAM();
  },

  dumpSprRam: function() {
    return this.ppu.dumpSPRRAM();
  }
});





/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Cpu; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Register_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Memory_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Utility_js__ = __webpack_require__(1);




/**
 * Ricoh 6502
 * Refer to https://wiki.nesdev.com/w/index.php/CPU
 */
function Cpu() {

  // registers

  this.pc = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["a" /* Register16bit */]();
  this.sp = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.a = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.x = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.y = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.p = new CpuStatusRegister();

  // CPU inside RAM

  this.ram = new __WEBPACK_IMPORTED_MODULE_1__Memory_js__["a" /* Memory */](64 * 1024);  // 64KB

  // other devices

  this.ppu = null;  // set by setPpu()
  this.apu = null;  // set by setApu()
  this.pad1 = null; // set by setJoypad1()
  this.pad2 = null; // set by setJoypad2()

  // cartridge ROM

  this.rom = null;  // set by setRom()

  // Executing an instruction takes 1, 2, or more cycles.
  // .stallCycle represents the number of cycles left to
  // complete the currently executed instruction.

  this.stallCycle = 0;
}

// Interrups

Cpu.INTERRUPTS = {
  NMI:   0,
  RESET: 1,
  IRQ:   2,
  BRK:   3  // not interrupt but instruction
};

Cpu.INTERRUPT_HANDLER_ADDRESSES = [];
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.NMI]   = 0xFFFA;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.RESET] = 0xFFFC;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.IRQ]   = 0xFFFE;
Cpu.INTERRUPT_HANDLER_ADDRESSES[Cpu.INTERRUPTS.BRK]   = 0xFFFE;

// Instructions

Cpu.INSTRUCTIONS = {
  INV: {'id':  0, 'name': 'inv'}, // Invalid
  ADC: {'id':  1, 'name': 'adc'},
  AND: {'id':  2, 'name': 'and'},
  ASL: {'id':  3, 'name': 'asl'},
  BCC: {'id':  4, 'name': 'bcc'},
  BCS: {'id':  5, 'name': 'bcs'},
  BEQ: {'id':  6, 'name': 'beq'},
  BIT: {'id':  7, 'name': 'bit'},
  BMI: {'id':  8, 'name': 'bmi'},
  BNE: {'id':  9, 'name': 'bne'},
  BPL: {'id': 10, 'name': 'bpl'},
  BRK: {'id': 11, 'name': 'brk'},
  BVC: {'id': 12, 'name': 'bvc'},
  BVS: {'id': 13, 'name': 'bvs'},
  CLC: {'id': 14, 'name': 'clc'},
  CLD: {'id': 15, 'name': 'cld'},
  CLI: {'id': 16, 'name': 'cli'},
  CLV: {'id': 17, 'name': 'clv'},
  CMP: {'id': 18, 'name': 'cmp'},
  CPX: {'id': 19, 'name': 'cpx'},
  CPY: {'id': 20, 'name': 'cpy'},
  DEC: {'id': 21, 'name': 'dec'},
  DEX: {'id': 22, 'name': 'dex'},
  DEY: {'id': 23, 'name': 'dey'},
  EOR: {'id': 24, 'name': 'eor'},
  INC: {'id': 25, 'name': 'inc'},
  INX: {'id': 26, 'name': 'inx'},
  INY: {'id': 27, 'name': 'iny'},
  JMP: {'id': 28, 'name': 'jmp'},
  JSR: {'id': 29, 'name': 'jsr'},
  LDA: {'id': 30, 'name': 'lda'},
  LDX: {'id': 31, 'name': 'ldx'},
  LDY: {'id': 32, 'name': 'ldy'},
  LSR: {'id': 33, 'name': 'lsr'},
  NOP: {'id': 34, 'name': 'nop'},
  ORA: {'id': 35, 'name': 'ora'},
  PHA: {'id': 36, 'name': 'pha'},
  PHP: {'id': 37, 'name': 'php'},
  PLA: {'id': 38, 'name': 'pla'},
  PLP: {'id': 39, 'name': 'plp'},
  ROL: {'id': 40, 'name': 'rol'},
  ROR: {'id': 41, 'name': 'ror'},
  RTI: {'id': 42, 'name': 'rti'},
  RTS: {'id': 43, 'name': 'rts'},
  SBC: {'id': 44, 'name': 'sbc'},
  SEC: {'id': 45, 'name': 'sec'},
  SED: {'id': 46, 'name': 'sed'},
  SEI: {'id': 47, 'name': 'sei'},
  STA: {'id': 48, 'name': 'sta'},
  STX: {'id': 49, 'name': 'stx'},
  STY: {'id': 50, 'name': 'sty'},
  TAX: {'id': 51, 'name': 'tax'},
  TAY: {'id': 52, 'name': 'tay'},
  TSX: {'id': 53, 'name': 'tsx'},
  TXA: {'id': 54, 'name': 'txa'},
  TXS: {'id': 55, 'name': 'txs'},
  TYA: {'id': 56, 'name': 'tya'}
};

// Addressing modes

Cpu.ADDRESSINGS = {
  IMMEDIATE:           {'id':  0, 'pc': 2, 'name': 'immediate'},
  ABSOLUTE:            {'id':  1, 'pc': 3, 'name': 'absolute'},
  INDEXED_ABSOLUTE_X:  {'id':  2, 'pc': 3, 'name': 'indexed_absolute_x'},
  INDEXED_ABSOLUTE_Y:  {'id':  3, 'pc': 3, 'name': 'indexed_absolute_y'},
  ZERO_PAGE:           {'id':  4, 'pc': 2, 'name': 'zero_page'},
  INDEXED_ZERO_PAGE_X: {'id':  5, 'pc': 2, 'name': 'indexed_zero_page_x'},
  INDEXED_ZERO_PAGE_Y: {'id':  6, 'pc': 2, 'name': 'indexed_zero_page_y'},
  IMPLIED:             {'id':  7, 'pc': 1, 'name': 'implied'},
  ACCUMULATOR:         {'id':  8, 'pc': 1, 'name': 'accumulator'},
  INDIRECT:            {'id':  9, 'pc': 3, 'name': 'indirect'},
  INDEXED_INDIRECT_X:  {'id': 10, 'pc': 2, 'name': 'indexed_indirect_x'},
  INDEXED_INDIRECT_Y:  {'id': 11, 'pc': 2, 'name': 'indexed_indirect_y'},
  RELATIVE:            {'id': 12, 'pc': 2, 'name': 'relative'}
};

// Operations (the combinations of interuction and addressing mode)
// Decoding in advance because it's much easier than implementing decoder.

Cpu.OPS = [
  /* 0x00 */ {'instruction': Cpu.INSTRUCTIONS.BRK, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x01 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x02 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x03 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x04 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x05 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x06 */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x07 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x08 */ {'instruction': Cpu.INSTRUCTIONS.PHP, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x09 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x0A */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x0B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x0C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x0D */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x0E */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x0F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x10 */ {'instruction': Cpu.INSTRUCTIONS.BPL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x11 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x12 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x13 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x14 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x15 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x16 */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x17 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x18 */ {'instruction': Cpu.INSTRUCTIONS.CLC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x19 */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x1A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x1D */ {'instruction': Cpu.INSTRUCTIONS.ORA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x1E */ {'instruction': Cpu.INSTRUCTIONS.ASL, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x1F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x20 */ {'instruction': Cpu.INSTRUCTIONS.JSR, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x21 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x22 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x23 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x24 */ {'instruction': Cpu.INSTRUCTIONS.BIT, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x25 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x26 */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x27 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x28 */ {'instruction': Cpu.INSTRUCTIONS.PLP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x29 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x2A */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x2B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x2C */ {'instruction': Cpu.INSTRUCTIONS.BIT, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2D */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2E */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x2F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x30 */ {'instruction': Cpu.INSTRUCTIONS.BMI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x31 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x32 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x33 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x34 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x35 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x36 */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x37 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x38 */ {'instruction': Cpu.INSTRUCTIONS.SEC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x39 */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x3A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x3D */ {'instruction': Cpu.INSTRUCTIONS.AND, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x3E */ {'instruction': Cpu.INSTRUCTIONS.ROL, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x3F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x40 */ {'instruction': Cpu.INSTRUCTIONS.RTI, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x41 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x42 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x43 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x44 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x45 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x46 */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x47 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x48 */ {'instruction': Cpu.INSTRUCTIONS.PHA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x49 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x4A */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x4B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x4C */ {'instruction': Cpu.INSTRUCTIONS.JMP, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4D */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4E */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x4F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x50 */ {'instruction': Cpu.INSTRUCTIONS.BVC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x51 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x52 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x53 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x54 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x55 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x56 */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x57 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x58 */ {'instruction': Cpu.INSTRUCTIONS.CLI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x59 */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x5A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x5D */ {'instruction': Cpu.INSTRUCTIONS.EOR, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x5E */ {'instruction': Cpu.INSTRUCTIONS.LSR, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x5F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x60 */ {'instruction': Cpu.INSTRUCTIONS.RTS, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x61 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x62 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x63 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x64 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x65 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x66 */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x67 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x68 */ {'instruction': Cpu.INSTRUCTIONS.PLA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x69 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0x6A */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.ACCUMULATOR},
  /* 0x6B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x6C */ {'instruction': Cpu.INSTRUCTIONS.JMP, 'cycle': 0, 'mode': Cpu.ADDRESSINGS.INDIRECT},
  /* 0x6D */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x6E */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x6F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x70 */ {'instruction': Cpu.INSTRUCTIONS.BVS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x71 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x72 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x73 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x74 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x75 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x76 */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x77 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x78 */ {'instruction': Cpu.INSTRUCTIONS.SEI, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x79 */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x7A */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x7D */ {'instruction': Cpu.INSTRUCTIONS.ADC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x7E */ {'instruction': Cpu.INSTRUCTIONS.ROR, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x7F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x80 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x81 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0x82 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x83 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x84 */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x85 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x86 */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0x87 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x88 */ {'instruction': Cpu.INSTRUCTIONS.DEY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x89 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x8A */ {'instruction': Cpu.INSTRUCTIONS.TXA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x8B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x8C */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8D */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8E */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0x8F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x90 */ {'instruction': Cpu.INSTRUCTIONS.BCC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0x91 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0x92 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x93 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x94 */ {'instruction': Cpu.INSTRUCTIONS.STY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x95 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0x96 */ {'instruction': Cpu.INSTRUCTIONS.STX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_Y},
  /* 0x97 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0x98 */ {'instruction': Cpu.INSTRUCTIONS.TYA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x99 */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0x9A */ {'instruction': Cpu.INSTRUCTIONS.TXS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0x9B */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9C */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9D */ {'instruction': Cpu.INSTRUCTIONS.STA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0x9E */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0x9F */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xA0 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xA1 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xA2 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xA3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xA4 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA5 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA6 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xA7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xA8 */ {'instruction': Cpu.INSTRUCTIONS.TAY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xA9 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xAA */ {'instruction': Cpu.INSTRUCTIONS.TAX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xAB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xAC */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAD */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAE */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xAF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xB0 */ {'instruction': Cpu.INSTRUCTIONS.BCS, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xB1 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xB2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xB3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xB4 */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xB5 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xB6 */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_Y},
  /* 0xB7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xB8 */ {'instruction': Cpu.INSTRUCTIONS.CLV, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xB9 */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xBA */ {'instruction': Cpu.INSTRUCTIONS.TSX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xBB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xBC */ {'instruction': Cpu.INSTRUCTIONS.LDY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xBD */ {'instruction': Cpu.INSTRUCTIONS.LDA, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xBE */ {'instruction': Cpu.INSTRUCTIONS.LDX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xBF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xC0 */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xC1 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xC2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xC3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xC4 */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC5 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC6 */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xC7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xC8 */ {'instruction': Cpu.INSTRUCTIONS.INY, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xC9 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xCA */ {'instruction': Cpu.INSTRUCTIONS.DEX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xCB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xCC */ {'instruction': Cpu.INSTRUCTIONS.CPY, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCD */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCE */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xCF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xD0 */ {'instruction': Cpu.INSTRUCTIONS.BNE, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xD1 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xD2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD4 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xD5 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xD6 */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xD7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xD8 */ {'instruction': Cpu.INSTRUCTIONS.CLD, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xD9 */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xDA */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDC */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xDD */ {'instruction': Cpu.INSTRUCTIONS.CMP, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xDE */ {'instruction': Cpu.INSTRUCTIONS.DEC, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xDF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xE0 */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xE1 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_X},
  /* 0xE2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xE3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xE4 */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE5 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 3, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE6 */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.ZERO_PAGE},
  /* 0xE7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xE8 */ {'instruction': Cpu.INSTRUCTIONS.INX, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xE9 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMMEDIATE},
  /* 0xEA */ {'instruction': Cpu.INSTRUCTIONS.NOP, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xEB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xEC */ {'instruction': Cpu.INSTRUCTIONS.CPX, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xED */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xEE */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.ABSOLUTE},
  /* 0xEF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xF0 */ {'instruction': Cpu.INSTRUCTIONS.BEQ, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.RELATIVE},
  /* 0xF1 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 5, 'mode': Cpu.ADDRESSINGS.INDEXED_INDIRECT_Y},
  /* 0xF2 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF3 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF4 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xF5 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xF6 */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 6, 'mode': Cpu.ADDRESSINGS.INDEXED_ZERO_PAGE_X},
  /* 0xF7 */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},

  /* 0xF8 */ {'instruction': Cpu.INSTRUCTIONS.SED, 'cycle': 2, 'mode': Cpu.ADDRESSINGS.IMPLIED},
  /* 0xF9 */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_Y},
  /* 0xFA */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFB */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFC */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null},
  /* 0xFD */ {'instruction': Cpu.INSTRUCTIONS.SBC, 'cycle': 4, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xFE */ {'instruction': Cpu.INSTRUCTIONS.INC, 'cycle': 7, 'mode': Cpu.ADDRESSINGS.INDEXED_ABSOLUTE_X},
  /* 0xFF */ {'instruction': Cpu.INSTRUCTIONS.INV, 'cycle': 0, 'mode': null}
];

Object.assign(Cpu.prototype, {
  isCpu: true,

  //

  INTERRUPTS: Cpu.INTERRUPTS,
  INTERRUPT_HANDLER_ADDRESSES: Cpu.INTERRUPT_HANDLER_ADDRESSES,
  ADDRESSINGS: Cpu.ADDRESSINGS,
  INSTRUCTIONS: Cpu.INSTRUCTIONS,
  OPS: Cpu.OPS,

  // public methods

  // set methods

  /**
   *
   */
  setPpu: function(ppu) {
    this.ppu = ppu;
  },

  /**
   *
   */
  setApu: function(apu) {
    this.apu = apu;
  },

  /**
   *
   */
  setJoypad1: function(pad1) {
    this.pad1 = pad1;
  },

  /**
   *
   */
  setJoypad2: function(pad2) {
    this.pad2 = pad2;
  },

  /**
   *
   */
  setRom: function(rom) {
    this.rom = rom;
  },

  //

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/CPU_power_up_state
   */
  bootup: function() {
    this.p.store(0x34);
    this.a.clear();
    this.x.clear();
    this.y.clear();
    this.sp.store(0xFD);

    for(var i = 0; i < 0xF; i++)
      this.store(0x4000 + i, 0);

    this.store(0x4015, 0);
    this.store(0x4017, 0);

    this.interrupt(this.INTERRUPTS.RESET);
  },

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/CPU_power_up_state
   */
  reset: function() {
    this.sp.sub(3);
    this.p.setI();
    this.interrupt(this.INTERRUPTS.RESET);
  },

  /**
   *
   */
  runCycle: function() {
    if(this.isStall() !== true) {
      var opc = this.fetch();
      var op = this.decode(opc);

      this.operate(op, opc);
      this.stallCycle = op.cycle;
    }

    this.stallCycle--;
  },

  /**
   *
   */
  isStall: function() {
    return this.stallCycle > 0;
  },

  /**
   *
   */
  interrupt: function(type) {
    if(type === this.INTERRUPTS.IRQ && this.p.isI() === true)
      return;

    if(type !== this.INTERRUPTS.RESET) {
      if(type !== this.INTERRUPTS.BRK)
        this.p.clearB();

      this.p.setA();

      this.pushStack2Bytes(this.pc.load());
      this.pushStack(this.p.load());
      this.p.setI();
    }

    this.jumpToInterruptHandler(type);
  },

  // load/store methods

  /**
   *
   */
  load: function(address) {
    address = address & 0xFFFF;  // just in case

    // 0x0000 - 0x07FF: 2KB internal RAM
    // 0x0800 - 0x1FFF: Mirrors of 0x0000 - 0x07FF (repeats every 0x800 bytes)

    if(address >= 0 && address < 0x2000)
      return this.ram.load(address & 0x07FF);

    // 0x2000 - 0x2007: PPU registers
    // 0x2008 - 0x3FFF: Mirrors of 0x2000 - 0x2007 (repeats every 8 bytes)

    if(address >= 0x2000 && address < 0x4000)
      return this.ppu.loadRegister(address & 0x2007);

    // 0x4000 - 0x4017: APU, PPU and I/O registers
    // 0x4018 - 0x401F: APU and I/O functionality that is normally disabled

    if(address >= 0x4000 && address < 0x4014)
      return this.apu.loadRegister(address);

    if(address === 0x4014)
      return this.ppu.loadRegister(address);

    if(address === 0x4015)
      return this.apu.loadRegister(address);

    if(address === 0x4016)
      return this.pad1.loadRegister();

    if(address >= 0x4017 && address < 0x4020)
      return this.apu.loadRegister(address);

    // cartridge space

    if(address >= 0x4020 && address < 0x6000)
      return this.ram.load(address);

    // 0x6000 - 0x7FFF: Battery Backed Save or Work RAM

    if(address >= 0x6000 && address < 0x8000)
      return this.ram.load(address);

    // 0x8000 - 0xFFFF: ROM
    if(address >= 0x8000 && address < 0x10000)
      return this.rom.load(address);
  },

  /**
   *
   */
  store: function(address, value) {
    address = address & 0xFFFF;  // just in case

    // 0x0000 - 0x07FF: 2KB internal RAM
    // 0x0800 - 0x1FFF: Mirrors of 0x0000 - 0x07FF (repeats every 0x800 bytes)

    if(address >= 0 && address < 0x2000)
      return this.ram.store(address & 0x07FF, value);

    // 0x2000 - 0x2007: PPU registers
    // 0x2008 - 0x3FFF: Mirrors of 0x2000 - 0x2007 (repeats every 8 bytes)

    if(address >= 0x2000 && address < 0x4000)
      return this.ppu.storeRegister(address & 0x2007, value);

    // 0x4000 - 0x4017: APU, PPU and I/O registers
    // 0x4018 - 0x401F: APU and I/O functionality that is normally disabled

    if(address >= 0x4000 && address < 0x4014)
      return this.apu.storeRegister(address, value);

    if(address === 0x4014)
      return this.ppu.storeRegister(address, value);

    if(address === 0x4015)
      return this.apu.storeRegister(address, value);

    if(address === 0x4016)
      return this.pad1.storeRegister(value);

    if(address >= 0x4017 && address < 0x4020)
      return this.apu.storeRegister(address, value);

    // cartridge space

    if(address >= 0x4020 && address < 0x6000)
      return this.ram.store(address, value);

    // 0x6000 - 0x7FFF: Battery Backed Save or Work RAM

    if(address >= 0x6000 && address < 0x8000)
      return this.ram.store(address, value);

    // 0x8000 - 0xFFFF: ROM
    if(address >= 0x8000 && address < 0x10000)
      return this.rom.store(address, value);
  },

  // private methods

  // load/store methods

  /**
   *
   */
  load2Bytes: function(address) {
    return this.load(address) | (this.load(address + 1) << 8);
  },

  /**
   *
   */
  load2BytesFromZeropage: function(address) {
    return this.ram.load(address & 0xff) | (this.ram.load((address + 1) & 0xff) << 8);
  },

  /**
   *
   */
  load2BytesInPage: function(address) {
    var addr1 = address;
    var addr2 = (address & 0xff00) | ((address + 1) & 0xff);
    return this.load(addr1) | (this.load(addr2) << 8);
  },

  /**
   *
   */
  store2Bytes: function(address, value) {
    this.store(address, value);
    this.store(address + 1, value >> 8);
  },

  // processing methods

  /**
   *
   */
  fetch: function() {
    var opc = this.load(this.pc.load());
    this.pc.increment();
    return opc;
  },

  /**
   *
   */
  decode: function(opc) {
    return this.OPS[opc];
  },

  /**
   *
   */
  jumpToInterruptHandler: function(type) {
    this.pc.store(this.load2Bytes(this.INTERRUPT_HANDLER_ADDRESSES[type]));
  },

  //

  /**
   *
   */
  loadWithAddressingMode: function(op) {
    if(op.mode.id === this.ADDRESSINGS.ACCUMULATOR.id)
      return this.a.load();

    var address = this.getAddressWithAddressingMode(op);
    var value = this.load(address);

    // expects that relative addressing mode is used only for load.
    if(op.mode.id === this.ADDRESSINGS.RELATIVE.id) {
      // TODO: confirm if this logic is right.
      if(value & 0x80)
        value = value | 0xff00;
    }

    return value;
  },

  storeWithAddressingMode: function(op, value) {
    if(op.mode.id === this.ADDRESSINGS.ACCUMULATOR.id) {
      this.a.store(value);
      return;
    }

    var address = this.getAddressWithAddressingMode(op);
    this.store(address, value);
  },

  updateMemoryWithAddressingMode: function(op, func) {
    var address;
    var src;

    if(op.mode.id == this.ADDRESSINGS.ACCUMULATOR.id) {
      src = this.a.load();
    } else {
      address = this.getAddressWithAddressingMode(op);
      src = this.load(address);
    }

    var result = func(src);

    if(op.mode.id == this.ADDRESSINGS.ACCUMULATOR.id) {
      this.a.store(result);
    } else {
      this.store(address, result);
    }
  },

  getAddressWithAddressingMode: function(op) {
    var address = null;

    switch(op.mode.id) {
      case this.ADDRESSINGS.IMMEDIATE.id:
      case this.ADDRESSINGS.RELATIVE.id:
        address = this.pc.load();
        this.pc.increment();
        break;

      case this.ADDRESSINGS.ABSOLUTE.id:
      case this.ADDRESSINGS.INDEXED_ABSOLUTE_X.id:
      case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y.id:
        address = this.load2Bytes(this.pc.load());
        this.pc.incrementBy2();
        switch(op.mode.id) {
          case this.ADDRESSINGS.INDEXED_ABSOLUTE_X.id:
            address += this.x.load();
            break;
          case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y.id:
            address += this.y.load();
            break;
        }
        address = address & 0xffff;
        break;

      case this.ADDRESSINGS.ZERO_PAGE.id:
      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X.id:
      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y.id:
        address = this.load(this.pc.load());
        this.pc.increment();
        switch(op.mode.id) {
          case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X.id:
          address += this.x.load();
          break;
          case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y.id:
          address += this.y.load();
          break;
        }
        address = address & 0xff;
        break;

      case this.ADDRESSINGS.INDIRECT.id:
        var tmp = this.load2Bytes(this.pc.load());
        this.pc.incrementBy2();
        address = this.load2BytesInPage(tmp);
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_X.id:
        var tmp = this.load(this.pc.load());
        this.pc.increment();
        tmp += this.x.load();
        tmp = tmp & 0xff;
        address = this.load2BytesFromZeropage(tmp);
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_Y.id:
        var tmp = this.load(this.pc.load());
        this.pc.increment();
        address = this.load2BytesFromZeropage(tmp);
        address += this.y.load();
        address = address & 0xffff;
        break;

      default:
        throw new Error('Cpu: Unkown addressing mode.');
        break;
    }
    return address;
  },

  /**
   *
   */
  updateN: function(value) {
    if((value & 0x80) === 0)
      this.p.clearN();
    else
      this.p.setN();
  },

  /**
   *
   */
  updateZ: function(value) {
    if((value & 0xff) === 0)
      this.p.setZ();
    else
      this.p.clearZ();
  },

  /**
   *
   */
  updateC: function(value) {
    if((value & 0x100) === 0)
      this.p.clearC();
    else
      this.p.setC();
  },

  getStackAddress: function() {
    return this.sp.load() + 0x100;
  },

  pushStack: function(value) {
    this.store(this.getStackAddress(), value);
    this.sp.decrement();
  },

  pushStack2Bytes: function(value) {
    this.store(this.getStackAddress(), (value >> 8) & 0xff);
    this.sp.decrement();
    this.store(this.getStackAddress(), value & 0xff);
    this.sp.decrement();
  },

  popStack: function() {
    this.sp.increment();
    return this.load(this.getStackAddress());
  },

  popStack2Bytes: function() {
    this.sp.increment();
    var value = this.load(this.getStackAddress());
    this.sp.increment();
    return (this.load(this.getStackAddress()) << 8) | value;
  },

  doBranch: function(op, flag) {
    var result = this.loadWithAddressingMode(op);
    if(flag)
      this.pc.add(result);
  },

  operate: function(op, opc) {
    switch(op.instruction.id) {
      case this.INSTRUCTIONS.ADC.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var c = this.p.isC() ? 1 : 0;
        var result = src1 + src2 + c;
        this.a.store(result);
        this.updateN(result)
        this.updateZ(result)
        this.updateC(result)
        if(!((src1 ^ src2) & 0x80) && ((src2 ^ result) & 0x80))
          this.p.setV();
        else
          this.p.clearV();
        break;

      case this.INSTRUCTIONS.AND.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 & src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.ASL.id:
        var self = this;
        var func = function(src) {
          var result = src << 1;
          self.updateN(result)
          self.updateZ(result);
          self.updateC(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.BCC.id:
        this.doBranch(op, !this.p.isC());
        break;

      case this.INSTRUCTIONS.BCS.id:
        this.doBranch(op, this.p.isC());
        break;

      case this.INSTRUCTIONS.BEQ.id:
        this.doBranch(op, this.p.isZ());
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.BIT.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 & src2;
        this.updateN(src2);
        this.updateZ(result);
        if((src2 & 0x40) == 0)
          this.p.clearV();
        else
          this.p.setV();
        break;

      case this.INSTRUCTIONS.BMI.id:
        this.doBranch(op, this.p.isN());
        break;

      case this.INSTRUCTIONS.BNE.id:
        this.doBranch(op, !this.p.isZ());
        break;

      case this.INSTRUCTIONS.BPL.id:
        this.doBranch(op, !this.p.isN());
        break;

      case this.INSTRUCTIONS.BRK.id:
        this.pc.increment(); // seems like necessary
        this.p.setA();
        this.p.setB();
        this.interrupt(this.INTERRUPTS.BRK);
        break;

      case this.INSTRUCTIONS.BVC.id:
        this.doBranch(op, !this.p.isV());
        break;

      case this.INSTRUCTIONS.BVS.id:
        this.doBranch(op, this.p.isV());
        break;

      case this.INSTRUCTIONS.CLC.id:
        this.p.clearC();
        break;

      case this.INSTRUCTIONS.CLD.id:
        this.p.clearD();
        break;

      case this.INSTRUCTIONS.CLI.id:
        this.p.clearI();
        break;

      case this.INSTRUCTIONS.CLV.id:
        this.p.clearV();
        break;

      // TODO: separate?
      case this.INSTRUCTIONS.CMP.id:
      case this.INSTRUCTIONS.CPX.id:
      case this.INSTRUCTIONS.CPY.id:
        var src1;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.CMP.id:
            src1 = this.a.load();
            break;
          case this.INSTRUCTIONS.CPX.id:
            src1 = this.x.load();
            break;
          case this.INSTRUCTIONS.CPY.id:
            src1 = this.y.load();
            break;
        }
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 - src2;
        this.updateN(result);
        this.updateZ(result);
        if(src1 >= src2)
          this.p.setC();
        else
          this.p.clearC();
        break;

      case this.INSTRUCTIONS.DEC.id:
        var self = this;
        var func = function(src) {
          var result = src - 1;
          self.updateN(result);
          self.updateZ(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.DEX.id:
      case this.INSTRUCTIONS.DEY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.DEX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.DEY.id:
            reg = this.y;
            break;
        }
        var src1 = reg.load();
        var result = src1 - 1;
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.EOR.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 ^ src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.INC.id:
        var self = this;
        var func = function(src) {
          var result = src + 1;
          self.updateN(result);
          self.updateZ(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.INX.id:
      case this.INSTRUCTIONS.INY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.INX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.INY.id:
            reg = this.y;
            break;
        }
        var src1 = reg.load();
        var result = src1 + 1;
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      // TODO: check the logic.
      case this.INSTRUCTIONS.JMP.id:
        var address = this.getAddressWithAddressingMode(op);
        this.pc.store(address);
        break;

      // TODO: check the logic.
      case this.INSTRUCTIONS.JSR.id:
        var address = this.getAddressWithAddressingMode(op);
        this.pc.decrement();
        this.pushStack2Bytes(this.pc.load());
        this.pc.store(address);
        break;

      case this.INSTRUCTIONS.LDA.id:
      case this.INSTRUCTIONS.LDX.id:
      case this.INSTRUCTIONS.LDY.id:
        var result = this.loadWithAddressingMode(op);
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.LDA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.LDX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.LDY.id:
            reg = this.y;
            break;
        }
        reg.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.LSR.id:
        var self = this;
        var func = function(src) {
          var result = src >> 1;
          self.p.clearN();
          self.updateZ(result);
          if((src & 1) == 0)
            self.p.clearC();
          else
            self.p.setC();
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.NOP.id:
        break;

      case this.INSTRUCTIONS.ORA.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var result = src1 | src2;
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.PHA.id:
      case this.INSTRUCTIONS.PHP.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.PHA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.PHP.id:
            this.p.setA();
            this.p.setB();
            reg = this.p;
            break;
        }
        this.pushStack(reg.load());
        break;

      case this.INSTRUCTIONS.PLA.id:
        var result = this.popStack();
        this.a.store(result);
        this.updateN(result);
        this.updateZ(result);
        break;

      case this.INSTRUCTIONS.PLP.id:
        this.p.store(this.popStack());
        break;

      case this.INSTRUCTIONS.ROL.id:
        var self = this;
        var func = function(src) {
          var c = self.p.isC() ? 1 : 0;
          var result = (src << 1) | c;
          self.updateN(result);
          self.updateZ(result);
          self.updateC(result);
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      case this.INSTRUCTIONS.ROR.id:
        var self = this;
        var func = function(src) {
          var c = self.p.isC() ? 0x80 : 0x00;
          var result = (src >> 1) | c;
          self.updateN(result);
          self.updateZ(result);
          if((src & 1) == 0)
            self.p.clearC();
          else
            self.p.setC();
          return result;
        };
        this.updateMemoryWithAddressingMode(op, func);
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.RTI.id:
        this.p.store(this.popStack());
        this.pc.store(this.popStack2Bytes());
        break;

      // TODO: check logic.
      case this.INSTRUCTIONS.RTS.id:
        this.pc.store(this.popStack2Bytes() + 1);
        break;

      case this.INSTRUCTIONS.SBC.id:
        var src1 = this.a.load();
        var src2 = this.loadWithAddressingMode(op);
        var c = this.p.isC() ? 0 : 1;
        var result = src1 - src2 - c;
        this.a.store(result);
        this.updateN(result)
        this.updateZ(result)
        // TODO: check if this logic is right.
        if(src1 >= src2 + c) 
          this.p.setC();
        else
          this.p.clearC();
        // TODO: implement right overflow logic.
        //       this is just a temporal logic.
        if(((src1 ^ result) & 0x80) && ((src1 ^ src2) & 0x80))
          this.p.setV();
        else
          this.p.clearV();
        break;

      case this.INSTRUCTIONS.SEC.id:
        this.p.setC();
        break;

      case this.INSTRUCTIONS.SED.id:
        this.p.setD();
        break;

      case this.INSTRUCTIONS.SEI.id:
        this.p.setI();
        break;

      case this.INSTRUCTIONS.STA.id:
      case this.INSTRUCTIONS.STX.id:
      case this.INSTRUCTIONS.STY.id:
        var reg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.STA.id:
            reg = this.a;
            break;
          case this.INSTRUCTIONS.STX.id:
            reg = this.x;
            break;
          case this.INSTRUCTIONS.STY.id:
            reg = this.y;
            break;
        }
        this.storeWithAddressingMode(op, reg.load());
        break;

      case this.INSTRUCTIONS.TAX.id:
      case this.INSTRUCTIONS.TAY.id:
      case this.INSTRUCTIONS.TSX.id:
      case this.INSTRUCTIONS.TXA.id:
      case this.INSTRUCTIONS.TXS.id:
      case this.INSTRUCTIONS.TYA.id:
        var srcReg;
        var desReg;
        switch(op.instruction.id) {
          case this.INSTRUCTIONS.TAX.id:
            srcReg = this.a;
            desReg = this.x;
            break;
          case this.INSTRUCTIONS.TAY.id:
            srcReg = this.a;
            desReg = this.y;
            break;
          case this.INSTRUCTIONS.TSX.id:
            srcReg = this.sp;
            desReg = this.x;
            break;
          case this.INSTRUCTIONS.TXA.id:
            srcReg = this.x;
            desReg = this.a;
            break;
          case this.INSTRUCTIONS.TXS.id:
            srcReg = this.x;
            desReg = this.sp;
            break;
          case this.INSTRUCTIONS.TYA.id:
            srcReg = this.y;
            desReg = this.a;
            break;
        }
        var result = srcReg.load();
        desReg.store(result);
        if(op.instruction.id != this.INSTRUCTIONS.TXS.id) {
          this.updateN(result);
          this.updateZ(result);
        }
        break;

      default:
        throw new Error('Cpu.operate: Invalid instruction, pc=' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.pc.load() - 1) + ' opc=' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(opc, 2) + ' name=' + op.instruction.name);
        break;
    }
  },

  // disassemble method

  disassembleROM: function() {
    var buffer = '';
    var rom = this.rom;
    var pc = rom.getHeaderSize();
    var previousIsZero = false;
    var skipZero = false;

    // TODO: temporal
    while(pc < 0x4010) {
      var str = '';
      var opc = rom.loadWithoutMapping(pc);
      var op = this.decode(opc);

      if(previousIsZero && opc == 0 && rom.loadWithoutMapping((pc+1)&0xffff) == 0) {
        pc += 1;
        skipZero = true;
        continue;
      }

      if(skipZero)
        buffer += '...\n';
      skipZero = false;

      str += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(pc - rom.getHeaderSize(), 4) + ' ';
      str += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(opc, 2) + ' ';
      str += op.instruction.name + ' ';
      str += this.dumpMemoryAddressingMode(op,
                                           rom,
                                           (pc + 1) & 0xffff)
             + ' ';

      while(str.length < 30) {
        str += ' ' ;
      }

      if(op.mode) {
        str += op.mode.name;
        pc += op.mode.pc;
      } else {
        pc += 1;
      }

      buffer += str + '\n';
      previousIsZero = opc == 0;
    }
    return buffer;
  },

  // dump methods

  dump: function() {
    var buffer = '';
    var opc = this.load(this.pc.load());
    var op = this.decode(opc);

    buffer += 'p:'  + this.p.dump()  + ' ';
    buffer += 'pc:' + this.pc.dump() + '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(opc, 2) + ')' + ' ';
    buffer += 'sp:' + this.sp.dump() + ' ';
    buffer += 'a:'  + this.a.dump()  + ' ';
    buffer += 'x:'  + this.x.dump()  + ' ';
    buffer += 'y:'  + this.y.dump()  + ' ';

    buffer += op.instruction.name + ' ' +
                this.dumpMemoryAddressingMode(op,
                                              this,
                                              (this.pc.load() + 1) & 0xffff)
                + ' ';

    while(buffer.length < 90) {
      buffer += ' ' ;
    }

    buffer += op.mode.name;

    return buffer;
  },

  dumpRAM: function() {
    return this.ram.dump();
  },

  dumpMemoryAddressingMode: function(op, mem, pc) {
    var buffer = '';
    var ramDump = (mem instanceof Cpu) ? true : false;

    switch(op.mode) {
      case this.ADDRESSINGS.IMMEDIATE:
        buffer += '#' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(pc, true), 2);
        break;

      case this.ADDRESSINGS.RELATIVE:
        var value = mem.load(pc, true);
        if(value & 0x80) {
          value = -(0x100 - value); // make negative native integer.
        }
        buffer += value.toString(10);
        break;

      case this.ADDRESSINGS.ABSOLUTE:
        var address = mem.load2Bytes(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 4);
        if(ramDump) {
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ABSOLUTE_X:
        var address = mem.load2Bytes(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 4) + ',X ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xffff;
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ABSOLUTE_Y:
        var address = mem.load2Bytes(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 4) + ',Y ';
        if(ramDump) {
          address += this.y.load();
          address = address & 0xffff;
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.ZERO_PAGE:
        var address = mem.load(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 2);
        if(ramDump) {
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_X:
        var address = mem.load(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 2) + ',X ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xff;
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_ZERO_PAGE_Y:
        var address = mem.load(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 2) + ',Y ';
        if(ramDump) {
          address += this.y.load();
          address = address & 0xff;
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address, true), 2) + ')';
        }
        break;

      case this.ADDRESSINGS.INDIRECT:
        var address = mem.load2Bytes(pc, true);
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 4);
        if(ramDump) {
          var address2 = mem.load2Bytes(address, true);
          buffer += '(';
          buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address2, 4);
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_X:
        var address = mem.load(pc, true);
        buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 2) + ',X) ';
        if(ramDump) {
          address += this.x.load();
          address = address & 0xffff;
          var address2 = mem.load2Bytes(address, true);
          buffer += '(';
          buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address2, 4);
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.INDEXED_INDIRECT_Y:
        var address = mem.load(pc, true);
        buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address, 2) + '),Y ';
        if(ramDump) {
          var address2 = mem.load2BytesFromZeropage(address, true);
          address2 += this.y.load();
          address2 = address2 & 0xffff;
          buffer += '(';
          buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(address2, 4);
          buffer += '(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(mem.load(address2, true), 2) + ')';
          buffer += ')';
        }
        break;

      case this.ADDRESSINGS.ACCUMULATOR:
        if(ramDump) {
          buffer += 'A(' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.a.load(), 2) + ')';
        }
        break;

      default:
        throw new Error('Cpu: Unkown addressing mode.');
        break;
    }
    return buffer;
  }
});

/**
 *
 */
function CpuStatusRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

CpuStatusRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isCpuStatusRegister: true,

  //

  N_BIT: 7,
  V_BIT: 6,
  A_BIT: 5,  // unused bit. A is random name
  B_BIT: 4,
  D_BIT: 3,
  I_BIT: 2,
  Z_BIT: 1,
  C_BIT: 0,

  //

  isN: function() {
    return this.isBitSet(this.N_BIT);
  },

  setN: function() {
    this.setBit(this.N_BIT);
  },

  clearN: function() {
    this.clearBit(this.N_BIT);
  },

  isV: function() {
    return this.isBitSet(this.V_BIT);
  },

  setV: function() {
    this.setBit(this.V_BIT);
  },

  clearV: function() {
    this.clearBit(this.V_BIT);
  },

  isA: function() {
    return this.IsBitSet(this.A_BIT);
  },

  setA: function() {
    this.setBit(this.A_BIT);
  },

  clearA: function() {
    this.clearBit(this.A_BIT);
  },

  isB: function() {
    return this.isBitSet(this.B_BIT);
  },

  setB: function() {
    this.setBit(this.B_BIT);
  },

  clearB: function() {
    this.clearBit(this.B_BIT);
  },

  isD: function() {
    return this.isBitSet(this.D_BIT);
  },

  setD: function() {
    this.setBit(this.D_BIT);
  },

  clearD: function() {
    this.clearBit(this.D_BIT);
  },

  isI: function() {
    return this.isBitSet(this.I_BIT);
  },

  setI: function() {
    this.setBit(this.I_BIT);
  },

  clearI: function() {
    this.clearBit(this.I_BIT);
  },

  isZ: function() {
    return this.isBitSet(this.Z_BIT);
  },

  setZ: function() {
    this.setBit(this.Z_BIT);
  },

  clearZ: function() {
    this.clearBit(this.Z_BIT);
  },

  isC: function() {
    return this.isBitSet(this.C_BIT);
  },

  setC: function() {
    this.setBit(this.C_BIT);
  },

  clearC: function() {
    this.clearBit(this.C_BIT);
  },

  // dump

  dump: function() {
    var buffer = '';
    buffer += __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype.dump.call(this);
    buffer += '(';
    buffer += this.isN() ? 'N' : '-';
    buffer += this.isV() ? 'V' : '-';
    buffer += this.isB() ? 'B' : '-';
    buffer += this.isD() ? 'D' : '-';
    buffer += this.isI() ? 'I' : '-';
    buffer += this.isZ() ? 'Z' : '-';
    buffer += this.isC() ? 'C' : '-';
    buffer += ')';
    return buffer;
  }
});




/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Ppu; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Register_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Memory_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Utility_js__ = __webpack_require__(1);




/**
 * RP2A03
 * Refer to https://wiki.nesdev.com/w/index.php/PPU
 */
function Ppu() {

  //

  this.frame = 0;

  this.scanLine = 0;
  this.cycle = 0;

  // other devices

  this.cpu = null;  // set by .setCpu()
  this.rom = null;  // set by .setRom()
  this.display = null;  // set by .setDisplay();

  // inside memory

  this.vRam = new __WEBPACK_IMPORTED_MODULE_1__Memory_js__["a" /* Memory */](16 * 1024);  // 16KB
  this.oamRam = new __WEBPACK_IMPORTED_MODULE_1__Memory_js__["a" /* Memory */](256);      // 256B, primary OAM memory
  this.oamRam2 = new __WEBPACK_IMPORTED_MODULE_1__Memory_js__["a" /* Memory */](32);      // 32B, secondary OAM memory

  // CPU memory mapped registers

  this.ppuctrl = new PpuControlRegister();  // 0x2000
  this.ppumask = new PpuMaskRegister();     // 0x2001
  this.ppustatus = new PpuStatusRegister(); // 0x2002
  this.oamaddr = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();        // 0x2003
  this.oamdata = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();        // 0x2004
  this.ppuscroll = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();      // 0x2005
  this.ppuaddr = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();        // 0x2006
  this.ppudata = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();        // 0x2007
  this.oamdma = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();         // 0x4014

  // inside shift registers

  this.nameTableRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.attributeTableLowRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["a" /* Register16bit */]();
  this.attributeTableHighRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["a" /* Register16bit */]();
  this.patternTableLowRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["a" /* Register16bit */]();
  this.patternTableHighRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["a" /* Register16bit */]();

  // inside latches

  this.nameTableLatch = 0;
  this.attributeTableLowLatch = 0;
  this.attributeTableHighLatch = 0;
  this.patternTableLowLatch = 0;
  this.patternTableHighLatch = 0

  //

  this.fineXScroll = 0;
  this.currentVRamAddress = 0;
  this.temporalVRamAddress = 0;

  //

  this.vRamReadBuffer = 0;
  this.registerFirstStore = true;

  // sprites

  this.spritesManager = new SpritesManager(this.oamRam);
  this.spritesManager2 = new SpritesManager(this.oamRam2);

  // for one scan line

  this.spritePixels = [];
  this.spriteIds = [];
  this.spritePriorities = [];

  for(var i = 0; i < 256; i++) {
    this.spritePixels[i] = -1;
    this.spriteIds[i] = -1;
    this.spritePriorities[i] = -1;
  }
}

//


//

Object.assign(Ppu.prototype, {
  isPpu: true,

  //

  PALETTES: [
    /* 0x00 */ 0xff757575,
    /* 0x01 */ 0xff8f1b27,
    /* 0x02 */ 0xffab0000,
    /* 0x03 */ 0xff9f0047,
    /* 0x04 */ 0xff77008f,
    /* 0x05 */ 0xff1300ab,
    /* 0x06 */ 0xff0000a7,
    /* 0x07 */ 0xff000b7f,
    /* 0x08 */ 0xff002f43,
    /* 0x09 */ 0xff004700,
    /* 0x0a */ 0xff005100,
    /* 0x0b */ 0xff173f00,
    /* 0x0c */ 0xff5f3f1b,
    /* 0x0d */ 0xff000000,
    /* 0x0e */ 0xff000000,
    /* 0x0f */ 0xff000000,
    /* 0x10 */ 0xffbcbcbc,
    /* 0x11 */ 0xffef7300,
    /* 0x12 */ 0xffef3b23,
    /* 0x13 */ 0xfff30083,
    /* 0x14 */ 0xffbf00bf,
    /* 0x15 */ 0xff5b00e7,
    /* 0x16 */ 0xff002bdb,
    /* 0x17 */ 0xff0f4fcb,
    /* 0x18 */ 0xff00738b,
    /* 0x19 */ 0xff009700,
    /* 0x1a */ 0xff00ab00,
    /* 0x1b */ 0xff3b9300,
    /* 0x1c */ 0xff8b8300,
    /* 0x1d */ 0xff000000,
    /* 0x1e */ 0xff000000,
    /* 0x1f */ 0xff000000,
    /* 0x20 */ 0xffffffff,
    /* 0x21 */ 0xffffbf3f,
    /* 0x22 */ 0xffff975f,
    /* 0x23 */ 0xfffd8ba7,
    /* 0x24 */ 0xffff7bf7,
    /* 0x25 */ 0xffb777ff,
    /* 0x26 */ 0xff6377ff,
    /* 0x27 */ 0xff3b9bff,
    /* 0x28 */ 0xff3fbff3,
    /* 0x29 */ 0xff13d383,
    /* 0x2a */ 0xff4bdf4f,
    /* 0x2b */ 0xff98f858,
    /* 0x2c */ 0xffdbeb00,
    /* 0x2d */ 0xff000000,
    /* 0x2e */ 0xff000000,
    /* 0x2f */ 0xff000000,
    /* 0x30 */ 0xffffffff,
    /* 0x31 */ 0xffffe7ab,
    /* 0x32 */ 0xffffd7c7,
    /* 0x33 */ 0xffffcbd7,
    /* 0x34 */ 0xffffc7ff,
    /* 0x35 */ 0xffdbc7ff,
    /* 0x36 */ 0xffb3bfff,
    /* 0x37 */ 0xffabdbff,
    /* 0x38 */ 0xffa3e7ff,
    /* 0x39 */ 0xffa3ffe3,
    /* 0x3a */ 0xffbff3ab,
    /* 0x3b */ 0xffcfffb3,
    /* 0x3c */ 0xfff3ff9f,
    /* 0x3d */ 0xff000000,
    /* 0x3e */ 0xff000000,
    /* 0x3f */ 0xff000000
  ],

  // public methods

  // set methods

  /**
   *
   */
  setCpu: function(cpu) {
    this.cpu = cpu;
  },

  /**
   *
   */
  setRom: function(rom) {
    this.rom = rom;
  },

  /**
   *
   */
  setDisplay: function(display) {
    this.display = display;
  },

  //

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/PPU_power_up_state
   */
  bootup: function() {
    this.ppustatus.store(0x80);
  },

  /**
   *
   */
  reset: function() {

  },

  /**
   *
   */
  runCycle: function() {
    this.renderPixel();
    this.shiftRegisters();
    this.fetch();
    this.evaluateSprites();
    this.updateFlags();
    this.countUpScrollCounters();
    this.countUpCycle();
  },

  // load/store methods

  /**
   * Called from Cpu
   */
  loadRegister: function(address) {
    switch(address) {

      // ppustatus load

      case 0x2002:
        var value = this.ppustatus.load();
        this.ppustatus.clearVBlank();
        this.registerFirstStore = true;
        return value;

      // oamdata load

      case 0x2004:
        return this.oamRam.load(this.oamaddr.load());

      // ppudata load

      case 0x2007:
        var value;

        if((this.currentVRamAddress & 0x3FFF) >= 0 &&
            (this.currentVRamAddress & 0x3FFF) < 0x3F00) {
          value = this.vRamReadBuffer;
          this.vRamReadBuffer = this.load(this.currentVRamAddress);
        } else {
          value = this.load(this.currentVRamAddress);
          this.vRamReadBuffer = value;
        }

        this.incrementVRamAddress();
        return value;
    }

    return 0;
  },

  /**
   * Called from Cpu.
   */
  storeRegister: function(address, value) {
    switch(address) {

      // ppuctrl store

      case 0x2000:
        this.ppuctrl.store(value);
        this.temporalVRamAddress &= ~0xC00;
        this.temporalVRamAddress |= (value & 0x3) << 10;
        break;

      // ppumask store

      case 0x2001:
        this.ppumask.store(value);
        break;

      // oamaddr store

      case 0x2003:
        this.oamaddr.store(value);
        break;

      // oamdata store

      case 0x2004:
        this.oamdata.store(value);
        this.oamRam.store(this.oamaddr.load(), value);
        this.oamaddr.increment();
        break;

      // ppuscroll store

      case 0x2005:
        this.ppuscroll.store(value);

        if(this.registerFirstStore === true) {
          this.fineXScroll = value & 0x7;
          this.temporalVRamAddress &= ~0x1F;
          this.temporalVRamAddress |= (value >> 3) & 0x1F;
        } else {
          this.temporalVRamAddress &= ~0x73E0;
          this.temporalVRamAddress |= (value & 0xF8) << 2;
          this.temporalVRamAddress |= (value & 0x7) << 12;
        }

        this.registerFirstStore = !this.registerFirstStore;

        break;

      // ppuaddr store

      case 0x2006:
        if(this.registerFirstStore === true) {
          this.temporalVRamAddress &= ~0x7F00;
          this.temporalVRamAddress |= (value & 0x3F) << 8;
        } else {
          this.ppuaddr.store(value);
          this.temporalVRamAddress &= ~0xFF;
          this.temporalVRamAddress |= (value & 0xFF);
          this.currentVRamAddress = this.temporalVRamAddress;
        }

        this.registerFirstStore = !this.registerFirstStore;

        break;

      // ppudata store

      case 0x2007:
        this.ppudata.store(value);

        this.store(this.currentVRamAddress, value);
        this.incrementVRamAddress();

        break;

      // oamdma store

      case 0x4014:
        this.oamdma.store(value);

        var offset = value * 0x100;

        for(var i = this.oamaddr.load(); i < 256; i++)
          this.oamRam.store(i, this.cpu.load(offset + i));

        this.cpu.stallCycle += 514;

        break;
    }
  },

  /**
   *
   */
  load: function(address) {
    address = address & 0x3FFF;  // just in case

    // 0x0000 - 0x1FFF is mapped with cartridge's CHR-ROM if it exists

    if(address < 0x2000 && this.rom.hasChrRom() === true)
      return this.rom.load(address);

    // 0x0000 - 0x0FFF: pattern table 0
    // 0x1000 - 0x1FFF: pattern table 1
    // 0x2000 - 0x23FF: nametable 0
    // 0x2400 - 0x27FF: nametable 1
    // 0x2800 - 0x2BFF: nametable 2
    // 0x2C00 - 0x2FFF: nametable 3
    // 0x3000 - 0x3EFF: Mirrors of 0x2000 - 0x2EFF
    // 0x3F00 - 0x3F1F: Palette RAM indices
    // 0x3F20 - 0x3FFF: Mirrors of 0x3F00 - 0x3F1F

    if(address >= 0x2000 && address < 0x3F00)
      return this.vRam.load(this.getNameTableAddressWithMirroring(address & 0x2FFF));

    if(address >= 0x3F00 && address < 0x4000)
      address = address & 0x3F1F;

    // Addresses for palette
    // 0x3F10/0x3F14/0x3F18/0x3F1C are mirrors of
    // 0x3F00/0x3F04/0x3F08/0x3F0C.

    if(address === 0x3F10)
      address = 0x3F00;

    if(address === 0x3F14)
      address = 0x3F04;

    if(address === 0x3F18)
      address = 0x3F08;

    if(address === 0x3F1C)
      address = 0x3F0C;

    return this.vRam.load(address);
  },

  /**
   *
   */
  store: function(address, value) {
    address = address & 0x3FFF;  // just in case

    // 0x0000 - 0x1FFF is mapped with cartridge's CHR-ROM if it exists

    if(address < 0x2000 && this.rom.hasChrRom() === true) {
      this.rom.store(address, value);
      return;
    }

    // 0x0000 - 0x0FFF: pattern table 0
    // 0x1000 - 0x1FFF: pattern table 1
    // 0x2000 - 0x23FF: nametable 0
    // 0x2400 - 0x27FF: nametable 1
    // 0x2800 - 0x2BFF: nametable 2
    // 0x2C00 - 0x2FFF: nametable 3
    // 0x3000 - 0x3EFF: Mirrors of 0x2000 - 0x2EFF
    // 0x3F00 - 0x3F1F: Palette RAM indices
    // 0x3F20 - 0x3FFF: Mirrors of 0x3F00 - 0x3F1F

    if(address >= 0x2000 && address < 0x3F00) {
      this.vRam.store(this.getNameTableAddressWithMirroring(address & 0x2FFF), value);
      return;
    }

    if(address >= 0x3F00 && address < 0x4000)
      address = address & 0x3F1F;

    // Addresses for palette
    // 0x3F10/0x3F14/0x3F18/0x3F1C are mirrors of
    // 0x3F00/0x3F04/0x3F08/0x3F0C.

    if(address === 0x3F10)
      address = 0x3F00;

    if(address === 0x3F14)
      address = 0x3F04;

    if(address === 0x3F18)
      address = 0x3F08;

    if(address === 0x3F1C)
      address = 0x3F0C;

    return this.vRam.store(address, value);
  },

  // private methods

  getNameTableAddressWithMirroring: function(address) {
    address = address & 0x2FFF;  // just in case

    var baseAddress = 0;

    switch(this.rom.getMirroringType()) {
      case this.rom.MIRRORINGS.SINGLE_SCREEN:
        baseAddress = 0x2000;
        break;

      case this.rom.MIRRORINGS.HORIZONTAL:
        if(address >= 0x2000 && address < 0x2400)
          baseAddress = 0x2000;
        else if(address >= 0x2400 && address < 0x2800)
          baseAddress = 0x2000;
        else if(address >= 0x2800 && address < 0x2C00)
          baseAddress = 0x2400;
        else
          baseAddress = 0x2400;

        break;

      case this.rom.MIRRORINGS.VERTICAL:
        if(address >= 0x2000 && address < 0x2400)
          baseAddress = 0x2000;
        else if(address >= 0x2400 && address < 0x2800)
          baseAddress = 0x2400;
        else if(address >= 0x2800 && address < 0x2C00)
          baseAddress = 0x2000;
        else
          baseAddress = 0x2400;

        break;

      case this.rom.MIRRORINGS.FOUR_SCREEN:
        if(address >= 0x2000 && address < 0x2400)
          baseAddress = 0x2000;
        else if(address >= 0x2400 && address < 0x2800)
          baseAddress = 0x2400;
        else if(address >= 0x2800 && address < 0x2C00)
          baseAddress = 0x2800;
        else
          baseAddress = 0x2C00;

        break;
    }

    return baseAddress | (address & 0x3FF);
  },

  // rendering

  /**
   *
   */
  renderPixel: function() {
    // Note: this comparison order is for performance.
    if(this.cycle >= 257 || this.scanLine >= 240 || this.cycle === 0)
      return;

    var x = this.cycle - 1 ;
    var y = this.scanLine;

    var backgroundVisible = this.ppumask.isBackgroundVisible();
    var spritesVisible = this.ppumask.isSpritesVisible();

    var backgroundPixel = this.getBackgroundPixel();
    var spritePixel = this.spritePixels[x];
    var spriteId = this.spriteIds[x];
    var spritePriority = this.spritePriorities[x];

    var c = this.PALETTES[this.load(0x3F00)];

    // TODO: fix me

    if(backgroundVisible === true && spritesVisible === true) {
      if(spritePixel === -1) {
        c = backgroundPixel;
      } else {
        if(backgroundPixel === c)
          c = spritePixel
        else
          c = spritePriority === 0 ? spritePixel : backgroundPixel;
      }
    } else if(backgroundVisible === true && spritesVisible === false) {
      c = backgroundPixel;
    } else if(backgroundVisible === false && spritesVisible === true) {
      if(spritePixel !== -1)
        c = spritePixel;
    }

    // TODO: fix me

    if(this.ppumask.emphasisRed() === true)
      c = c | 0x00FF0000;
    if(this.ppumask.emphasisGreen() === true)
      c = c | 0x0000FF00;
    if(this.ppumask.emphasisBlue() === true)
      c = c | 0x000000FF;

    // TODO: fix me

    if(backgroundVisible === true && spritesVisible === true &&
       spriteId === 0 && spritePixel !== 0 && backgroundPixel !== 0)
      this.ppustatus.setZeroHit();

    this.display.renderPixel(x, y, c);
  },

  /**
   *
   */
  getBackgroundPixel: function() {
    var offset = 15 - this.fineXScroll;

    var lsb = (this.patternTableHighRegister.loadBit(offset) << 1) |
                this.patternTableLowRegister.loadBit(offset);
    var msb = (this.attributeTableHighRegister.loadBit(offset) << 1) |
                this.attributeTableLowRegister.loadBit(offset);
    var index = (msb << 2) | lsb;

    // TODO: fix me

    if(this.ppumask.isGreyscale() === true)
      index = index & 0x30;

    return this.PALETTES[this.load(0x3F00 + index)];
  },

  //

  /**
   *
   */
  shiftRegisters: function() {
    if(this.scanLine >= 240 && this.scanLine <= 260)
      return;

    if((this.cycle >= 1 && this.cycle <= 256) ||
       (this.cycle >= 329 && this.cycle <= 336)) {
      this.patternTableLowRegister.shift(0);
      this.patternTableHighRegister.shift(0);
      this.attributeTableLowRegister.shift(0);
      this.attributeTableHighRegister.shift(0);
    }
  },

  // fetch

  /**
   *
   */
  fetch: function() {
    if(this.scanLine >= 240 && this.scanLine <= 260)
      return;

    if(this.cycle === 0)
      return;

    if((this.cycle >= 257 && this.cycle <= 320) || this.cycle >= 337)
      return;

    switch((this.cycle - 1) % 8) {
      case 0:
        this.fetchNameTable();
        break;

      case 2:
        this.fetchAttributeTable();
        break;

      case 4:
        this.fetchPatternTableLow();
        break;

      case 6:
        this.fetchPatternTableHigh();
        break;

      default:
        break;
    }

    if(this.cycle % 8 === 1) {
      this.nameTableRegister.store(this.nameTableLatch);
      this.attributeTableLowRegister.storeLowerByte(this.attributeTableLowLatch);
      this.attributeTableHighRegister.storeLowerByte(this.attributeTableHighLatch);
      this.patternTableLowRegister.storeLowerByte(this.patternTableLowLatch);
      this.patternTableHighRegister.storeLowerByte(this.patternTableHighLatch);
    }
  },

  /**
   * Refer to http://wiki.nesdev.com/w/index.php/PPU_scrolling
   */
  fetchNameTable: function() {
    this.nameTableLatch = this.load(0x2000 | (this.currentVRamAddress & 0x0FFF));
  },

  /**
   *
   */
  fetchAttributeTable: function() {
    var v = this.currentVRamAddress;
    var address = 0x23C0 | (v & 0x0C00) | ((v >> 4) & 0x38) | ((v >> 2) & 0x07);

    var byte = this.load(address);

    var coarseX = v & 0x1F;
    var coarseY = (v >> 5) & 0x1F

    var topbottom = (coarseY % 4) >= 2 ? 1 : 0; // bottom, top
    var rightleft = (coarseX % 4) >= 2 ? 1 : 0; // right, left

    var position = (topbottom << 1) | rightleft; // bottomright, bottomleft,
                                                 // topright, topleft

    var value = (byte >> (position << 1)) & 0x3;
    var highBit = value >> 1;
    var lowBit = value & 1;

    this.attributeTableHighLatch = highBit === 1 ? 0xff : 0;
    this.attributeTableLowLatch = lowBit === 1 ? 0xff : 0;
  },

  /**
   *
   */
  fetchPatternTableLow: function() {
    var fineY = (this.currentVRamAddress >> 12) & 0x7;
    var index = this.ppuctrl.getBackgroundPatternTableNum() * 0x1000 +
                  this.nameTableRegister.load() * 0x10 + fineY;

    this.patternTableLowLatch = this.load(index);
  },

  /**
   *
   */
  fetchPatternTableHigh: function() {
    var fineY = (this.currentVRamAddress >> 12) & 0x7;
    var index = this.ppuctrl.getBackgroundPatternTableNum() * 0x1000 +
                  this.nameTableRegister.load() * 0x10 + fineY;

    this.patternTableHighLatch = this.load(index + 0x8);
  },

  //

  /**
   *
   */
  updateFlags: function() {
    if(this.cycle === 1) {
      if(this.scanLine === 241) {
        this.ppustatus.setVBlank();
        this.display.updateScreen();

        //if(this.ppuctrl.enabledNmi() === true)
        //  this.cpu.interrupt(this.cpu.INTERRUPTS.NMI);
      } else if(this.scanLine === 261) {
        this.ppustatus.clearVBlank();
        this.ppustatus.clearZeroHit();
        this.ppustatus.clearOverflow();
      }
    }

    if(this.cycle === 10) {
      if(this.scanLine === 241) {
        if(this.ppuctrl.enabledNmi() === true)
          this.cpu.interrupt(this.cpu.INTERRUPTS.NMI);
      }
    }

    // @TODO: check this driving IRQ counter for MMC3Mapper timing is correct

    if(this.rom.mapper.isMMC3Mapper === true) {
      if(this.cycle === 340 && this.scanLine <= 240 &&
          this.ppumask.isBackgroundVisible() === true &&
          this.ppumask.isSpritesVisible() === true)
        this.rom.mapper.driveIrqCounter(this.cpu);
    }
  },

  /**
   *
   */
  countUpScrollCounters: function() {
    if(this.ppumask.isBackgroundVisible() === false && this.ppumask.isSpritesVisible() === false)
      return;

    if(this.scanLine >= 240 && this.scanLine <= 260)
      return;

    if(this.scanLine === 261) {
      if(this.cycle >= 280 && this.cycle <= 304) {
        this.currentVRamAddress &= ~0x7BE0;
        this.currentVRamAddress |= (this.temporalVRamAddress & 0x7BE0)
      }
    }

    if(this.cycle === 0 || (this.cycle >= 258 && this.cycle <= 320))
      return;

    if((this.cycle % 8) === 0) {
      var v = this.currentVRamAddress;

      if((v & 0x1F) === 31) {
        v &= ~0x1F;
        v ^= 0x400;
      } else {
        v++;
      }

      this.currentVRamAddress = v;
    }

    if(this.cycle === 256) {
      var v = this.currentVRamAddress;

      if((v & 0x7000) !== 0x7000) {
        v += 0x1000;
      } else {
        v &= ~0x7000;
        var y = (v & 0x3E0) >> 5;

        if(y === 29) {
          y = 0;
          v ^= 0x800;
        } else if(y === 31) {
          y = 0;
        } else {
          y++;
        }

        v = (v & ~0x3E0) | (y << 5);
      }

      this.currentVRamAddress = v;
    }

    if(this.cycle === 257) {
      this.currentVRamAddress &= ~0x41F;
      this.currentVRamAddress |= (this.temporalVRamAddress & 0x41F)
    }
  },

  /**
   * cycle:    0 - 340
   * scanLine: 0 - 261
   */
  countUpCycle: function() {
    this.cycle++;

    if(this.cycle > 340) {
      this.cycle = 0;
      this.scanLine++;

      if(this.scanLine > 261) {
        this.scanLine = 0;
        this.frame++;
      }
    }
  },

  //

  /**
   *
   */
  incrementVRamAddress: function() {
    this.currentVRamAddress += this.ppuctrl.isIncrementAddressSet() ? 32 : 1;
    this.currentVRamAddress &= 0x7FFF;
    this.ppuaddr.store(this.currentVRamAddress & 0xFF);
  },

  // sprites

  /**
   * Refer to https://wiki.nesdev.com/w/index.php/PPU_sprite_evaluation
   */
  evaluateSprites: function() {
    if(this.scanLine >= 240)
      return;

    if(this.cycle === 0) {
      this.processSpritePixels();

      for(var i = 0, il = this.oamRam2.getCapacity(); i < il; i++)
        this.oamRam2.store(i, 0xFF);
    } else if(this.cycle === 65) {
      var height = this.ppuctrl.isSpriteSize16() ? 16 : 8;
      var n = 0;

      for(var i = 0, il = this.spritesManager.getNum(); i < il; i++) {
        var s = this.spritesManager.get(i);

        if(s.on(this.scanLine, height) === true) {
          if(n < 8) {
            this.spritesManager2.copy(n++, s);
          } else {
            this.ppustatus.setOverflow();
            break;
          }
        }
      }
    }
  },

  /**
   *
   */
  processSpritePixels: function() {
    var ay = this.scanLine - 1;

    for(var i = 0, il = this.spritePixels.length; i < il; i++) {
      this.spritePixels[i] = -1;
      this.spriteIds[i] = -1;
      this.spritePriorities[i] = -1;
    }

    var height = this.ppuctrl.isSpriteSize16() === true ? 16 : 8;
    var n = 0;

    for(var i = 0, il = this.spritesManager2.getNum(); i < il; i++) {
      var s = this.spritesManager2.get(i);

      if(s.isEmpty())
        break;

      var bx = s.getXPosition();
      var by = s.getYPosition();
      var j = ay - by;
      var cy = s.doFlipVertically() ? height - j - 1 : j;
      var horizontal = s.doFlipHorizontally();
      var ptIndex = (height === 8) ? s.getTileIndex() : s.getTileIndexForSize16();
      var msb = s.getPalletNum();

      for(var k = 0; k < 8; k++) {
        var cx = horizontal ? 7 - k : k;
        var x = bx + k;

        if(x >= 256)
          break;

        var lsb = this.getPatternTableElement(ptIndex, cx, cy, height);

        if(lsb !== 0) {
          var pIndex = (msb << 2) | lsb;

          if(this.spritePixels[x] === -1) {
            this.spritePixels[x] = this.PALETTES[this.load(0x3F10 + pIndex)];
            this.spriteIds[x] = s.getId();
            this.spritePriorities[x] = s.getPriority();
          }
        }
      }
    }
  },

  /**
   *
   */
  getPatternTableElement: function(index, x, y, ySize) {
    var ax = x % 8;
    var a, b;

    if(ySize === 8) {
      var ay = y % 8;
      var offset = this.ppuctrl.getSpritesPatternTableNum() === 1 ? 0x1000 : 0;
      a = this.load(offset + index * 0x10 + ay);
      b = this.load(offset + index * 0x10 + 0x8 + ay);
    } else {
      var ay = y % 8;
      ay += (y >> 3) * 0x10;
      a = this.load(index + ay);
      b = this.load(index + ay + 0x8);
    }

    return ((a >> (7 - ax)) & 1) | (((b >> (7 - ax)) & 1) << 1);
  },

  // dump methods

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += 'PPU Ctrl: ' + this.ppuctrl.dump() + '\n';
    buffer += 'PPU Mask: ' + this.ppumask.dump() + '\n';
    buffer += 'PPU Status: ' + this.ppustatus.dump() + '\n';
    buffer += 'OAM Address: ' + this.oamaddr.dump() + '\n';
    buffer += 'OAM Data: ' + this.oamdata.dump() + '\n';
    buffer += 'PPU Scroll: ' + this.ppuscroll.dump() + '\n';
    buffer += 'PPU Addr: ' + this.ppuaddr.dump() + '\n';
    buffer += 'PPU Data: ' + this.ppudata.dump() + '\n';
    buffer += 'OAM DMA: ' + this.oamdma.dump() + '\n';
    buffer += '\n';

    return buffer;
  },

  /**
   *
   */
  dumpVRAM: function() {
    var buffer = '';
    var previousIsZeroLine = false;
    var offset = 0;
    var end = 0x10000;

    for(var i = offset; i < end; i++) {
      if(i % 0x10 == 0) {
        if(previousIsZeroLine) {
          var skipZero = false;
          while(this._checkNext16BytesIsZero(i+0x10)) {
            i += 0x10;
            skipZero = true;
          }
          if(skipZero)
            buffer += '...\n';
        }
        buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(i-offset, 4) + ' ';
        previousIsZeroLine = true;
      }

      var value = this.load(i);
      buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(value, 2, true) + ' ';
      if(value != 0)
        previousIsZeroLine = false;

      if(i % 0x10 == 0xf)
        buffer += '\n';
    }
    return buffer;
  },

  /**
   *
   */
  _checkNext16BytesIsZero: function(offset) {
    if(offset + 0x10 >= 0x10000)
      return false;

    var sum = 0;
    for(var i = offset; i < offset + 0x10; i++) {
      sum += this.load(i);
    }
    return sum == 0;
  },

  /**
   *
   */
  dumpSPRRAM: function() {
    return this.oamRam.dump();
  }
});

/**
 *
 */
function PpuControlRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

PpuControlRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isPpuControlRegister: true,

  //

  NMI_VBLANK_BIT: 7,
  MASTER_SLAVE_BIT: 6,
  SPRITES_SIZE_BIT: 5,
  BACKGROUND_PATTERN_TABLE_BIT: 4,
  SPRITES_PATTERN_TABLE_BIT: 3,
  INCREMENT_ADDRESS_BIT: 2,

  NAME_TABLE_ADDRESS_BIT: 0,
  NAME_TABLE_ADDRESS_BITS_WIDTH: 2,

  //

  /**
   *
   */
  isIncrementAddressSet: function() {
    return this.isBitSet(this.INCREMENT_ADDRESS_BIT);
  },

  /**
   *
   */
  enabledNmi: function() {
    return this.isBitSet(this.NMI_VBLANK_BIT);
  },

  /**
   *
   */
  isSpriteSize16: function() {
    return this.isBitSet(this.SPRITES_SIZE_BIT);
  },

  /**
   *
   */
  getBackgroundPatternTableNum: function() {
    return this.loadBit(this.BACKGROUND_PATTERN_TABLE_BIT);
  },

  /**
   *
   */
  getSpritesPatternTableNum: function() {
    return this.loadBit(this.SPRITES_PATTERN_TABLE_BIT);
  },

  /**
   *
   */
  getNameTableAddress: function() {
    return this.loadBits(this.NAME_TABLE_ADDRESS_BIT, this.NAME_TABLE_ADDRESS_BITS_WIDTH);
  }
});

/**
 *
 */
function PpuMaskRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

PpuMaskRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isPpuMaskRegister: true,

  //

  GREYSCALE_BIT: 0,
  LEFTMOST_BACKGROUND_VISIBLE_BIT: 1,
  LEFTMOST_SPRITES_VISIBLE_BIT: 2,
  BACKGROUND_VISIBLE_BIT: 3,
  SPRITES_VISIBLE_BIT: 4,
  EMPHASIZE_RED_BIT: 5,
  EMPHASIZE_GREEN_BIT: 6,
  EMPHASIZE_BLUE_BIT: 7,

  //

  /**
   *
   */
  isGreyscale: function() {
    return this.isBitSet(this.GREYSCALE_BIT);
  },

  /**
   *
   */
  isLeftMostBackgroundVisible: function() {
    return this.isBitSet(this.LEFTMOST_BACKGROUND_VISIBLE_BIT);
  },

  /**
   *
   */
  isLeftMostSpritesVisible: function() {
    return this.isBitSet(this.LEFTMOST_SPRITES_VISIBLE_BIT);
  },

  /**
   *
   */
  isBackgroundVisible: function() {
    return this.isBitSet(this.BACKGROUND_VISIBLE_BIT);
  },

  /**
   *
   */
  isSpritesVisible: function() {
    return this.isBitSet(this.SPRITES_VISIBLE_BIT);
  },

  /**
   *
   */
  emphasisRed: function() {
    return this.isBitSet(this.EMPHASIZE_RED_BIT);
  },

  /**
   *
   */
  emphasisGreen: function() {
    return this.isBitSet(this.EMPHASIZE_GREEN_BIT);
  },

  /**
   *
   */
  emphasisBlue: function() {
    return this.isBitSet(this.EMPHASIZE_BLUE_BIT);
  }
});

/**
 *
 */
function PpuStatusRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

PpuStatusRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isPpuStatusRegister: true,

  //

  VBLANK_BIT: 7,
  SPRITE_ZERO_HIT_BIT: 6,
  SPRITE_OVERFLOW_BIT: 5,

  //

  /**
   *
   */
  setVBlank: function() {
    this.setBit(this.VBLANK_BIT);
  },

  /**
   *
   */
  clearVBlank: function() {
    this.clearBit(this.VBLANK_BIT);
  },

  /**
   *
   */
  setZeroHit: function() {
    this.setBit(this.SPRITE_ZERO_HIT_BIT);
  },

  /**
   *
   */
  clearZeroHit: function() {
    this.clearBit(this.SPRITE_ZERO_HIT_BIT);
  },

  /**
   *
   */
  setOverflow: function() {
    this.setBit(this.SPRITE_OVERFLOW_BIT);
  },

  /**
   *
   */
  clearOverflow: function() {
    this.clearBit(this.SPRITE_OVERFLOW_BIT);
  }
});

/**
 *
 */
function SpritesManager(memory) {
  this.sprites = [];
  this.init(memory);
}

Object.assign(SpritesManager.prototype, {
  isSpritesManager: true,

  /**
   *
   */
  init: function(memory) {
    for(var i = 0, il = memory.getCapacity() / 4; i < il; i++) {
      this.sprites.push(new Sprite(i, i, memory));
    }
  },

  /**
   *
   */
  getNum: function() {
    return this.sprites.length;
  },

  /**
   *
   */
  get: function(index) {
    return this.sprites[index];
  },

  /**
   *
   */
  copy: function(index, sprite) {
    this.sprites[index].copy(sprite);
  }
});

/**
 *
 */
function Sprite(index, id, memory) {
  this.index = index;
  this.id = id;
  this.memory = memory;
}

Object.assign(Sprite.prototype, {
  isSprite: true,

  //

  /**
   *
   */
  getId: function() {
    return this.id;
  },

  /**
   *
   */
  setId: function(id) {
    this.id = id;
  },

  /**
   *
   */
  getByte0: function() {
    return this.memory.load(this.index * 4 + 0);
  },

  /**
   *
   */
  getByte1: function() {
    return this.memory.load(this.index * 4 + 1);
  },

  /**
   *
   */
  getByte2: function() {
    return this.memory.load(this.index * 4 + 2);
  },

  /**
   *
   */
  getByte3: function() {
    return this.memory.load(this.index * 4 + 3);
  },

  /**
   *
   */
  setByte0: function(value) {
    this.memory.store(this.index * 4 + 0, value);
  },

  /**
   *
   */
  setByte1: function(value) {
    this.memory.store(this.index * 4 + 1, value);
  },

  /**
   *
   */
  setByte2: function(value) {
    this.memory.store(this.index * 4 + 2, value);
  },

  /**
   *
   */
  setByte3: function(value) {
    this.memory.store(this.index * 4 + 3, value);
  },

  /**
   *
   */
  copy: function(sprite) {
    this.setId(sprite.getId());
    this.setByte0(sprite.getByte0());
    this.setByte1(sprite.getByte1());
    this.setByte2(sprite.getByte2());
    this.setByte3(sprite.getByte3());
  },

  /**
   *
   */
  isEmpty: function() {
    return this.getByte0() === 0xFF && this.getByte1() === 0xFF &&
             this.getByte2() === 0xFF && this.getByte3() === 0xFF;
  },

  /**
   *
   */
  isVisible: function() {
    return this.getByte0() < 0xEF;
  },

  /**
   *
   */
  getYPosition: function() {
    return this.getByte0() - 1;
  },

  /**
   *
   */
  getXPosition: function() {
    return this.getByte3();
  },

  /**
   *
   */
  getTileIndex: function() {
    return this.getByte1();
  },

  /**
   *
   */
  getTileIndexForSize16: function() {
    return ((this.getByte1() & 1) * 0x1000) + (this.getByte1() >> 1) * 0x20;
  },

  /**
   *
   */
  getPalletNum: function() {
    return this.getByte2() & 0x3;
  },

  /**
   *
   */
  getPriority: function() {
    return (this.getByte2() >> 5) & 1;
  },

  /**
   *
   */
  doFlipHorizontally: function() {
    return ((this.getByte2() >> 6) & 1) ? true : false;
  },

  /**
   *
   */
  doFlipVertically: function() {
    return ((this.getByte2() >> 7) & 1) ? true : false;
  },

  /**
   *
   */
  on: function(y, length) {
    return (y >= this.getYPosition()) && (y < this.getYPosition() + length);
  }
});





/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Apu; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Register_js__ = __webpack_require__(0);



/**
 * RP2A03(NTSC)
 * Audio Processing Unit implementation. Consists of
 *   - Pulse 1/2 channel
 *   - Triangle channel
 *   - Noise channel
 *   - DMC channel
 *
 * Refer to https://wiki.nesdev.com/w/index.php/APU
 */
function Apu() {
  // other devices

  this.cpu = null;  // set by .setCpu()

  //

  this.audio = null;  // set by .setAudio()

  // APU units, CPU memory address mapped registers

  this.pulse1 = new ApuPulse(true);   // 0x4000 - 0x4003
  this.pulse2 = new ApuPulse(false);  // 0x4004 - 0x4007
  this.triangle = new ApuTriangle();  // 0x4008 - 0x400B
  this.noise = new ApuNoise();        // 0x400C - 0x400F
  this.dmc = new ApuDmc(this);        // 0x4010 - 0x4013

  this.status = new ApuStatusRegister();  // 0x4015
  this.frame = new ApuFrameRegister();    // 0x4017

  //

  this.cycle = 0;
  this.step = 0;
  this.samplePeriod = 0; // set by .setAudio()

  //

  this.frameIrqActive = false;
  this.dmcIrqActive = false;
}

Object.assign(Apu.prototype, {
  isApu: true,

  // public methods

  /**
   *
   */
  setCpu: function(cpu) {
    this.cpu = cpu;
  },

  /**
   *
   */
  setAudio: function(audio) {
    this.audio = audio;

    // CPU clock frequency 1.789773 MHz

    this.samplePeriod = (1789773 / this.audio.getSampleRate()) | 0;
  },

  /**
   *
   */
  bootup: function() {
    this.status.store(0x00);
  },

  /**
   *
   */
  reset: function() {

  },

  /**
   * Expects being called with CPU clock
   */
  runCycle: function() {
    this.cycle++;

    // Sampling at sample rate timing
    // @TODO: Fix me, more precise timing

    if((this.cycle % this.samplePeriod) === 0)
      this.sample();

    // Timers
    // Clocked on every CPU cycles for triangle and 2CPU cycles for others

    if((this.cycle % 2) === 0) {
      this.pulse1.driveTimer();
      this.pulse2.driveTimer();
      this.noise.driveTimer();
      this.dmc.driveTimer();
    }

    this.triangle.driveTimer();

    // 240Hz Frame sequencer
    // @TODO: Fix me, more precise timing

    if((this.cycle % 7457) === 0) {
      if(this.frame.isFiveStepMode() === true) {

        // Five-step sequence
        //
        // 0 1 2 3 4    function
        // -----------  -----------------------------
        // - - - - -    IRQ (if bit 6 is clear)
        // l - l - -    Length counter and sweep
        // e e e e -    Envelope and linear counter

        if(this.step < 4) {
          this.pulse1.driveEnvelope();
          this.pulse2.driveEnvelope();
          this.triangle.driveLinear();
          this.noise.driveEnvelope();
        }

        if(this.step === 0 || this.step === 2) {
          this.pulse1.driveLength();
          this.pulse1.driveSweep();
          this.pulse2.driveLength();
          this.pulse2.driveSweep();
          this.triangle.driveLength();
          this.noise.driveLength();
        }

        this.step = (this.step + 1) % 5;
      } else {

        // Four-step sequence
        //
        // 0 1 2 3    function
        // ---------  -----------------------------
        // - - - f    IRQ (if bit 6 is clear)
        // - l - l    Length counter and sweep
        // e e e e    Envelope and linear counter

        this.pulse1.driveEnvelope();
        this.pulse2.driveEnvelope();
        this.triangle.driveLinear();
        this.noise.driveEnvelope();

        if(this.step === 1 || this.step === 3) {
          this.pulse1.driveLength();
          this.pulse1.driveSweep();
          this.pulse2.driveLength();
          this.pulse2.driveSweep();
          this.triangle.driveLength();
          this.noise.driveLength();
        }

        if(this.step === 3 && this.frame.disabledIrq() === false)
          this.frameIrqActive = true;

        // Seems like keep invoking IRQ once frame IRQ flag is on
        // until IRQ flag is cleared or it's disabled...?
        // @TODO: check sending IRQ timing

        if(this.frameIrqActive === true && this.frame.disabledIrq() === false)
          this.cpu.interrupt(this.cpu.INTERRUPTS.IRQ);

        this.step = (this.step + 1) % 4;
      }

      // @TODO: check sending IRQ timing

      if(this.dmcIrqActive === true)
          this.cpu.interrupt(this.cpu.INTERRUPTS.IRQ);
    }
  },

  // load/store CPU memory address mapped register methods called by CPU

  /**
   *
   */
  loadRegister: function(address) {
    switch(address) {
      case 0x4015:

        // Loading status register
        //
        // bit
        //   7: DMC interrupt
        //   6: Frame interrupt
        //   4: DMC remaining bytes > 0
        //   3: Noise length counter > 0
        //   2: Triangle length couter > 0
        //   1: Pulse2 length counter > 0
        //   0: Pulse1 length counter > 0

        var value = 0;

        value |= (this.dmcIrqActive === true ? 1 : 0) << 7;
        value |= (this.frameIrqActive === true &&
                   this.frame.disabledIrq() === false ? 1 : 0) << 6;
        value |= (this.dmc.remainingBytes > 0 ? 1 : 0) << 4;
        value |= (this.noise.lengthCounter > 0 ? 1 : 0) << 3;
        value |= (this.triangle.lengthCounter > 0 ? 1 : 0) << 2;
        value |= (this.pulse2.lengthCounter > 0 ? 1 : 0) << 1;
        value |= (this.pulse1.lengthCounter > 0 ? 1 : 0) << 0;

        // Loading status register clears the frame IRQ flag

        this.frameIrqActive = false;

        return value;
    }

    return 0;
  },

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4000:
      case 0x4001:
      case 0x4002:
      case 0x4003:
        this.pulse1.storeRegister(address, value);
        break;

      case 0x4004:
      case 0x4005:
      case 0x4006:
      case 0x4007:
        this.pulse2.storeRegister(address, value);
        break;

      case 0x4008:
      case 0x4009:
      case 0x400A:
      case 0x400B:
        this.triangle.storeRegister(address, value);
        break;

      case 0x400C:
      case 0x400D:
      case 0x400E:
      case 0x400F:
        this.noise.storeRegister(address, value);
        break;

      case 0x4010:
      case 0x4011:
      case 0x4012:
      case 0x4013:
        this.dmc.storeRegister(address, value);
        break;

      case 0x4015:

        // Storing status register
        //
        // bit: Enable(1) / Disable(0)
        //   4: DMC unit
        //   3: Noise unit
        //   2: Triangle unit
        //   1: Pulse2 unit
        //   0: Pulse1 unit
        //
        // Writing a zero to any of channel enables bits will
        // set its length counter/remaining bytes to zero.

        this.status.store(value);

        this.dmc.setEnable((value & 0x10) === 0x10);
        this.noise.setEnable((value & 0x8) === 0x8);
        this.triangle.setEnable((value & 0x4) === 0x4);
        this.pulse2.setEnable((value & 0x2) === 0x2);
        this.pulse1.setEnable((value & 0x1) === 0x1);

        // Storing status register clears the DMC interrupt flag

        this.dmcIrqActive = false;

        break;

      case 0x4017:

        // Storing frame counter register

        this.frame.store(value);

        // If interrupt inhibit flag is set, the frame IRQ flag is cleared.

        if(this.frame.disabledIrq() === true)
          this.frameIrqActive = false;

        break;
    }
  },

  // private method

  /**
   *
   */
  sample: function() {

    // Calculates the audio output within the range of 0.0 to 1.0.
    // Refer to https://wiki.nesdev.com/w/index.php/APU_Mixer

    var pulse1 = this.pulse1.output();
    var pulse2 = this.pulse2.output();
    var triangle = this.triangle.output();
    var noise = this.noise.output();
    var dmc = this.dmc.output();

    var pulseOut = 0;
    var tndOut = 0;

    if(pulse1 !== 0 || pulse2 !== 0)
      pulseOut = 95.88 / ((8128 / (pulse1 + pulse2)) + 100);

    if(triangle !== 0 || noise !== 0 || dmc !== 0)
      tndOut = 159.79 / (1 / (triangle / 8227 + noise / 12241 + dmc / 22638) + 100);

    this.audio.push(pulseOut + tndOut);
  },

  // dump

  /**
   *
   */
  dump: function() {

  }
});

/**
 *
 */
function ApuUnit(apu) {
  this.apu = apu;
}

// Refer to https://wiki.nesdev.com/w/index.php/APU_Length_Counter

ApuUnit.LENGTH_TABLE = [
  0x0A, 0xFE, 0x14, 0x02, 0x28, 0x04, 0x50, 0x06,
  0xA0, 0x08, 0x3C, 0x0A, 0x0E, 0x0C, 0x1A, 0x0E,
  0x0C, 0x10, 0x18, 0x12, 0x30, 0x14, 0x60, 0x16,
  0xC0, 0x18, 0x48, 0x1A, 0x10, 0x1C, 0x20, 0x1E
];

/**
 * Apu Pulse channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Envelope
 *   - Sweep
 */
function ApuPulse(isChannel1) {

  this.isChannel1 = isChannel1;

  // CPU memory address mapped registers

  // 0x4000 / 0x4004
  //
  // bit:
  // 7-6: Duty cycle
  //   5: Length counter halt
  //   4: Enable envelope
  // 3-0: Envelope divider period

  // 0x4001 / 0x4005
  //
  // bit:
  //   7: Enable sweep
  // 6-4: Period
  //   3: Negate
  // 2-0: Shift amount per period

  // 0x4002 / 0x4006
  //
  // bit:
  // 7-0: Timer low 8-bit

  // 0x4003 / 0x4007
  //
  // bit:
  // 7-3: Length counter index
  // 2-0: Timer high 3-bit

  this.register0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4000 / 0x4004
  this.register1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4001 / 0x4005
  this.register2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4002 / 0x4006
  this.register3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4003 / 0x4007

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerPeriod = 0;
  this.timerSequence = 0;

  this.envelopeStartFlag = true;
  this.envelopeCounter = 0;
  this.envelopeDecayLevelCounter = 0;

  this.lengthCounter = 0;

  this.sweepReloadFlag = false;
  this.sweepCycle = 0;
  this.sweepCounter = 0;
}

Object.assign(ApuPulse.prototype, {
  isApuPulse: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  DUTY_TABLE: [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 1],
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4000:
      case 0x4004:
        this.register0.store(value);

        break;

      case 0x4001:
      case 0x4005:
        this.register1.store(value);

        // Side effect
        //   - Sets the sweep reload flag

        this.sweepReloadFlag = true;

        break;

      case 0x4002:
      case 0x4006:
        this.register2.store(value);
        this.timerPeriod = this.getTimer();

        break;

      case 0x4003:
      case 0x4007:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - The envelope is restarted
        //   - The sequencer is immediately restarted at the first value of the current
        //     sequence. The period divider is not reset.

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.timerPeriod = this.getTimer();
        this.timerSequence = 0;
        this.envelopeStartFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  getDuty: function() {
    return this.register0.loadBits(6, 2);
  },

  /**
   *
   */
  enabledEnvelopeLoop: function() {
    return this.register0.isBitSet(5);
  },

  /**
   *
   */
  disabledEnvelope: function() {
    return this.register0.isBitSet(4);
  },

  /**
   *
   */
  getEnvelopePeriod: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  enabledSweep: function() {
    return this.register1.isBitSet(7);
  },

  /**
   *
   */
  getSweepPeriod: function() {
    return this.register1.loadBits(4, 3);
  },

  /**
   *
   */
  negatedSweep: function() {
    return this.register1.isBitSet(3);
  },

  /**
   *
   */
  getSweepShiftAmount: function() {
    return this.register1.loadBits(0, 3);
  },

  /**
   *
   */
  getTimerLow: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getTimerHigh: function() {
    return this.register3.loadBits(0, 3);
  },

  /**
   *
   */
  getTimer: function() {
    return ((this.getTimerHigh() << 8) | this.getTimerLow());
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;
      this.timerSequence++;

      // 8-step sequencer

      if(this.timerSequence === 8)
        this.timerSequence = 0;
    }
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledEnvelope() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  driveEnvelope: function() {
    if(this.envelopeStartFlag === true) {
      this.envelopeCounter = this.getEnvelopePeriod();
      this.envelopeDecayLevelCounter = 0xF;
      this.envelopeStartFlag = false;
      return;
    }

    if(this.envelopeCounter > 0) {
      this.envelopeCounter--;
    } else {
      this.envelopeCounter = this.getEnvelopePeriod();

      if(this.envelopeDecayLevelCounter > 0)
        this.envelopeDecayLevelCounter--;
      else if(this.envelopeDecayLevelCounter === 0 && this.enabledEnvelopeLoop() === true)
        this.envelopeDecayLevelCounter = 0xF;
    }
  },

  /**
   *
   */
  driveSweep: function() {
    if(this.sweepCounter === 0 && this.enabledSweep() === true &&
        this.getSweepShiftAmount() !== 0 &&
        this.timerPeriod >= 8 && this.timerPeriod <= 0x7FF) {
      var change = this.timerPeriod >> this.getSweepShiftAmount();

      // In negated mode, Pulse 1 adds the ones' complement while
      // Pulse 2 adds the twos' complement

      if(this.negatedSweep() === true) {
        change = -change;

        if(this.isChannel1 === true)
          change--;
      }

      this.timerPeriod += change;
    }

    if(this.sweepReloadFlag === true || this.sweepCounter === 0) {
      this.sweepReloadFlag = false;
      this.sweepCounter = this.getSweepPeriod();
    } else {
      this.sweepCounter--;
    }
  },

  /**
   *
   */
  output: function() {
    if(this.lengthCounter === 0 || this.timerPeriod < 8 || this.timerPeriod > 0x7FF ||
        this.DUTY_TABLE[this.getDuty()][this.timerSequence] === 0)
      return 0;

    // 4-bit output

    return (this.disabledEnvelope() === true ? this.getEnvelopePeriod() : this.envelopeDecayLevelCounter) & 0xF;
  }
});

/**
 * Apu Triangle channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Linear counter
 */
function ApuTriangle() {

  // CPU memory address mapped registers

  // 0x4008
  //
  // bit:
  //   7: Length counter halt
  // 6-0: Linear counter period

  // 0x4009
  //
  // Unused

  // 0x400A
  //
  // bit:
  // 7-0: Timer low 8-bit

  // 0x400B
  //
  // bit:
  // 7-3: Length counter index
  // 2-0: Timer high 3-bit

  this.register0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4008
  this.register1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4009
  this.register2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400A
  this.register3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400B

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerSequence = 0;

  this.lengthCounter = 0;

  this.linearReloadFlag = false;
  this.linearCounter = 0;
}

Object.assign(ApuTriangle.prototype, {
  isApuTriangle: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  SEQUENCE_TABLE: [
    15, 14, 13, 12, 11, 10,  9,  8,
     7,  6,  5,  4,  3,  2,  1,  0,
     0,  1,  2,  3,  4,  5,  6,  7,
     8,  9, 10, 11, 12, 13, 14, 15
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4008:
        this.register0.store(value);
        break;

      case 0x4009:
        this.register1.store(value);
        break;

      case 0x400A:
        this.register2.store(value);
        break;

      case 0x400B:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - Sets the linear counter reload flag
        //   - The sequencer is immediately restarted at the first value of the current
        //     sequence. The period divider is not reset.

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.timerSequence = 0;
        this.linearReloadFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  getLinearCounter: function() {
    return this.register0.loadBits(0, 7);
  },

  /**
   *
   */
  disabledLengthCounter: function() {
    return this.register0.isBitSet(7);
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  /**
   *
   */
  getTimerLow: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getTimerHigh: function() {
    return this.register3.loadBits(0, 3);
  },

  /**
   *
   */
  getTimer: function() {
    return (this.getTimerHigh() << 8) | this.getTimerLow();
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.getTimer();

      // The sequencer is clocked by the timer as long as
      // both the linear counter and the length counter are nonzero.

      if(this.lengthCounter > 0 && this.linearCounter > 0) {
        this.timerSequence++;

        // 32-step sequencer

        if(this.timerSequence === 32)
          this.timerSequence = 0;
      }
    }
  },

  /**
   *
   */
  driveLinear: function() {
    if(this.linearReloadFlag === true)
      this.linearCounter = this.getLinearCounter();
    else if(this.linearCounter > 0)
      this.linearCounter--;

    if(this.disabledLengthCounter() === false)
      this.linearReloadFlag = false;
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledLengthCounter() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  output: function() {
    if(this.enabled === false || this.lengthCounter === 0 ||
        this.linearCounter === 0 || this.getTimer() < 2)
      return 0;

    // 4-bit output

    return this.SEQUENCE_TABLE[this.timerSequence] & 0xF;
  }
});

/**
 * Apu Noise channel. Consists of
 *   - Timer
 *   - Length counter
 *   - Envelope
 *   - Linear feedback shift register
 */
function ApuNoise() {

  // CPU memory address mapped registers

  // 0x400C
  //
  // bit:
  //   5: Length counter halt
  //   4: Disable envelope
  // 3-0: Envelope

  // 0x400D
  //
  // Unused

  // 0x400E
  //
  // bit:
  //   7: Loop noise
  // 3-0: Noise period

  // 0x400F
  //
  // bit:
  // 7-3: Length counter index

  this.register0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400C
  this.register1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400D
  this.register2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400E
  this.register3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x400F

  //

  this.enabled = false;

  //

  this.timerCounter = 0;
  this.timerPeriod = 0;

  this.envelopeStartFlag = false;
  this.envelopeCounter = 0;
  this.envelopeDecayLevelCounter = 0;

  this.lengthCounter = 0;

  this.shiftRegister = 1;  // 15-bit register
}

Object.assign(ApuNoise.prototype, {
  isApuNoise: true,

  //

  LENGTH_TABLE: ApuUnit.LENGTH_TABLE,

  TIMER_TABLE: [
    0x004, 0x008, 0x010, 0x020,
    0x040, 0x060, 0x080, 0x0A0,
    0x0CA, 0x0FE, 0x17C, 0x1FC,
    0x2FA, 0x3F8, 0x7F2, 0xFE4
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x400C:
        this.register0.store(value);
        break;

      case 0x400D:
        this.register1.store(value);
        break;

      case 0x400E:
        this.register2.store(value);
        this.timerPeriod = this.TIMER_TABLE[this.getTimerIndex()]

        break;

      case 0x400F:
        this.register3.store(value);

        // Side effects
        //   - If the enabled flag is set, the length counter is reloaded
        //   - The envelope is restarted

        if(this.enabled === true)
          this.lengthCounter = this.LENGTH_TABLE[this.getLengthCounterIndex()];

        this.envelopeStartFlag = true;

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // When the enabled bit is cleared (via $4015), the length counter is forced to 0

    if(enabled === false)
      this.lengthCounter = 0;
  },

  /**
   *
   */
  disabledLengthCounter: function() {
    return this.register0.isBitSet(5);
  },

  /**
   *
   */
  disabledEnvelope: function() {
    return this.register0.isBitSet(4);
  },

  /**
   *
   */
  getEnvelopePeriod: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  isRandom: function() {
    return this.register2.isBitSet(7);
  },

  /**
   *
   */
  getTimerIndex: function() {
    return this.register2.loadBits(0, 4);
  },

  /**
   *
   */
  getLengthCounterIndex: function() {
    return this.register3.loadBits(3, 5);
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;

      // Feedback is calculated as the exclusive-OR of bit 0
      // and another bit: bit 6 if Mode flag is set, otherwise bit 1.

      var feedback = (this.shiftRegister & 1) ^
                       ((this.shiftRegister >> (this.isRandom() === true ? 6 : 1)) & 1);

      this.shiftRegister = (feedback << 14) | (this.shiftRegister >> 1);
    }
  },

  /**
   *
   */
  driveEnvelope: function() {
    if(this.envelopeStartFlag === true) {
      this.envelopeCounter = this.getEnvelopePeriod();
      this.envelopeDecayLevelCounter = 0xF;
      this.envelopeStartFlag = false;
      return;
    }

    if(this.envelopeCounter > 0) {
      this.envelopeCounter--;
    } else {
      this.envelopeCounter = this.getEnvelopePeriod();

      if(this.envelopeDecayLevelCounter > 0)
        this.envelopeDecayLevelCounter--;
      else if(this.envelopeDecayLevelCounter === 0 && this.disabledLengthCounter() === true)
        this.envelopeDecayLevelCounter = 0xF;
    }
  },

  /**
   *
   */
  driveLength: function() {
    if(this.disabledLengthCounter() === false && this.lengthCounter > 0)
      this.lengthCounter--;
  },

  /**
   *
   */
  output: function() {
    if(this.lengthCounter === 0 || (this.shiftRegister & 1) === 1)
      return 0;

    // 4-bit output

    return (this.disabledEnvelope() === true ? this.getEnvelopePeriod() : this.envelopeDecayLevelCounter) & 0xF;
  }
});

/**
 * Apu DMC channel. Consists of
 *   - Timer
 *   - Memory reader
 *   - Sample buffer
 *   - Output unit
 */
function ApuDmc(apu) {
  this.apu = apu;

  // 0x4010
  //
  // bit:
  //   7: IRQ enable
  //   6: Loop
  // 3-0: Timer index

  // 0x4011
  //
  // bit:
  // 6-0: Delta counter
  // Unused

  // 0x4012
  //
  // bit:
  // 7-0: Sample address

  // 0x4013
  //
  // bit:
  // 7-0: Sample length

  this.register0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4010
  this.register1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4011
  this.register2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4012
  this.register3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // 0x4013

  //

  this.enabled = false;

  //

  this.timerPeriod = 0;
  this.timerCounter = 0;

  this.deltaCounter = 0;
  this.addressCounter = 0;
  this.remainingBytesCounter = 0;

  this.sampleBuffer = 0;  // 8-bit
  this.sampleBufferIsEmpty = true;

  this.shiftRegister = 0;
  this.remainingBitsCounter = 0;

  this.silenceFlag = true;
}

Object.assign(ApuDmc.prototype, {
  isApuDmc: true,

  //

  TIMER_TABLE: [
    0x1AC, 0x17C, 0x154, 0x140,
    0x11E, 0x0FE, 0x0E2, 0x0D6,
    0x0BE, 0x0A0, 0x08E, 0x080,
    0x06A, 0x054, 0x048, 0x036
  ],

  //

  /**
   *
   */
  storeRegister: function(address, value) {
    switch(address) {
      case 0x4010:
        this.register0.store(value);
        this.timerPeriod = this.TIMER_TABLE[this.getTimerIndex()] >> 1;

        break;

      case 0x4011:
        this.register1.store(value);
        this.start();

        break;

      case 0x4012:
        this.register2.store(value);
        this.start();

        break;

      case 0x4013:
        this.register3.store(value);
        this.start();

        break;
    }
  },

  //

  /**
   *
   */
  setEnable: function(enabled) {
    this.enabled = enabled;

    // If DMC enable flag is set via 0x4015,
    // the DMC sample will be restarted only if its remaining bytes is 0.

    if(enabled === true) {
      if(this.remainingBytesCounter === 0)
        this.start();
    } else {
      this.remainingBytesCounter = 0;
    }
  },

  /**
   *
   */
  start: function() {
    this.deltaCounter = this.getDeltaCounter();
    this.addressCounter = this.getSampleAddress() * 0x40 + 0xC000;
    this.remainingBytesCounter = this.getSampleLength() * 0x10 + 1;
  },

  /**
   *
   */
  enabledIrq: function() {
    return this.register0.isBitSet(7);
  },

  /**
   *
   */
  isLoop: function() {
    return this.register0.isBitSet(6);
  },

  /**
   *
   */
  getTimerIndex: function() {
    return this.register0.loadBits(0, 4);
  },

  /**
   *
   */
  getDeltaCounter: function() {
    return this.register1.loadBits(0, 7);
  },

  /**
   *
   */
  getSampleAddress: function() {
    return this.register2.load();
  },

  /**
   *
   */
  getSampleLength: function() {
    return this.register3.load();
  },

  //

  /**
   *
   */
  driveTimer: function() {
    if(this.timerCounter > 0) {
      this.timerCounter--;
    } else {
      this.timerCounter = this.timerPeriod;

      // Memory reader

      if(this.remainingBytesCounter > 0 && this.sampleBufferIsEmpty === true) {
        this.sampleBuffer = this.apu.cpu.load(this.sampleAddress++);
        this.sampleBufferIsEmpty = false;

        // if address exceeds 0xFFFF, it is wrapped around to 0x8000.

        if(this.sampleAddress > 0xFFFF)
          this.sampleAddress = 0x8000;

        this.remainingBytesCounter--;

        // If the bytes remaining counter becomes zero
        //   - the sample is restarted if the loop flag is set
        //   - otherwise, the interrupt flag is set if IRQ enabled flag is set

        if(this.remainingBytesCounter === 0) {
          if(this.isLoop() === true) {
            this.start();
          } else {
            if(this.enabledIrq() === true)
              this.apu.dmcIrqActive = true;
          }
        }

        // The CPU is stalled for up to 4 CPU cycles

        this.apu.cpu.stallCycle += 4;
      }

      // Output unit

      if(this.remainingBitsCounter === 0) {
        this.remainingBitsCounter = 8;

        if(this.sampleBufferIsEmpty === true) {
          this.silenceFlag = true;
        } else {
          this.silenceFlag = false;
          this.sampleBufferIsEmpty = true;
          this.shiftRegister = this.sampleBuffer;
          this.sampleBuffer = 0;
        }
      }

      if(this.silenceFlag === false) {
        if((this.shiftRegister & 1) === 0) {
          if(this.deltaCounter > 1)
            this.deltaCounter -= 2;
        } else {
          if(this.deltaCounter < 126)
            this.deltaCounter += 2;
        }
      }

      this.shiftRegister = this.shiftRegister >> 1;
      this.remainingBitsCounter--;
    }
  },

  /**
   *
   */
  output: function() {

    // Seems like we should ignore enable bit set via 0x4015
    // (or no enable bit in DMC unit?)

    //if(this.enabled === false)
    //  return 0;

    if(this.silenceFlag === true)
      return 0;

    // 7-bit output

    return this.deltaCounter & 0x7F;
  }
});

/**
 *
 */
function ApuStatusRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

ApuStatusRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isApuStatusRegister: true,

  //

  ENABLE_DMC_BIT: 4,
  ENABLE_NOISE_BIT: 3,
  ENABLE_TRIANGLE_BIT: 2,
  ENABLE_PULSE2_BIT: 1,
  ENABLE_PULSE1_BIT: 0
});

/**
 *
 */
function ApuFrameRegister() {
  __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].call(this);
}

ApuFrameRegister.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */].prototype), {
  isApuFrameRegister: true,

  //

  MODE_BIT: 7,
  IRQ_BIT: 6,

  //

  /**
   *
   */
  isFiveStepMode: function() {
    return this.isBitSet(this.MODE_BIT);
  },

  /**
   *
   */
  disabledIrq: function() {
    return this.isBitSet(this.IRQ_BIT);
  }
});





/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Rom; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Memory_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Mapper_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Utility_js__ = __webpack_require__(1);





/**
 * Expects NES ROM arraybuffer consists of the three segments
 * in the following order.
 *   - Header (16bytes)
 *   - Program ROM data(Program ROM banks num * 0x4000 bytes)
 *   - Character ROM data(Character ROM banks num * 0x2000 bytes)
 */
function Rom(arrayBuffer) {
  __WEBPACK_IMPORTED_MODULE_0__Memory_js__["a" /* Memory */].call(this, arrayBuffer);
  this.header = new RomHeader(this);

  if(this.isNes() === false)
    throw new Error('This rom doesn\'t seem iNES format.');

  this.mapper = (new __WEBPACK_IMPORTED_MODULE_1__Mapper_js__["a" /* MapperFactory */]()).create(this.header.getMapperNum(), this);
}

//

Rom.MIRRORINGS = {
  SINGLE_SCREEN: 0,
  HORIZONTAL: 1,
  VERTICAL: 2,
  FOUR_SCREEN: 3
};

//

Rom.prototype = Object.assign(Object.create(__WEBPACK_IMPORTED_MODULE_0__Memory_js__["a" /* Memory */].prototype), {
  isRom: true,

  //

  MIRRORINGS: Rom.MIRRORINGS,

  // load/store methods called by CPU.

  /**
   * CPU memory address:
   * 0x0000 - 0x1FFF: Character ROM access
   * 0x8000 - 0xFFFF: Program ROM access
   *
   * To access wide range ROM data with limited CPU memory address space
   * Mapper maps CPU memory address to ROM's.
   * In general writing control registers in Mapper via .store() switches bank.
   */
  load: function(address) {
    var addressInRom = this.getHeaderSize();

    if(address < 0x2000) {

      // Character ROM access

      addressInRom += this.header.getPRGROMBanksNum() * 0x4000;
      addressInRom += this.mapper.mapForChrRom(address);
    } else {

      // Program ROM access

      addressInRom += this.mapper.map(address);
    }

    return this.data[addressInRom];
  },

  /**
   * In general writing with ROM address space updates control registers in Mapper.
   */
  store: function(address, value) {
    this.mapper.store(address, value);
  },

  //

  /**
   *
   */
  isNes: function() {
    return this.header.isNes();
  },

  /**
   *
   */
  getHeaderSize: function() {
    return this.header.getSize();
  },

  /**
   *
   */
  hasChrRom: function() {
    return this.header.hasChrRom();
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.mapper.getMirroringType();
  },

  // dump methods

  /**
   *
   */
  dumpHeader: function() {
    return this.header.dump();
  },

  /**
   *
   */
  _getStartDumpAddress: function() {
    return this.getHeaderSize();
  },

  /**
   *
   */
  _getEndDumpAddress: function() {
    return this.getCapacity();
  }
});

/**
 *
 */
function RomHeader(rom) {
  this.rom = rom;
}

Object.assign(RomHeader.prototype, {
  isRomHeader: true,

  size: 16,  // 16bytes

  //

  VALID_SIGNATURE: 'NES',
  VALID_MAGIC_NUMBER: 0x1a,

  //

  SIGNATURE_ADDRESS: 0,
  SIGNATURE_SIZE: 3,

  MAGIC_NUMBER_ADDRESS: 3,
  MAGIC_NUMBER_SIZE: 1,

  PRG_ROM_BANKS_NUM_ADDRESS: 4,
  PRG_ROM_BANKS_NUM_SIZE: 1,

  CHR_ROM_BANKS_NUM_ADDRESS: 5,
  CHR_ROM_BANKS_NUM_SIZE: 1,

  CONTROL_BYTE1_ADDRESS: 6,
  CONTROL_BYTE1_SIZE: 1,

  CONTROL_BYTE2_ADDRESS: 7,
  CONTROL_BYTE2_SIZE: 1,

  RAM_BANKS_NUM_ADDRESS: 8,
  RAM_BANKS_NUM_SIZE: 1,

  UNUSED_ADDRESS: 9,
  UNUSED_SIZE: 7,

  //

  MIRRORING_TYPE_BIT: 0,
  MIRRORING_TYPE_BITS_WIDTH: 1,
  MIRRORING_TYPE_HORIZONTAL: 0,
  MIRRORING_TYPE_VERTICAL: 1,

  BATTERY_BACKED_RAM_BIT: 1,
  BATTERY_BACKED_RAM_BITS_WIDTH: 1,

  TRAINER_512BYTES_BIT: 2,
  TRAINER_512BYTES_BITS_WIDTH: 1,

  FOUR_SCREEN_MIRRORING_BIT: 3,
  FOUR_SCREEN_MIRRORING_BITS_WIDTH: 1,

  MAPPER_LOWER_BIT: 4,
  MAPPER_LOWER_BITS_WIDTH: 4,

  MAPPER_HIGHER_BIT: 4,
  MAPPER_HIGHER_BITS_WIDTH: 4,

  //

  /**
   *
   */
  getSize: function() {
    return this.size;
  },

  /**
   *
   */
  isNes: function() {
    if(this.getSignature() !== this.VALID_SIGNATURE)
      return false;

    if(this.getMagicNumber() !== this.VALID_MAGIC_NUMBER)
      return false;

    return true;
  },

  //

  /**
   *
   */
  load: function(address) {
    return this.rom.loadWithoutMapping(address);
  },

  /**
   *
   */
  getSignature: function() {
    var str = '';

    for(var i = 0; i < this.SIGNATURE_SIZE; i++)
      str += String.fromCharCode(this.load(this.SIGNATURE_ADDRESS + i));

    return str;
  },

  /**
   *
   */
  getMagicNumber: function() {
    return this.load(this.MAGIC_NUMBER_ADDRESS);
  },

  /**
   *
   */
  getPRGROMBanksNum: function() {
    return this.load(this.PRG_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getCHRROMBanksNum: function() {
    return this.load(this.CHR_ROM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  hasChrRom: function() {
    return this.getCHRROMBanksNum() > 0;
  },

  /**
   *
   */
  getControlByte1: function() {
    return this.load(this.CONTROL_BYTE1_ADDRESS);
  },

  /**
   *
   */
  getControlByte2: function() {
    return this.load(this.CONTROL_BYTE2_ADDRESS);
  },

  /**
   *
   */
  getRAMBanksNum: function() {
    return this.load(this.RAM_BANKS_NUM_ADDRESS);
  },

  /**
   *
   */
  getUnusedField: function() {
    var value = 0;

    for(var i = 0; i < this.UNUSED_SIZE; i++)
      value = (value << 8) | this.load(this.UNUSED_ADDRESS + i);

    return value;
  },

  //

  /**
   *
   */
  extractBits: function(value, offset, size) {
    return (value >> offset) & ((1 << size) - 1);
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.extractBits(this.getControlByte1(),
             this.MIRRORING_TYPE_BIT, this.MIRRORING_TYPE_BITS_WIDTH);
  },

  /**
   *
   */
  getMirroringTypeAsStrings: function() {
    return (this.getMirroringType() === this.MIRRORING_TYPE_HORIZONTAL)
             ? 'horizontal' : 'vertical';
  },

  /**
   *
   */
  isHorizontalMirroring: function() {
    return this.getMirroringType() === this.MIRRORING_TYPE_HORIZONTAL;
  },

  /**
   *
   */
  getBatteryBackedRAM: function() {
    return this.extractBits(this.getControlByte1(),
             this.BATTERY_BACKED_RAM_BIT, this.BATTERY_BACKED_RAM_BITS_WIDTH);
  },

  /**
   *
   */
  getTrainer512Bytes: function() {
    return this.extractBits(this.getControlByte1(),
             this.TRAINER_512BYTES_BIT, this.TRAINER_512BYTES_BITS_WIDTH);
  },

  /**
   *
   */
  getFourScreenMirroring: function() {
    return this.extractBits(this.getControlByte1(),
             this.FOUR_SCREEN_MIRRORING_BIT, this.FOUR_SCREEN_MIRRORING_BITS_WIDTH);
  },

  /**
   *
   */
  getMapperNum: function() {
    var lowerBits = this.extractBits(this.getControlByte1(),
                      this.MAPPER_LOWER_BIT, this.MAPPER_LOWER_BITS_WIDTH);
    var higherBits = this.extractBits(this.getControlByte2(),
                       this.MAPPER_HIGHER_BIT, this.MAPPER_HIGHER_BITS_WIDTH);
    return (higherBits << this.MAPPER_LOWER_BITS_WIDTH) | lowerBits;
  },

  /**
   *
   */
  dump: function() {
    var buffer = '';

    buffer += '0x ';
    for(var i = 0; i < this.getSize(); i++) {
      buffer += __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.load(i), 2, true) + ' ';
    }
    buffer += '\n\n';

    buffer += 'Signature: ' + this.getSignature() + '\n';
    buffer += 'Magic Number: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getMagicNumber(), 2) + '\n';
    buffer += 'PRG-ROM banks num: ' +
                __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getPRGROMBanksNum(), 2) + '\n';
    buffer += 'CHR-ROM banks num: ' +
                __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getCHRROMBanksNum(), 2) + '\n';
    buffer += 'Control1: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getControlByte1(), 2) + '\n';
    buffer += 'Control2: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getControlByte2(), 2) + '\n';
    buffer += 'RAM banks num: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getRAMBanksNum(), 2) + '\n';
    buffer += 'Unused field: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getUnusedField(), 14) + '\n';
    buffer += '\n';
    buffer += 'In control bytes\n';
    buffer += 'Mirroring type: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getMirroringType()) +
                '(' + this.getMirroringTypeAsStrings() + ')\n';
    buffer += 'Battery-backed RAM: ' +
                 __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getBatteryBackedRAM()) + '\n';
    buffer += '512-byte trainer: ' +
                __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getTrainer512Bytes()) + '\n';
    buffer += 'Four screen mirroring: ' +
                 __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getFourScreenMirroring()) + '\n';
    buffer += 'Mapper number: ' + __WEBPACK_IMPORTED_MODULE_2__Utility_js__["a" /* Utility */].convertDecToHexString(this.getMapperNum(), 2) +
                '(' + (new __WEBPACK_IMPORTED_MODULE_1__Mapper_js__["a" /* MapperFactory */]()).getName(this.getMapperNum()) + ')';
    return buffer;
  }
});





/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Mapper */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MapperFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Register_js__ = __webpack_require__(0);



/**
 *
 */

/**
 *
 */
function MapperFactory() {

}

Object.assign(MapperFactory.prototype, {
  isMapperFactory: true,

  //

  MAPPERS: {
    0:  {'name': 'NROM',      class: NROMMapper},
    1:  {'name': 'MMC1',      class: MMC1Mapper},
    2:  {'name': 'UNROM',     class: UNROMMapper},
    3:  {'name': 'CNROM',     class: CNROMMapper},
    4:  {'name': 'MMC3',      class: MMC3Mapper},
    76: {'name': 'Mapper76',  class: Mapper76}
  },

  // public methods

  /**
   *
   */
  create: function(number, rom) {
    return new (this.getMapperParam(number)).class(rom);
  },

  /**
   *
   */
  getName: function(number) {
    return this.getMapperParam(number).name;
  },

  // private method

  /**
   *
   */
  getMapperParam: function(number) {
    if(this.MAPPERS[number] === undefined)
      throw new Error('unsupport No.' + number + ' Mapper');

    return this.MAPPERS[number];
  }
});

/**
 *
 */
function Mapper(rom) {
  this.rom = rom;
  this.prgBankNum = rom.header.getPRGROMBanksNum();
  this.chrBankNum = rom.header.getCHRROMBanksNum();
}

Object.assign(Mapper.prototype, {
  isMapper: true,

  /**
   * Maps CPU memory address 0x8000 - 0xFFFF to the offset
   * in Program segment of Rom for Program ROM access
   */
  map: function(address) {
    return address - 0x8000;
  },

  /**
   * Maps CPU memory address 0x0000 - 0x1FFF to the offset
   * in Character segment of Rom for Character ROM access
   */
  mapForChrRom: function(address) {
    return address;
  },

  /**
   * In general, updates control registers in Mapper
   */
  store: function(address, value) {
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.rom.header.isHorizontalMirroring() === true
             ? this.rom.MIRRORINGS.HORIZONTAL : this.rom.MIRRORINGS.VERTICAL;
  }
});

/**
 *
 */
function NROMMapper(rom) {
  Mapper.call(this, rom);
}

NROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isNROMMapper: true,

  /**
   *
   */
  map: function(address) {
    // 0x8000 - 0xBFFF: First 16 KB of ROM
    // 0xC000 - 0xFFFF: Last 16 KB of ROM (NROM-256) or
    //                  mirror of 0x8000 - 0xBFFF (NROM-128).

    if(this.prgBankNum === 1 && address >= 0xC000)
      address -= 0x4000;

    return address - 0x8000;
  }
});

/**
 *
 */
function MMC1Mapper(rom) {
  Mapper.call(this, rom);

  this.controlRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // register 0
  this.chrBank0Register = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */](); // register 1
  this.chrBank1Register = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */](); // register 2
  this.prgBankRegister = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();  // register 3

  this.latch = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();

  this.registerWriteCount = 0;

  this.controlRegister.store(0x0C);  // seems like 0xC would be default value
}

MMC1Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC1Mapper: true,

  /**
   *
   */
  map: function(address) {
    var bank = 0;
    var offset = address & 0x3FFF;
    var bankNum = this.prgBankRegister.load() & 0x0F;

    switch(this.controlRegister.loadBits(2, 2)) {
      case 0:
      case 1:

        // switch 32KB at 0x8000, ignoring low bit of bank number

        // TODO: Fix me

        offset = offset | (address & 0x4000);
        bank = bankNum & 0x0E;
        break;

      case 2:

        // fix first bank at 0x8000 and switch 16KB bank at 0xC000

        bank = (address < 0xC000) ? 0 : bankNum;
        break;

      case 3:

        // fix last bank at 0xC000 and switch 16KB bank at 0x8000

        bank = (address >= 0xC000) ? this.prgBankNum - 1 : bankNum;
        break;
    }

    return bank * 0x4000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
    var bank;
    var offset = address & 0x0FFF;

    if(this.controlRegister.loadBit(4) === 0) {

      // switch 8KB at a time

      bank = (this.chrBank0Register.load() & 0x1E);
      offset = offset | (address & 0x1000);
    } else {

      // switch two separate 4KB banks

      bank = ((address < 0x1000) ? this.chrBank0Register.load() : this.chrBank1Register.load()) & 0x1F;
    }

    return bank * 0x1000 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    if(value & 0x80) {
      this.registerWriteCount = 0;
      this.latch.clear();

      if((address & 0x6000) === 0)
        this.controlRegister.storeBits(2, 2, 3)
    } else {
      this.latch.store(((value & 1) << 4) | (this.latch.load() >> 1));
      this.registerWriteCount++;

      if(this.registerWriteCount >= 5) {
        var val = this.latch.load();

        switch(address & 0x6000) {
          case 0x0000:
            this.controlRegister.store(val);
            break;

          case 0x2000:
            this.chrBank0Register.store(val);
            break;

          case 0x4000:
            this.chrBank1Register.store(val);
            break;

          case 0x6000:
            this.prgBankRegister.store(val);
            break;
        }

        this.registerWriteCount = 0;
        this.latch.clear();
      }
    }
  },

  /**
   * TODO: Fix me
   */
  getMirroringType: function() {
    switch(this.controlRegister.loadBits(0, 2)) {
      case 0:
      case 1:
        return this.rom.MIRRORINGS.SINGLE_SCREEN;

      case 2:
        return this.rom.MIRRORINGS.VERTICAL;

      case 3:
        return this.rom.MIRRORINGS.HORIZONTAL;
    }
  }
});

/**
 *
 */
function UNROMMapper(rom) {
  Mapper.call(this, rom);
  this.reg = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
}

UNROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isUNROMMapper: true,

  /**
   *
   */
  map: function(address) {
    var bank = (address < 0xC000) ? this.reg.load() : this.prgBankNum - 1;
    var offset = address & 0x3FFF;
    return 0x4000 * bank + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    this.reg.store(value & 0xF);
  }
});

/**
 *
 */
function CNROMMapper(rom) {
  Mapper.call(this, rom);
  this.reg = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
}

CNROMMapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isCNROMMapper: true,

  /**
   *
   */
  mapForChrRom: function(address) {
    return this.reg.load() * 0x2000 + (address & 0x1FFF);
  },

  /**
   *
   */
  store: function(address, value) {
    this.reg.store(value & 0xF);
  }
});

/**
 *
 */
function MMC3Mapper(rom) {
  Mapper.call(this, rom);

  this.register0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register4 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register5 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register6 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.register7 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();

  this.programRegister0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.programRegister1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();

  this.characterRegister0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.characterRegister1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.characterRegister2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.characterRegister3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.characterRegister4 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.characterRegister5 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();

  this.irqCounter = 0;
  this.irqCounterReload = false;
  this.irqEnabled = true;  // @TODO: check if default is true
}

MMC3Mapper.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMMC3Mapper: true,

  /**
   *
   */
  map: function(address) {
    address = address & 0xFFFF;  // just in case

    var offset = address & 0x1FFF;
    var bank = 0;

    if(address >= 0x8000 && address < 0xA000) {
      bank = this.register0.isBitSet(6) === true ? this.prgBankNum * 2 - 2 : this.programRegister0.load();
    } else if(address >= 0xA000 && address < 0xC000) {
      bank = this.programRegister1.load();
    } else if(address >= 0xC000 && address < 0xE000) {
      bank = this.register0.isBitSet(6) === true ? this.programRegister0.load() : this.prgBankNum * 2 - 2;
    } else {
      bank = this.prgBankNum * 2 - 1;
    }

    return bank * 0x2000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
    address = address & 0x1FFF;  // just in case

    var offset = address & 0x03FF;
    var bank = 0;

    if(this.register0.isBitSet(7) === true) {
      if(address >= 0x0000 && address < 0x0400) {
        bank = this.characterRegister2.load();
      } else if(address >= 0x0400 && address < 0x0800) {
        bank = this.characterRegister3.load();
      } else if(address >= 0x0800 && address < 0x0C00) {
        bank = this.characterRegister4.load();
      } else if(address >= 0x0C00 && address < 0x1000) {
        bank = this.characterRegister5.load();
      } else if(address >= 0x1000 && address < 0x1400) {
        bank = this.characterRegister0.load() & 0xFE;
      } else if(address >= 0x1400 && address < 0x1800) {
        bank = this.characterRegister0.load() | 1;
      } else if(address >= 0x1800 && address < 0x1C00) {
        bank = this.characterRegister1.load() & 0xFE;
      } else {
        bank = this.characterRegister1.load() | 1;
      }
    } else {
      if(address >= 0x0000 && address < 0x0400) {
        bank = this.characterRegister0.load() & 0xFE;
      } else if(address >= 0x0400 && address < 0x0800) {
        bank = this.characterRegister0.load() | 1;
      } else if(address >= 0x0800 && address < 0x0C00) {
        bank = this.characterRegister1.load() & 0xFE;
      } else if(address >= 0x0C00 && address < 0x1000) {
        bank = this.characterRegister1.load() | 1;
      } else if(address >= 0x1000 && address < 0x1400) {
        bank = this.characterRegister2.load();
      } else if(address >= 0x1400 && address < 0x1800) {
        bank = this.characterRegister3.load();
      } else if(address >= 0x1800 && address < 0x1C00) {
        bank = this.characterRegister4.load();
      } else {
        bank = this.characterRegister5.load();
      }
    }

    return bank * 0x400 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    address = address & 0xFFFF;  // just in case

    if(address >= 0x8000 && address < 0xA000) {
      if((address & 1) === 0) {
        this.register0.store(value);
      } else {
        this.register1.store(value);

        switch(this.register0.loadBits(0, 3)) {
          case 0:
            this.characterRegister0.store(value & 0xFE);
            break;

          case 1:
            this.characterRegister1.store(value & 0xFE);
            break;

          case 2:
            this.characterRegister2.store(value);
            break;

          case 3:
            this.characterRegister3.store(value);
            break;

          case 4:
            this.characterRegister4.store(value);
            break;

          case 5:
            this.characterRegister5.store(value);
            break;

          case 6:
            this.programRegister0.store(value & 0x3F);
            break;

          case 7:
            this.programRegister1.store(value & 0x3F);
            break;
        }
      }
    } else if(address >= 0xA000 && address < 0xC000) {
      if((address & 1) === 0) {
        this.register2.store(value);
      } else {
        this.register3.store(value);
      }
    } else if(address >= 0xC000 && address < 0xE000) {
      if((address & 1) === 0) {
        this.register4.store(value);
      } else {
        this.register5.store(value);
      }

      this.irqCounterReload = true;
    } else {
      if((address & 1) === 0) {
        this.register6.store(value);
        this.irqEnabled = false;
      } else {
        this.register7.store(value);
        this.irqEnabled = true;
      }
    }
  },

  /**
   *
   */
  getMirroringType: function() {
    return this.register2.isBitSet(0) === true ? this.rom.MIRRORINGS.HORIZONTAL : this.rom.MIRRORINGS.VERTICAL;
  },

  /**
   *
   */
  driveIrqCounter: function(cpu) {
    if(this.irqCounterReload === true) {
      this.irqCounter = this.register4.load();
      this.irqCounterReload = false;
    } else {
      if(this.irqEnabled === true) {
        if(this.irqCounter > 0) {
          this.irqCounter--;

          if(this.irqCounter === 0) {
            cpu.interrupt(cpu.INTERRUPTS.IRQ);
            this.irqCounterReload = true;
          }
        }
      }
    }
  }
});

/**
 *
 */
function Mapper76(rom) {
  Mapper.call(this, rom);
  this.addrReg = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.chrReg0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.chrReg1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.chrReg2 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.chrReg3 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.prgReg0 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
  this.prgReg1 = new __WEBPACK_IMPORTED_MODULE_0__Register_js__["b" /* Register8bit */]();
}

Mapper76.prototype = Object.assign(Object.create(Mapper.prototype), {
  isMapper76: true,

  /**
   *
   */
  map: function(address) {
    var bank;
    var offset = address & 0x1FFF;

    switch(address & 0xE000) {
      case 0x8000:
        bank = this.prgReg0.load();
        break;

      case 0xA000:
        bank = this.prgReg1.load();
        break;

      case 0xC000:
        bank = this.prgBankNum * 2 - 2;
        break;

      case 0xE000:
        bank = this.prgBankNum * 2 - 1;
        break;
    }

    return bank * 0x2000 + offset;
  },

  /**
   *
   */
  mapForChrRom: function(address) {
    var bank;
    var offset = address & 0x7FF;

    switch(address & 0x1800) {
      case 0x0000:
        bank = this.chrReg0.load();
        break;

      case 0x0800:
        bank = this.chrReg1.load();
        break;

      case 0x1000:
        bank = this.chrReg2.load();
        break;

      case 0x1800:
        bank = this.chrReg3.load();
        break;
    }

    return bank * 0x800 + offset;
  },

  /**
   *
   */
  store: function(address, value) {
    switch(address & 0xE001) {
      case 0x8000:
        this.addrReg.store(value & 0x7);
        break;

      case 0x8001:
        var reg;

        switch(this.addrReg.load()) {
          case 0:
          case 1:
            return;

          case 2:
            reg = this.chrReg0;
            break;

          case 3:
            reg = this.chrReg1;
            break;

          case 4:
            reg = this.chrReg2;
            break;

          case 5:
            reg = this.chrReg3;
            break;

          case 6:
            reg = this.prgReg0;
            break;

          case 7:
            reg = this.prgReg1;
            break;
        }

        reg.store(value & 0x3F);
        break;
    }
  }
});





/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Audio; });
/**
 * Handling audio output with Web Audio.
 */
function Audio() {
  var self = this;

  //

  var audioContext = AudioContext || webkitAudioContext;

  if(audioContext === undefined)
    throw new Error('This browser seems not to support AudioContext.');

  //

  this.bufferLength = 4096;
  this.buffer = new Float32Array(this.bufferLength);
  this.bufferIndex = 0;

  //

  this.context = new audioContext();
  this.scriptProcessor = this.context.createScriptProcessor(this.bufferLength, 0, 1);

  this.scriptProcessor.onaudioprocess = function(e) {
    self.onAudioProcess(e);
  };

  this.scriptProcessor.connect(this.context.destination);
  this.sampleRate = this.context.sampleRate;
}

Object.assign(Audio.prototype, {
  isAudio: true,

  /**
   *
   */
  getSampleRate: function() {
    return this.sampleRate;
  },

  /**
   *
   */
  onAudioProcess: function(e) {
    var data = e.outputBuffer.getChannelData(0);

    for(var i = 0, il = this.bufferLength; i < il; i++)
      data[i] = this.buffer[i];

    // @TODO: Fix me

    for(var i = this.bufferIndex, il = this.bufferLength; i < il; i++)
      data[i] = this.bufferIndex === 0 ? 0.0 : this.buffer[this.bufferIndex - 1];

    this.bufferIndex = 0;
  },

  /**
   *
   */
  push: function(data) {
    if(this.bufferIndex >= this.bufferLength)
      return;

    this.buffer[this.bufferIndex++] = data;
  }
});





/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Display; });
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





/***/ })
/******/ ]);