document.addEventListener('DOMContentLoaded', () => {
    const state = {
        kitchen: {
            money: 100,
            price: 5,
            food: 0
        },
        ingredients: {
            amount: 0,
            cost: 10,
        },
        customers: {
            amount: 0,
            timer: 20,
            progress: 0,
            max: 3
        },
        cooks: {
            active: false,
            timer: 10,
            amount: 0,
            progress: 0
        },
        servers: {
            active: false,
            timer: 5,
            progress: 0
        },
        intervalTimer: 200,
    }

    const ui = {
        money: document.querySelector('#widget__restaurant__money'),
        food: document.querySelector('#widget__restaurant__food'),
        customers: document.querySelector('#widget__restaurant__customers'),
        ingredients: document.querySelector('#widget__restaurant__ingredients'),
        buyIngredient: document.querySelector('#widget__restaurant__buyingredient'),
        ingredientCost: document.querySelector('#widget__restaurant__ingredientcost'),
        cooks: document.querySelector('#widget__restaurant__cooks'),
        hirecooks: document.querySelector('#widget__restaurant__hirecooks'),
        cookCost: document.querySelector('#widget__restaurant__cookcost'),
        startCookButton: document.querySelector('#widget__restaurant__startcook'),
        cookProgress: document.querySelector('#widget__restaurant__cookprogress'),
        serve: document.querySelector('#widget__restaurant__serve'),
        serverCost: document.querySelector('#widget__restaurant__servercost'),
        serveProgress: document.querySelector('#widget__restaurant__serveprogress'),
    }


    ui.startCookButton.addEventListener('click', () => {
        if (!state.cooks.active && state.ingredients.amount > 0 && !state.servers.active) {
            state.cooks.progress = 0
            state.cooks.active = true
            state.ingredients.amount -= 1
        }

    })

    ui.buyIngredient.addEventListener('click', () => {
        if (state.kitchen.money >= state.ingredients.cost) {
            state.ingredients.amount += 3
            state.kitchen.money -= state.ingredients.cost
        }
    })

    ui.serve.addEventListener('click', () => {
        if (state.kitchen.food > 0 && state.customers.amount > 0 && !state.servers.active && !state.cooks.active) {
            state.servers.active = true
            state.servers.progress = 0
            state.kitchen.food -= 1
            state.customers.amount -= 1
        }
    })

    window.setInterval(() => {
        const secondsPerFrame = state.intervalTimer / 1000

        if (state.customers.amount < state.customers.max) {
            state.customers.progress += secondsPerFrame * (100 / state.customers.timer)
            if (state.customers.progress >= 100) {
                state.customers.amount += 1
                state.customers.progress = 0
            }
        }

        if (state.cooks.active) {
            state.cooks.progress += secondsPerFrame * (100 / state.cooks.timer)

            if (state.cooks.progress >= 100) {
                state.cooks.active = false
                state.cooks.progress = 0
                state.kitchen.food += 1
            }
        }

        if (state.servers.active) {
            // y = 4, 5 fps, 5s
            state.servers.progress += secondsPerFrame * (100 / state.servers.timer)

            if (state.servers.progress >= 100) {
                state.servers.active = false
                state.kitchen.money += state.kitchen.price
                state.servers.progress = 0
            }
        }

        ui.food.textContent = `${state.kitchen.food}`
        ui.cooks.textContent = `${state.cooks.amount}`
        ui.ingredients.textContent = `${state.ingredients.amount}`
        ui.customers.textContent = `${state.customers.amount}`
        ui.money.textContent = `${state.kitchen.money}`
        ui.cookProgress.value = `${state.cooks.progress}`
        ui.serveProgress.value = `${state.servers.progress}`
    }, state.intervalTimer)
})