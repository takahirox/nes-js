/**
 * TODO: should be IO port class?
 */
function Joypad() {
  this.register = new RegisterWithCallback(this._ID_REG, this, true, true);
  this.count = 0;
  this.strobeFlag = false;
  this.previousValue = 0;
  this.buttons = [];
  for(var i = 0; i < this._BUTTON_NUM; i++)
    this.buttons[i] = false;
};

Joypad.prototype._ID_REG = 0;

Joypad.prototype._BUTTON_A      = 0;
Joypad.prototype._BUTTON_B      = 1;
Joypad.prototype._BUTTON_SELECT = 2;
Joypad.prototype._BUTTON_START  = 3;
Joypad.prototype._BUTTON_UP     = 4;
Joypad.prototype._BUTTON_DOWN   = 5;
Joypad.prototype._BUTTON_LEFT   = 6;
Joypad.prototype._BUTTON_RIGHT  = 7;

Joypad.prototype._BUTTON_NUM = 8;

Joypad.prototype._STROBE_BIT = 0;


/**
 * TODO: temporal
 */
Joypad.prototype.notifyRegisterLoading = function(id) {
  this.previousValue = 0;
  if(this.strobeFlag) {
    var value = this.count >= this._BUTTON_NUM ||
                  this.buttons[this.count] ? 0x01 : 0x00;
    this.register.store(value, true);
    this.count++;
  }
};


/**
 * TODO: temporal
 */
Joypad.prototype.notifyRegisterStoring = function() {
  var value = this.register.load(true) & 1;
  if(this.previousValue == 1 && value == 0) {
    this.strobeFlag = true;
    this.count = 0;
  } else {
    this.strobeFlag = false;
  }
  this.previousValue = value & 1;
};


Joypad.prototype.pushButton = function(type) {
  this.buttons[type] = true;
};


Joypad.prototype.releaseButton = function(type) {
  this.buttons[type] = false;
};
