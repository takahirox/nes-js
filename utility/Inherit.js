/**
 *
 */
function __inherit(child, parent) {
  var getPrototype = function(p) {
    if(Object.create) {
      return Object.create(p);
    }
    function f() {};
    f.prototype = p;
    return new f();
  };
  child.prototype = getPrototype(parent.prototype);
  child.prototype.constructor = child;
}
