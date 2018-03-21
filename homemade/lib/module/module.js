(function() {
  var exports = {};
  var moduleLoadEvent = new Event('moduleload', {});

  window.module = {
    export: function(data, script) {
      var exportScript = document.currentScript;

      if (script) {
        exportScript = script;
      }

      var exportUrl = exportScript.getAttributeNode('src').value;
      var moduleHash = this.hash(exportUrl);

      exports[moduleHash] = data;
      exportScript.dispatchEvent(moduleLoadEvent)
    },
    import: function(url) {
      var moduleHash = this.hash(url)

      if (result = exports[moduleHash]) {
        return Promise.resolve(result)
      }

      return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        var src = document.createAttribute('src');

        src.value = url
        script.setAttributeNode(src)

        script.addEventListener('moduleload', function() {
          resolve(exports[moduleHash])
        })
        script.addEventListener('error', reject)

        document.body.appendChild(script)
      })
    },
    hash: function(str){
      var hash = 0;
      if (str.length == 0) return hash;
      for (i = 0; i < str.length; i++) {
          char = str.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    }
  }
})()
