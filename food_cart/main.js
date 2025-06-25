(() => {
    let intervalMs = 100
    let intervalQueue = []
    window.intervalQueue = {
        addHandle: (handle) => {
            intervalQueue.push(handle)
        },
        removeHandle: (handle) => {
            intervalQueue = intervalQueue.filter(h => h !== handle)
        },
        intervalMs
    }
    
    const notifications = document.querySelector('notifications-view')
    notifications.classList.add('fade-in')
    const property = document.querySelector('property-view')
    property.classList.add('fade-in')

    const events = [
        {
            handle: () => {
                notifications.classList.add('show')
            },
            time: 1000
        },
        {
            handle: () => {
                window.messageQueue.addMessage("You want money...")
            },
            time: 4000
        },
        {
            handle: () => {
                property.classList.add('show')
            },
            time: 5500
        },
        {
            handle: () => {
                window.messageQueue.addMessage("You want to cook...")
            },
            time: 7000
        },
        {
            handle: () => {
                property.classList.add('show-purchase')
            },
            time: 8500
        },
        {
            handle: () => {
                window.messageQueue.addMessage("It's time to start business!!")
                let tick = 0
                setInterval(() => {
                    intervalQueue.forEach((handle) => {
                        tick += 1
                        handle(tick)
                    })
                }, intervalMs)
            },
            time: 10000
        },
    ]

    if (false) {
        window.setTimeout(() => {
            events.forEach(e => {
                e.handle()
            })
        },50)

    } else {
        events.forEach(e => {
            window.setTimeout(e.handle, e.time)
        })
    }

})()