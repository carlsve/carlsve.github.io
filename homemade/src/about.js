(function() {
  var script = document.currentScript;

  module.import('lib/tags/tags.js').then(function(imports) {
    var main = imports.main;
    var h1   = imports.h1;
    var p    = imports.p;

    var About = main({ className: 'content' },
      h1({ className: 'content__header' }, 'What is this?'),
      p({ className: 'content__paragraph' },
        `This is a custom, react style renderer and templating engine, built purely in browser js.
        It's really stupid. Never actually use this.`
      ),
    )

    module.export(About, script)
  })
})()
