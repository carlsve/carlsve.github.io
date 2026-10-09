export const effects = {
    heal: (game) => { game.player.stats.currentLife = Math.min(game.player.stats.currentLife + 20, game.player.stats.secondary.life()) }
}