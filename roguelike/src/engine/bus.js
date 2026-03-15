export const bus = {
    listeners: {},
    on(event, fn) {
        (this.listeners[event] ??= []).push(fn)
    },
    emit(event, payload) {
        (this.listeners[event] ?? []).forEach(fn => fn(payload))
    }
}