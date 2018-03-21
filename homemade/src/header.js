(function() {
  var script = document.currentScript

  module.import('lib/tags/tags.js').then(function(imports) {
    var header = imports.header;
    var nav    = imports.nav;
    var img    = imports.img;
    var a      = imports.a;

    var Header = header({ className: 'header' },
      img({ src: 'src/images/homegrown-react.png' }),
      nav({ className: 'navbar' },
        a({ className: 'navbar__item', onclick: "window.setState({ page: 'HOME' })"    }, 'home'),
        a({ className: 'navbar__item', onclick: "window.setState({ page: 'ABOUT' })"   }, 'about'),
        a({ className: 'navbar__item', onclick: "window.setState({ page: 'CONTACT' })" }, 'contact')
      )
    )

    module.export({ Header: Header }, script)
  })
})()
