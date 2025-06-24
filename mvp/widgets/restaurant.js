document.addEventListener('DOMContentLoaded', () => {
    const expModifier = 20
    const upgrades = {
        autobuy_ingredients: {
            name: 'Autobuy ingredients',
            price: 150,
            level: 0,
            effect: function(state) {
                if (state.kitchen.money >= this.price) {
                    state.kitchen.money -= this.price
                    state.ingredients.autobuy = true
                }
                return 'once'
            }
        },
        increase_customers_per_hour: {
            name: 'Increase customers per hour',
            price: 30,
            level: 0,
            effect: function(state) {
                if (state.kitchen.money >= this.price) {
                    state.kitchen.money -= this.price
                    state.customers.timer *= 0.8
                    this.level += 1
                    this.price *= Math.exp(this.level / expModifier)
                }
                return 'many'
            }
        },
        increase_price: {
            name: 'Increase Price',
            price: 40,
            level: 0,
            effect: function(state) {
                if (state.kitchen.money >= this.price) {
                    state.kitchen.money -= this.price
                    state.kitchen.price *= 1.2
                    this.level += 1
                    this.price *= Math.exp(this.level / expModifier)
                }
                return 'many'
            },
        },
        increase_cook_speed: {
            name: 'Increase Cook Speed',
            price: 30,
            level: 0,
            effect: function(state) {
                if (state.kitchen.money >= this.price) {
                    state.kitchen.money -= this.price
                    state.cooks.timer *= 0.8
                    this.level += 1
                    this.price *= Math.exp(this.level / expModifier)
                }
                return 'many'
            },
        },
        increase_serve_speed: {
            name: 'Increase Serve Speed',
            price: 70,
            level: 0,
            effect: function(state) {
                if (state.kitchen.money >= this.price) {
                    state.kitchen.money -= this.price
                    state.servers.timer *= 0.8
                    this.level += 1
                    this.price *= Math.exp(this.level / expModifier)
                }
                return 'many'
            }
        }
    }

    const state = {
        kitchen: {
            money: 1000,
            price: 8,
            food: 0,
            max: 10,
        },
        ingredients: {
            amount: 0,
            cost: 10,
            autobuy: false
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
            progress: 0,
            max: 4,
            price: 100,
            hired: [],
        },
        servers: {
            amount: 0,
            active: false,
            timer: 5,
            progress: 0,
            hired: [],
            max: 4,
            price: 100
        },
        intervalTimer: 200,
    }

    const ui = {
        money: document.querySelector('#widget__restaurant__money'),
        food: document.querySelector('#widget__restaurant__food'),
        foodPrice: document.querySelector('#widget__restaurant__foodprice'),
        customers: document.querySelector('#widget__restaurant__customers'),
        ingredients: document.querySelector('#widget__restaurant__ingredients'),
        buyIngredient: document.querySelector('#widget__restaurant__buyingredient'),
        ingredientCost: document.querySelector('#widget__restaurant__ingredientcost'),
        cooks: document.querySelector('#widget__restaurant__cooks'),
        hireCook: document.querySelector('#widget__restaurant__hirecook'),
        cookCost: document.querySelector('#widget__restaurant__cookcost'),
        startCookButton: document.querySelector('#widget__restaurant__startcook'),
        cookProgress: document.querySelector('#widget__restaurant__cookprogress'),
        serve: document.querySelector('#widget__restaurant__serve'),
        serverCost: document.querySelector('#widget__restaurant__servercost'),
        serveProgress: document.querySelector('#widget__restaurant__serveprogress'),
        hireServer: document.querySelector('#widget__restaurant__hireserver'),
        cookList: document.querySelector('#widget__restaurant__cooklist'),
        serverList: document.querySelector('#widget__restaurant__serverlist'),
        upgrades: document.querySelector('#widget__restaurant__upgrades')
    }

    Object.values(upgrades).forEach((upgrade) => {
        const button = document.createElement('button')
        button.textContent = upgrade.name + ': ' + upgrade.price.toFixed(2) + '$'
        button.addEventListener('click', () => {
            should_repeat = upgrade.effect(state)

            if (should_repeat == 'once') {
                button.remove()
            } else {
                button.textContent = upgrade.level + '. ' + upgrade.name + ': ' + upgrade.price.toFixed(2) + '$'
            }
        })

        ui.upgrades.appendChild(button)
    })

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

    ui.hireCook.addEventListener('click', () => {
        if (state.cooks.amount < state.cooks.max && state.kitchen.money >= state.cooks.price) {
            const cook = {
                active: false,
                progress: 0,
                ui: document.createElement('li'),
            }
            const progress = document.createElement('progress')
            const label = document.createElement('label')
            label.textContent = 'cook_' + state.cooks.hired.length
            cook.ui.appendChild(label)
            progress.value = 0
            progress.max = 100
            cook.ui.appendChild(progress)
            state.cooks.hired.push(cook)

            ui.cookList.appendChild(cook.ui)

            state.kitchen.money -= state.cooks.price
            state.cooks.price = Math.exp(state.cooks.hired.length) * state.cooks.price
        }
    })

    ui.hireServer.addEventListener('click', () => {
        if (state.servers.amount < state.servers.max && state.kitchen.money >= state.servers.price) {
            const server = {
                active: false,
                progress: 0,
                ui: document.createElement('li'),
            }
            const progress = document.createElement('progress')
            const label = document.createElement('label')
            label.textContent = 'server_' + state.servers.hired.length
            server.ui.appendChild(label)
            progress.value = 0
            progress.max = 100
            server.ui.appendChild(progress)
            state.servers.hired.push(server)

            ui.serverList.appendChild(server.ui)

            state.kitchen.money -= state.servers.price
            state.servers.price = Math.exp(state.servers.hired.length) * state.servers.price
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
            state.servers.progress += secondsPerFrame * (100 / state.servers.timer)

            if (state.servers.progress >= 100) {
                state.servers.active = false
                state.kitchen.money += state.kitchen.price
                state.servers.progress = 0
            }
        }

        state.cooks.hired.forEach((cook) => {
            if (!cook.active) {
                if (state.kitchen.food < state.kitchen.max && state.ingredients.amount > 0) {
                    cook.active = true
                    state.ingredients.amount -= 1
                    cook.progress = 0
                }
            } else {
                cook.progress += secondsPerFrame * (100 / state.cooks.timer)
                if (cook.progress >= 100) {
                    cook.progress = 0
                    cook.active = false
                    state.kitchen.food += 1
                }
                cook.ui.querySelector('progress').value = cook.progress
            }
        })

        state.servers.hired.forEach((server) => {
            if (!server.active) {
                if (state.kitchen.food > 0 && state.customers.amount > 0) {
                    server.active = true
                    state.kitchen.food -= 1
                    server.progress = 0
                    state.customers.amount -= 1
                }
            } else {
                server.progress += secondsPerFrame * (100 / state.servers.timer)
                if (server.progress >= 100) {
                    server.progress = 0
                    server.active = false
                    state.kitchen.money += state.kitchen.price
                }
                server.ui.querySelector('progress').value = server.progress
            }
        })

        if (state.ingredients.autobuy && state.ingredients.amount === 0 && state.kitchen.money >= state.ingredients.cost) {
            state.ingredients.amount += 3
            state.kitchen.money -= state.ingredients.cost   
        }

        ui.food.textContent = `${state.kitchen.food} / ${state.kitchen.max}`
        ui.cooks.textContent = `${state.cooks.amount}`
        ui.ingredients.textContent = `${state.ingredients.amount}`
        ui.customers.textContent = `${state.customers.amount} / ${state.customers.max}`
        ui.money.textContent = `${state.kitchen.money.toFixed(2)}`
        ui.cookCost.textContent = `${state.cooks.price.toFixed(2)}`
        ui.serverCost.textContent = `${state.servers.price.toFixed(2)}`
        ui.foodPrice.textContent = `${state.kitchen.price.toFixed(2)}`
        ui.cookProgress.value = `${state.cooks.progress}`
        ui.serveProgress.value = `${state.servers.progress}`
    }, state.intervalTimer)
})