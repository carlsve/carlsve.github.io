import { add2d, clamp2d, eq2d } from '../../utils/vec2d.js'
import { hasLOS } from '../algorithms/hasLOS.js'
import { effects } from '../effects.js'
import { canConsume, canSelect, getItemData } from '../items.js'
import { melee, rangeShoot, rangeThrow } from './combat.js'
import { initSkills, initStats } from './stats.js'
import { getDamages } from './damage.js'

export const getPlayer = (game, startPos) => {
    const stats = initStats()
    const skills = initSkills({ warrior: 7 }, stats)
    const player = {
        pos: startPos,
        name: 'player',
        stats,
        skills,
        level: 1,
        xp: 0,
        selectedSlot: null
    }

    player.getXP = (xp) => {
        console.log(`player granted ${xp} xp`)
        player.xp += xp
        if (player.xp >= 125*player.level) {
            player.xp -= 125*player.level
            player.level += 1
            console.log(`player leveled up to ${player.level}!`)
            player.skills.incrementWarrior()
            player.stats.currentLife = player.stats.secondary.life()
            player.stats.currentMana = player.stats.secondary.mana()
        }
    }

    const attack = (enemy, type) => {
        console.log("player attacked enemy")
        if (type === 'melee') {
            player.stats.currentDamages = getDamages(game, 'melee')
            melee(game.rng, player, enemy)
        } else {
            if (player.selectedSlot !== null) {
                const item = player.selectedSlot
                if (getItemData(item).type === 'throwable') {
                    player.stats.currentDamages = getDamages(game, 'rangeThrow')
                    rangeThrow(game.rng, player, enemy)
                } else if (getItemData(item).type === 'shootable' && game.gear.crossbow !== null) {
                    player.stats.currentDamages = getDamages(game, 'rangeShoot')
                    rangeShoot(game.rng, player, enemy)
                } else {
                    return false
                }
            } else {
                return false
            }
        }
        enemy.alert()
        if (enemy.stats.currentLife <= 0) {
            player.getXP(50)
        }

        return true
    }

    player.perform = ({ action, ...payload }) => {
        switch (action) {
            case 'step': {
                // try to step
                // possible?
                const nextPos = clamp2d(add2d(player.pos, payload.stepTo), [0,0], add2d([-1, -1], game.world.dims))
                for (const enemy of game.enemies) {
                    if (eq2d(nextPos, enemy.pos)) {
                        attack(enemy, 'melee')
                        return true
                    }
                }

                const outOfBounds = eq2d(nextPos, player.pos)
                if (!outOfBounds && game.world.at(...nextPos) === 0) {
                    player.pos = nextPos
                    return true
                }

                return false
            }
            case 'attackRange': {
                if (!hasLOS(game.world.board, player.pos, payload.pos)) {
                    return false
                }
                for (const enemy of game.enemies) {
                    if (eq2d(payload.pos, enemy.pos)) {
                        return attack(enemy, 'range')
                    }
                }
                return false
            }
            case 'consume': {
                const item = game.inventory[payload.inventoryIndex]
                game.inventory[payload.inventoryIndex] = null
                effects[getItemData(item).effect](game)
                return true
            }
            case 'useItemInventory':
            case 'useItemQuickBar': {
                const from = action === 'useItemInventory' ? 'inventory' : 'itemQuickBar'
                const item = game[from][payload.index]
                if (item !== null) {
                    if (canConsume(item)) {
                        game[from][payload.index] = null
                        effects[getItemData(item).effect](game)
                        return true
                    } else if (canSelect(item)) {
                        game.player.selectedSlot = item
                        return false
                    }
                }
                return false
            }
            default:
                throw new Error(`action "${action}" not implemented`)
        }
    }

    return player
}
