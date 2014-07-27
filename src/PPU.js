function PPU() {
  this.ctrl1 = new PPUControl1Register();
  this.ctrl2 = new PPUControl2Register();
  this.sr = new PPUStatusRegister(); // Status Register
  this.sprAddr = new Register();
  this.sprIO = new Register();
  this.vRAMAddr1 = new Register();
  this.vRAMAddr2 = new Register();
  this.vRAMIO = new Register();

  // TODO: temporal
  this.sr.store(0x80);
};


/**
 * TODO: not implemented yet.
 */
PPU.prototype.runCycle = function() {

};



function PPUControl1Register() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUControl1Register, Register);



function PPUControl2Register() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUControl2Register, Register);



function PPUStatusRegister() {
  this.parent = Register;
  this.parent.call(this);
};
__inherit(PPUStatusRegister, Register);

