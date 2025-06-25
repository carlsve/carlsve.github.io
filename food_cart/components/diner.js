class Diner extends HTMLElement {
    constructor() {
        super()

        this.randInRange = (min, max) => Math.random() * (max - min) + min

        this.state = {
            ingredients: {
                amount: 0,
                cost: 1,
                amountPerPurchase: 1,
            },
            food: {
                amount: 0,
                price: 3,
                max: 3
            },
            customers: {
                amount: 0,
                speed: 20,
                max: 3,
                progress: 0
            },
            cooking: {
                active: false,
                progress: 0,
                speed: 10, // Seconds
                repeat: false
            },
            serving: {
                active: false,
                progress: 0,
                speed: 5, // Seconds
                repeat: false
            },
            tipping: {
                min: 0.0,
                max: 0.3,
                enabled: false
            },
        }

        this.upgrades = [
            {
                name: 'Premiumification',
                price: 10,
                level: 0,
                maxLevel: 20,
                effect: () => {
                    window.messageQueue.addMessage('Your sausage crafting skills have improved, food price increased.')
                    this.state.food.price *= 1.2
                    return 'many'
                }
            },
            {
                name: 'Word of Mouth',
                price: 15,
                level: 0,
                maxLevel: 10,
                effect: () => {
                    window.messageQueue.addMessage('People are curious about your sausages, customer drop-in speed increased.')
                    this.state.customers.speed *= 0.8
                    return 'many'
                }
            },
            {
                name: 'Faster Hands',
                price: 15,
                level: 0,
                maxLevel: 10,
                effect: () => {
                    window.messageQueue.addMessage('Decades of food craft has paid off, cooking speed increased.')
                    this.state.cooking.speed *= 0.8
                    return 'many'
                }
            },
            {
                name: 'Better Deals',
                price: 20,
                level: 0,
                maxLevel: 5,
                effect: () => {
                    window.messageQueue.addMessage('You expand your network, ingredients per purchase increased.')
                    this.state.ingredients.amountPerPurchase *= 2
                    return 'many'
                }
            },
            {
                name: 'Speed Serve',
                price: 40,
                level: 0,
                maxLevel: 8,
                effect: () => {
                    window.messageQueue.addMessage('You put the spring in your step, serving speed increased,')
                    this.state.serving.speed *= 0.8
                }
            },
            {
                name: 'Practice Charisma',
                price: 50,
                level: 0,
                maxLevel: 10,
                effect: () => {
                    window.messageQueue.addMessage('Big personalities attract big tippers, tipping amount increased.')
                    this.state.tipping.min *= 1.2
                    this.state.tipping.max *= 1.3
                }
            },
            {
                name: 'Mini Oven',
                price: 80,
                level: 0,
                effect: () => {
                    window.messageQueue.addMessage('You will store more sausages here.')
                    this.state.food.max += 7
                    return 'once'
                }
            },
            {
                name: 'Benches',
                price: 100,
                level: 0,
                effect: () => {
                    window.messageQueue.addMessage('Customers are amassing around your cart.')
                    this.state.customers.max += 7
                    return 'once'
                }
            },
            {
                name: 'Arts of Tipping',
                price: 10,
                level: 0,
                effect: () => {
                    window.messageQueue.addMessage('Money comes and goes.')
                    this.state.tipping.enabled = true
                    return 'once'
                }
            }
        ]

        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                :host {
                    width: 100%;
                }


                section {
                    padding: 5px 0;
                }

                button {
                    display: inline-block;
                    margin: 8px;
                }

            </style>
            <fieldset class="food-cart" id="food-cart">
                <legend>Food Cart</legend>
                <section>
                    <div>
                        <label>Ingredients: <span id="ingredients-amount">${this.state.ingredients.amount}</span></label>
                    </div>
                    <div>
                        <button id="ingredients-buy">Buy Ingredients</button>
                        <label>Cost: <span id="ingredients-cost">${this.state.ingredients.cost}</span>$</label>
                    </div>
                </section>
                <section>
                    <div>
                        <label>Food: <span id="food-amount">${this.state.food.amount} / ${this.state.food.max}</span></label>
                    </div>
                    <div>
                        <label>Customers: <span id="customer-amount">${this.state.customers.amount} / ${this.state.customers.max}</span></label>
                    </div>
                    <div>
                        <label>Sell Price: <span id="food-price">${this.state.food.price}</span>
                    </div>
                </section>
                    <div>
                        <button id="cooking-cook">Cook</button>
                        <progress id="cooking-progress" value="0" max="100"></progress>
                    </div>
                    <div>
                        <button id="serving-serve">Serve</button>
                        <progress id="serving-progress" value="0" max="100"></progress>
                    </div>
                </section>
            </fieldset>
            <fieldset>
                <legend>Upgrades</legend>

                <div id="upgrades"></div>
            </fieldset>
        `
    }

    connectedCallback() {
        this.ui = {
            foodCart: this.shadowRoot.querySelector('#food-cart'),
            ingredients: {
                amount: this.shadowRoot.querySelector('#ingredients-amount'),
                buy: this.shadowRoot.querySelector('#ingredients-buy'),
                cost: this.shadowRoot.querySelector('#ingredients-cost')
            },
            food: {
                amount: this.shadowRoot.querySelector('#food-amount'),
                price: this.shadowRoot.querySelector('#food-price')
            },
            customers: {
                amount: this.shadowRoot.querySelector('#customer-amount')
            },
            cooking: {
                cook: this.shadowRoot.querySelector('#cooking-cook'),
                progress: this.shadowRoot.querySelector('#cooking-progress')
            },
            serving: {
                serve: this.shadowRoot.querySelector('#serving-serve'),
                progress: this.shadowRoot.querySelector('#serving-progress')
            },
            upgrades: this.shadowRoot.querySelector('#upgrades')
        }
        this.upgrades.forEach(upgrade => {
            const button = document.createElement('button')
            button.textContent = `${upgrade.name}: ${upgrade.price.toFixed(2)}$`
            button.addEventListener('click', () => {
                if (window.property.money >= upgrade.price) {
                    window.property.money -= upgrade.price
                    const shouldRepeat = upgrade.effect()

                    if (shouldRepeat === 'once') {
                        button.remove()
                    } else {
                        upgrade.level += 1
                        upgrade.price *= 1.2
                        button.textContent = `${upgrade.level}. ${upgrade.name}: ${upgrade.price.toFixed(2)}$`
                        if (upgrade.level === upgrade.maxLevel) {
                            button.remove()
                        }
                    }
                } else {
                    window.messageQueue.addMessage('You cannot afford this upgrade.')
                }
            })

            this.ui.upgrades.appendChild(button)
        })

        let firstIngredientPurchase = true
        this.ui.ingredients.buy.addEventListener('click', () => {
            if (window.property.money >= this.state.ingredients.cost) {
                if (firstIngredientPurchase) {
                    firstIngredientPurchase = false
                    window.messageQueue.addMessage('Ingredients; necessary for cooking food.')
                }
                window.property.money -= this.state.ingredients.cost
                this.state.ingredients.amount += this.state.ingredients.amountPerPurchase
            } else {
                window.messageQueue.addMessage('You need more money.')
            }
        })

        this.ui.cooking.cook.addEventListener('click', () => {
            this.state.cooking.active = true
            this.state.serving.active = false
            this.ui.cooking.cook.disabled = true
            this.ui.serving.serve.disabled = false
        })

        this.ui.serving.serve.addEventListener('click', () => {
            this.state.cooking.active = false
            this.state.serving.active = true
            this.ui.cooking.cook.disabled = false
            this.ui.serving.serve.disabled = true
        })
        
        this.handle = () => {
            this.update()
            this.render()
        }
        window.setTimeout(() => {
            window.intervalQueue.addHandle(this.handle)
        },0)
    }

    disconnectedCallback() {false
        window.intervalQueue.removeHandle(this.handle)
    }

    update() {
        const secondsPerFrame = window.intervalQueue.intervalMs / 1000

        if (this.state.cooking.active) {
            if (this.state.cooking.progress === 0) {
                if (this.state.ingredients.amount > 0 && this.state.food.amount < this.state.food.max) {
                    this.state.cooking.progress += secondsPerFrame * (100 / this.state.cooking.speed)
                    this.state.ingredients.amount -= 1
                }
            } else {
                this.state.cooking.progress += secondsPerFrame * (100 / this.state.cooking.speed)
            }

            if (this.state.cooking.progress >= 100) {
                this.state.food.amount += 1
                this.state.cooking.progress = 0
                window.messageQueue.addMessage('+1 food')
            }
        }

        if (this.state.serving.active) {
            if (this.state.serving.progress === 0) { 
                if (this.state.food.amount > 0 && this.state.customers.amount > 0) {
                    this.state.serving.progress += secondsPerFrame * (100 / this.state.serving.speed)
                    this.state.food.amount -= 1
                    this.state.customers.amount -= 1
                }
            } else {
                this.state.serving.progress += secondsPerFrame * (100 / this.state.serving.speed)
            }

            if (this.state.serving.progress >= 100) {
                window.property.money += this.state.food.price
                this.state.serving.progress = 0
                const tip = this.state.food.price * this.randInRange(this.state.tipping.min, this.state.tipping.max)
                window.messageQueue.addMessage(`Sold 1 food for ${this.state.food.price.toFixed(2)}$, received ${tip.toFixed(2)}$ tip!`)
                window.property.money += tip
            }
        }

        if (this.state.customers.amount < this.state.customers.max) {
            this.state.customers.progress += secondsPerFrame * (100 / this.state.customers.speed)

            if (this.state.customers.progress >= 100) {
                this.state.customers.progress = 0
                this.state.customers.amount += 1
                window.messageQueue.addMessage('A customer approaches...')
            }
        }
    }

    render() {
        this.ui.ingredients.amount.textContent = `${this.state.ingredients.amount}`
        this.ui.food.amount.textContent = `${this.state.food.amount} / ${this.state.food.max}`
        this.ui.customers.amount.textContent = `${this.state.customers.amount} / ${this.state.customers.max}`
        this.ui.food.price.textContent = `${this.state.food.price.toFixed(2)}$`
        this.ui.cooking.progress.value = this.state.cooking.progress
        this.ui.serving.progress.value = this.state.serving.progress
    }
}

customElements.define('diner-view', Diner)
