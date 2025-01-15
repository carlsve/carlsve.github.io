document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('#burger_icon')
    const sidebar = document.querySelector('#sidebar')
    const main = document.querySelector('#main')

    burger.addEventListener('click', () => {
        burger.classList.toggle('menu_active')
        sidebar.classList.toggle('menu_active')
        main.classList.toggle('menu_active')
    })
})