(function() {
  var script = document.currentScript;

  module.import('lib/tags/tags.js').then(function(imports) {
    var main = imports.main;
    var h1   = imports.h1;
    var p    = imports.p;

    var Home = main({ className: 'content' },
      h1({ className: 'content__header' }, 'Lorem Ipsum'),
      p({ className: 'content__paragraph' },
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
        irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
        est laborum.`
      ),
      p({ className: 'content__paragraph' },
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
        irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
        est laborum.`
      ),
    )

    module.export(Home, script)
  })
})()
