
var tagFactory = function(tag) {
  return function() {
    var args = [].slice.call(arguments)
    var head = args[0]
    var attribute = ''
    var attributes = []
    var key;

    var dataAttribute;
    var dataList = []
    var dataKey

    if (typeof head === 'object') {
      for (key in head) {
        attribute = head[key];

        if (key === 'data') {
          dataList = []

          for (dataKey in attribute) {
            dataAttribute = attribute[dataKey]
            dataList.push(key+'-'+dataKey+'="'+dataAttribute+'"')
          }

          attribute = dataList.join(' ')
        } else if (key === 'className') {
          key = 'class'
        }

        attributes.push(key+'="'+attribute+'"')
      }

      args.splice(0,1)
    }

    return '<'+tag+' '+attributes.join(' ')+'>'
         + args.reduce(function(arg, str) { return arg + str; }, '')
         + '</'+tag+'>'
  }
}

var div = tagFactory('div')
var p = tagFactory('p')
var h1 = tagFactory('h1')
var a = tagFactory('a')
