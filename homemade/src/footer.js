(function() {
  var script = document.currentScript;

  module.import('lib/tags/tags.js').then(function(imports) {
    var footer = imports.footer;
    var ul     = imports.ul;
    var li     = imports.li;

    var Footer = footer({ className: 'footer' },
      ul({ className: 'footer__items' },
        li('Carl Petter'),
      ),
      ul({ className: 'footer__items' },
        li('lorem'),
        li('ipsum')
      )
    )

    module.export({ Footer: Footer }, script);
  })
})()
