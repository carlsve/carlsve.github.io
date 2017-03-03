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


/* ------ LOW-RES LOAD-IN IMAGE HANDLER ------ */
var hero = document.querySelector(".hero");

hero.classList.add("blur_on_load");

// gradually loads in
function upgradeImage() {
    if (this.id === "load-in") {
        hero.classList.add("loaded");
    } else if (this.id === "load-in-big") {
        hero.classList.add("loaded_big")
    }
    hero.classList.remove("blur_on_load");
}

var img = document.querySelector('#load-in');

if (img.complete) {
  upgradeImage.call(img);
} else {
  img.addEventListener('load', upgradeImage)
}

