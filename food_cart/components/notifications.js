// Simple limited message implementation to not keep infinite messages in the browser

class Notifications extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                fieldset {
                    width: 240px;
                    height: 600px;
                    overflow-y: scroll;
                }

                .fade-in {
                    opacity: 0;
                    transition: opacity 500ms ease-in;
                }

                .fade-in.show {
                    opacity: 1;
                }
            </style>
            <fieldset>
                <legend>Messages</legend>
                <div id="message-box"></div>
            </fieldset>
        `

        window.messageQueue = {
            addMessage: (message) => {
                this.render(message)
            }
        }
    }

    connectedCallback() {
        this.ui = {
            messageBox: this.shadowRoot.querySelector("#message-box")
        }
    }

    disconnectedCallback() {}

    render(message) {
        const p = document.createElement('p')
        p.textContent = `${message}`
        p.classList.add('fade-in')
        p.addEventListener("load", () => {
            p.style.opacity = 1
        })

        this.ui.messageBox.prepend(p)

        if (this.ui.messageBox.children.length > 30) {
            this.ui.messageBox.lastChild.remove()
        }

        window.setTimeout(() => {
            p.classList.add('show')
        },100)
    }
}

customElements.define('notifications-view', Notifications)
