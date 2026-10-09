import { add2d, clamp2d, eq2d, hypot2d, sub2d } from '../../utils/vec2d.js'
import { hasLOS } from '../algorithms/hasLOS.js'
import { nextPosTowardGoal } from '../algorithms/nextPosTowardsGoal.js'
import { melee } from './combat.js'
import { damageTypes } from './damageTypes.js'
import { initSkills, initStats } from './stats.js'

export const getEnemy = (game, startPos) => {
    const stats = initStats({}, {}, { [damageTypes.crushing]: 2 }, { [damageTypes.slashing]: 2 })
    const skills = initSkills({ warrior: 3, rogue: 1 }, stats)
    const enemy = {
        pos: startPos,
        seesPlayer: false,
        lastSeenAt: null,
        lastSeenTick: null,
        name: 'enemy',
        stats,
        skills,
    }

    const attack = (player) => {
        console.log("enemy attacked player")
        melee(game.rng, enemy, player)
    }

    const alert = () => {
        enemy.seesPlayer = true
        enemy.lastSeenAt = [...game.player.pos]
        enemy.lastSeenTick = game.tick
    }

    const perform = ({ action, ...payload }) => {
        switch (action) {
            case 'random_walk': {
                const possibleMoves = [
                    [0, -1],
                    [0, 1],
                    [-1, 0],
                    [1, 0],
                ]
                const dpos = possibleMoves[Math.floor(game.rng.random.next() * possibleMoves.length)]
                const nextPos = clamp2d(add2d(enemy.pos, dpos), [0,0], add2d([-1, -1], game.world.dims))
                const outOfBounds = eq2d(nextPos, enemy.pos)
                if (!outOfBounds && game.world.at(...nextPos) === 0) {
                    enemy.pos = nextPos
                }
                break;
            }
            case 'move_to_goal': {
                const dpos = nextPosTowardGoal(game.rng, game.world.board, enemy.pos, payload.pos);
                if (eq2d(dpos, game.player.pos)) {
                    attack(game.player)
                } else if(game.enemies.some(({pos}) => eq2d(dpos, pos))) {
                    // collision with other evil guy
                } else if (game.world.at(...dpos) === 0) {
                    enemy.pos = dpos
                }
                break;
            }
            default:
                throw new Error(`action "${action}" not implemented`)
        }
    }

    enemy.act = () => {
        if (Math.round(hypot2d(sub2d(enemy.pos, game.player.pos))) < (5 + enemy.stats.secondary.visualSightRadius()) && hasLOS(game.world.board, enemy.pos, game.player.pos)) {
            alert()
            perform({action: 'move_to_goal', pos: game.player.pos})
        } else if (enemy.lastSeenTick !== null && game.tick - enemy.lastSeenTick < 10) {
            perform({action: 'move_to_goal', pos: enemy.lastSeenAt})
        } else {
            enemy.seesPlayer = false
            perform({action: 'random_walk'})
        }
    }
    enemy.alert = alert

    return enemy
}
