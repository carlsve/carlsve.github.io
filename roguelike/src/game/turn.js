import { fov } from './algorithms/fov.js'
import { moveItem } from './inventory.js'
import { render } from './render.js'

const moveItemCostsTime = (from, to) => from.kind === 'ground' || to.kind === 'ground'

export const initTurn = (game, onDeath, canvas) => ({ action, ...payload }) =>  {
    console.log(`Turn: ${JSON.stringify({ action, payload })}`)
    let spent = false
    switch(action) {
        case 'noop':
            break
        case 'wait':
            spent = true
            break
        case 'moveItem':
            const success = moveItem(game, payload.from, payload.to)
            spent = success && moveItemCostsTime(payload.from, payload.to)
            break
        case 'step':
        case 'attackRange':
        case 'consume':
        case 'useItemQuickBar':
            spent = game.player.perform({ action, ...payload })
            break
        default:
            throw new Error(`No action of type ${JSON.stringify({ action, payload })}`)
    }
    console.log(`Turn was spent: ${spent}`)
    if (game.player.stats.currentLife <= 0) {
        onDeath()
        return
    }

    if (spent) {
        game.enemies = game.enemies.filter(enemy => enemy.stats.currentLife > 0);
        for (const enemy of game.enemies) {
            enemy.act();

            if (game.player.stats.currentLife <= 0) {
                onDeath()
                return
            }        
        }

        game.tick += 1
        game.visible = fov(game.world.board, game.player.pos, game.player.stats.secondary.visualSightRadius() + 5)
        for (const visibleTile of game.visible) {
            game.world.setExplored(...visibleTile)
        }

        const lifeRegenRate = Math.max(1, 7 - game.player.stats.secondary.lifeRegen())
        if (game.tick % lifeRegenRate == 0) {
            game.player.stats.currentLife = Math.min(game.player.stats.currentLife + 1, game.player.stats.secondary.life())
        }
        const manaRegenRate = Math.max(1, 7 - game.player.stats.secondary.manaRegen())
        if (game.tick % manaRegenRate == 0) {
            game.player.stats.currentMana = Math.min(game.player.stats.currentMana + 1, game.player.stats.secondary.mana())
        }
    }
    render(game)
}