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


export {Utility};
