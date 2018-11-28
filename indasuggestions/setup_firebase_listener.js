'use strict' // <- use strict will make javascript a tiny bit less messy, google it!

// Configuration, added from our cloud database at Google Firebase
var config = {
  apiKey: "AIzaSyDYB082yjmK1akpLhtI924ENHtI01gyb68",
  authDomain: "indalistatest.firebaseapp.com",
  databaseURL: "https://indalistatest.firebaseio.com",
  projectId: "indalistatest",
  storageBucket: "indalistatest.appspot.com",
  messagingSenderId: "1003982938920"
};

// Initialize Firebase with relevant configuration
firebase.initializeApp(config);

// This is the 'ul' element that we access.
var suggestions = document.getElementById('suggestions');

// Get a database reference to our questions!
window.ref = firebase.database().ref("questions");

// Set up event listener. Each time a child is added to the database
// Firebase will automatically ping our website with the new information!
// This also works when we load the website!
ref.on('child_added', function(snapshot) {
  var entry = snapshot.val();
  var suggestion = document.createElement('li');
  var suggestionContent = document.createTextNode(entry.title) 
  
  // We first add the text content to the list item (suggestion)
  // then add the list item to the unordered list (suggestions)
  suggestion.appendChild(suggestionContent);
  suggestions.appendChild(suggestion);
})
