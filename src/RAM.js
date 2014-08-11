/**
 * CPU RAM.
 */
function RAM() {
  this.parent = GenericMemory;
  this.parent.call(this, RAM._CAPACITY);
};
__inherit(RAM, GenericMemory);

RAM._CAPACITY = 64 * 1024; // 64KB
