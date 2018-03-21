(function() {

  var tagFactory = function(tagName) {
    return function() {
      var tag = document.createElement(tagName);
      var args = [].slice.call(arguments);
      var head = args[0];

      // If the first element is an attribute object
      if (typeof head === 'object' && !head.hasOwnProperty('_TYPE')) {
        for (var key in head) {
          var attr;

          if (key === 'className') {
            attr = document.createAttribute('class')
          } else {
            attr = document.createAttribute(key);
          }

          attr.value = head[key];


          tag.setAttributeNode(attr)
        }
        args.splice(0,1);
      }

      return {
        node: tag,
        children: args.map(function(arg) {
          if (typeof arg === 'string') {
            return {
              node: document.createTextNode(arg),
              _TYPE: 'TEXT'
            };
          }
          return arg;
        }),
        _TYPE: 'NODE'
      };
    }
  }

  module.export({ tagFactory: tagFactory })
})()

/* LEGACY OLD TAGFACTORY DONT USE

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
}*/
