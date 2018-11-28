'use strict'

// Forms suck. But its alright. We need to be able to add data to our Firebase database!
var addSuggestionForm = document.getElementById('add_suggestion')

// The 'submit' event is fired when you press the 'Lägg till förslag!' <button> tag.
// We want to add our own specific weird code, so we have to hook into the event ourselves.
// The web-page will 'listen' for this submit event, and execute the function(event) code!
addSuggestionForm.addEventListener('submit', function(event) {
  // I don't know if preventDefault is meaningful here, google it to see what it does!
  event.preventDefault();
  
  // The first child of the <form> tag is the input.
  var input = document.getElementById('input_suggestion');
  var suggestionString = input.value;
  
  // Yeah you don't need to suggest fika a million times... :P
  if (suggestionString.toLowerCase().indexOf('fika') != -1) {
    alert('Jaaaa jag veeeet! :P');
    input.value = "";
    return false;
  }
  
  // remember how we added a database-reference in 'setup_firebase_listener.js'?
  // We use the database-reference to add new suggestions to the database!
  window.ref.push().set({
    title: suggestionString
  })
  
  // reset input.
  input.value = "";

  // We are done. We return false because html forms suck.
  // If we didn't return false here, the page would reload.
  // Since Google Friebase is an 'active' database, it will
  // update in real time, so we really don't need to reload the page!
  return false;
})