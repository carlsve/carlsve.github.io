
var state = {};
var stateUpdateEvent = new CustomEvent('stateupdate');
var setState = function(obj) {
  state = Object.assign(state, obj);
  window.dispatchEvent(stateUpdateEvent)
}

window.setState = setState;

module.export(setState)
