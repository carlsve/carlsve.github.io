/*
 *  Add event listener to the mobile screen menu button.
 *  content: toggle .deactivated
 *  header: toggle .menu-opened
 *  menu_icon: toggle activated
 */
var burgerContainer = document.querySelector('#burger-container');

burgerContainer.onclick = function () {

    var header = document.querySelector(".header");
    var menu_icon = document.querySelector("#menu_icon");
    var content = document.querySelector(".content");

    header.classList.toggle("menu-opened");
    menu_icon.classList.toggle("activated");
    content.classList.toggle("deactivated");
};

/*-------SCROLLBAR GRADIENT FIX -------

bug-description: the gradient that makes the
    medium text vanish on scroll, is visible and
    can look bad during resize.

fix: on window resize event, add class 'noshow'
    which sets display to none.
*/
var visibilityTimer;

window.addEventListener('resize', function () {
    clearTimeout(visibilityTimer);

    var gradient = document.getElementById('gradient');
    gradient.style.visibility = 'hidden';

    visibilityTimer = setTimeout(() => {
        gradient.style.visibility = 'visible';
    }, 1000);
}, true)
