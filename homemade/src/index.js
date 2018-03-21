(function() {
  var url = document.currentScript
  var root = document.getElementById('root');

  window.addEventListener('DOMContentLoaded', function() {
    Promise.all(['lib/state/state.js', 'src/app.js', 'lib/renderer/renderer.js'].map(function(url) { return module.import(url); })).then(function(imports) {
      window.setState = imports[0];
      var App         = imports[1].App;
      var render      = imports[2].render;
      window.state = { page: 'HOME' }

      render(App(), root);

      window.addEventListener('stateupdate', function() {
        render(App(), root)
      })
    })
  })

})()
