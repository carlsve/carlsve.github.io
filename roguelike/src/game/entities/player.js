import { add2d, clamp2d, eq2d } from '../../utils/vec2d.js'
import { hasLOS } from '../algorithms/hasLOS.js'
import { melee, range } from './combat.js'
import { initSkills, initStats } from './stats.js'

export const getPlayer = (game, startPos) => {
    const stats = initStats()
    const skills = initSkills({ warrior: 7 }, stats)
    const player = {
        pos: startPos,
        name: 'player',
        stats,
        skills,
        level: 1,
        xp: 0
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
        enemy.alert()
        if (type === 'melee') {
            melee(game.rng, player, enemy)
        } else {
            if (player.stats.currentMana >= 5) {
                range(game.rng, player, enemy)
                player.stats.currentMana -= 5
            } else {
                console.log("Not enough mana!")
            }
        }

        if (enemy.stats.currentLife <= 0) {
            player.getXP(50)
        }
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
                        attack(enemy, 'range')
                        return true
                    }
                }
                return false
            }
            case 'drop': {
                if (game.world.at(...payload.dropAt) === 0 && !game.enemies.some(enemy => eq2d(enemy.pos, payload.dropAt))) {
                    game.heldItem.item.pos = payload.dropAt
                    game.items.push(game.heldItem.item)
                    game.heldItem = null
                    return true
                }
                return false
            }
            case 'pickup': {
                game.heldItem = {item: payload.item, from: null}
                game.items = game.items.filter((groundItem) => groundItem !== payload.item)
                return true
            }
            default:
                throw new Error(`action "${action}" not implemented`)
        }
    }

    return player
}
