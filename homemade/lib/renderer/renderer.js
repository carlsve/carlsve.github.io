(function() {
  var render = function(node, root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    traverse(root, node);
  }

  function traverse(parentNode, childNode) {
    var node = childNode.node;
    var _TYPE = childNode._TYPE;

    if (_TYPE === 'TEXT') {
      parentNode.appendChild(node);
    } else if (_TYPE === 'NODE') {
      parentNode.appendChild(node);
      parentNode = node;
      childNode.children.forEach(function(child)  {
        traverse(parentNode, child);
      })
    }
  }

  module.export({ render: render })
})()
