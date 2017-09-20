function Utility() {

}

Utility.convertDecToHexString = function(num, figure, noPrefix) {
  var str = num.toString(16);
  var base = '';
  var prefix = (noPrefix == null) ? '0x' : '';

  if(figure != null) {
    for(var i = 0; i < figure; i++)
      base += '0';
    return prefix + (base + str).substr(-1*figure);
  }
  return prefix + str;
};


export {Utility};
