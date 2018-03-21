(function() {
  var url = document.currentScript;

  Promise.all(['src/header.js', 'src/home.js', 'src/about.js', 'src/footer.js', 'lib/tags/tags.js'].map(function(url) { return module.import(url); })).then(function(imports) {
    var Navbar  = imports[0].Header;
    var Home = imports[1];
    var About = imports[2];
    var Footer  = imports[3].Footer;
    var tags    = imports[4];

    var div = tags.div;

    var App = function() { return div({ className: 'container' },
      Navbar,
      getPage(),
      Footer
    )
    }

    module.export({ App: App }, url)

    function getPage() {
      switch(window.state.page) {
        case 'HOME':  return Home;
        case 'ABOUT': return About;
        case 'CONTACT': return Home;
        default: return Home;
      }
    }
  })
})()
