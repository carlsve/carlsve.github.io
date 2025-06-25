class Property extends HTMLElement {
    constructor () {
        super()

        this.state = {
            money: 5000
        }
        window.property = this.state

        this.upgrades = [
            {
                name: 'Buy Food Cart',
                level: 0,
                price: 90,
                effect: () => {
                    const foodCart = document.createElement('food-cart-view')
                    foodCart.classList.add('fade-in')
                    document.querySelector('property-view').insertAdjacentElement('afterend', foodCart)
                    window.setTimeout(() => {
                        foodCart.classList.add('show')
                    }, 500)
                    window.messageQueue.addMessage('Every journey starts with a first step.')
                    window.setTimeout(
                        () => {
                            window.messageQueue.addMessage('You need ingredients')
                        },
                        3000
                    )
                    return 'once'
                }
            },
            {
                name: 'Buy Diner',
                level: 0,
                price: 4000,
                effect: () => {
                    window.messageQueue.addMessage('Incredible work.')
                    const foodCart = document.querySelector('food-cart-view')
                    foodCart.classList.remove('show')
                    window.setTimeout(() => {
                        foodCart.remove()
                        document.querySelector('property-view').insertAdjacentHTML('afterend', ':D')
                    },500)
                    return 'once'
                }
            },
            {
                name: 'Buy Restaurant',
                level: 0,
                price: 500000,
                effect: () => {
                    window.messageQueue.addMessage('It\'s time to go pro.')
                    return 'once'
                }
            }
        ]

        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                :host {
                    display: block;
                    opacity: 0;
                    transition: opacity 500ms ease-in; 
                }

                fieldset {
                    width: 200px;
                }

                .purchase {
                    height: 0;
                    width: 0;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 500ms ease-in;
                }

                :host(.show-purchase) .purchase {
                    opacity: 1;
                    height: auto;
                    width: auto;
                }

                .purchase button {
                    display: block;
                    margin-top: 5px;
                    margin-bottom: 5px; 
                }
            </style>
            <fieldset>
                <legend>Property</legend>
                <label>Money: <span id="money">${this.state.money}</span>$</label>
            </fieldset>
            <fieldset class="purchase" id="purchase">
                <legend>Purchase</legend>
            </fieldset>
        `
    }
    
    connectedCallback() {
        this.ui = {
            money: this.shadowRoot.querySelector('#money'),
            purchase: this.shadowRoot.querySelector('#purchase'),
        }
        this.handle = () => {
            this.update()
            this.render()
        }
        window.setTimeout(() => {
            window.intervalQueue.addHandle(this.handle)
        }, 0)

        this.upgrades.forEach(upgrade => {
            const button = document.createElement('button')
            button.textContent = `${upgrade.name}: ${upgrade.price}$`
            button.addEventListener('click', () => {
                if (this.state.money >= upgrade.price) {
                    this.state.money -= upgrade.price
                    const shouldRepeat = upgrade.effect()

                    if (shouldRepeat === 'once') {
                        button.remove()
                    }
                } else {
                    window.messageQueue.addMessage('Cannot afford such a purchase.')
                }
            })

            this.ui.purchase.appendChild(button)
        })

    }

    disconnectedCallback() {
        window.intervalQueue.removeHandle(this.handle)
    }

    update() {

    }

    render() {
        this.ui.money.textContent = `${this.state.money.toFixed(2)}`
    }
}

customElements.define('property-view', Property)