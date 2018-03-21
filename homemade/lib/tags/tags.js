(function() {
  var script = document.currentScript;

  module.import('lib/tags/tagfactory.js').then(function(imports) {
    var tags = ['div', 'header', 'footer', 'main', 'a', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'li', 'nav', 'img']
    var exports = {}

    tags.forEach(function(tag) {
      exports[tag] = imports.tagFactory(tag);
    })
    
    module.export(exports, script)
  })

})()
