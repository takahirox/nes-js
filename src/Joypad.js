/**
 * Standard joypad implementation.
 * Refer to https://wiki.nesdev.com/w/index.php/Standard_controller
 */
function Joypad() {
  this.register = new RegisterWithCallback(0, this, true, true);

  this.latch = 0;
  this.currentButton = 0;

  this.buttonNum = this.getButtonsNum();

  this.buttons = [];  // if buttons are being pressed
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

  BUTTONS: Joypad.BUTTONS,

  //

  /**
   *
   */
  getButtonsNum: function() {
    var num = 0;
    for (var key in this.BUTTONS) {
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
  notifyRegisterLoading: function(id) {
    var button = this.latch === 1 ? 0 : this.currentButton++;

    // 1: a button is being pressed or after eight reads
    // 0: otherwise
    var value = (button >= this.buttonNum || this.buttons[button]) ? 1 : 0;

    // to return the button state to CPU, writes value to the register
    this.register.store(value, true);
  },

  /**
   *
   */
  notifyRegisterStoring: function() {
    var value = this.register.loadBit(0);

    if (value === 1)
      this.currentButton = 0;

    this.latch = value;
  }
});
