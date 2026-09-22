import { sub2d, apply2d } from "../../utils/vec2d.js"

const MAX_DEPTH = 100

function resolveMeleeDamage(entity) {
    return 5 + entity.stats.secondary.meleePower()
}

function resolveRangeDamage(entity) {
    return 3 + entity.stats.secondary.magicPower()
}

export function melee(rng, attacker, defender, depth = 0) {

    function roll(chance) {
        return (rng.random.next() * 100) <= chance
    }

    if (attacker.stats.currentLife <= 0 || defender.stats.currentLife <= 0) {
        return
    }
    if (depth > MAX_DEPTH) {
        console.log("max counters reached, this shouldn't happen lol")
        return
    }

    // crit chance roll on attacker
    if (roll(attacker.stats.secondary.criticalChance())) {
        console.log(`${attacker.name} crits ${defender.name} for ${resolveMeleeDamage(attacker) * 2} life!`)
        defender.stats.currentLife -= resolveMeleeDamage(attacker) * 2
        return
    }

    // dodge chance roll on defender
    if (roll(defender.stats.secondary.dodgeChance() - attacker.stats.secondary.enemyDodgeReduction())) {
        console.log(`${defender.name} successfully dodges attack from ${attacker.name}`)
        return
    }
    
    // counter chance roll on defender
    if (roll(defender.stats.secondary.counterChance())) {
        console.log(`${defender.name} counters attack from ${attacker.name}!`)
        return melee(rng, defender, attacker, depth + 1)
    }
    
    // block chance roll on defender
    if (roll(defender.stats.secondary.blockChance())) {
        console.log(`${defender.name} successfully blocks attack from ${attacker.name}, for ${Math.floor(resolveMeleeDamage(attacker) / 4)} life!`)
        // successful block flatly block 75% normal damage
        defender.stats.currentLife -= Math.floor(resolveMeleeDamage(attacker) / 4)
        return
    }

    console.log(`${attacker.name} hits ${defender.name} for ${resolveMeleeDamage(attacker)} life!`)
    defender.stats.currentLife -= resolveMeleeDamage(attacker)
}

export function range(rng, attacker, defender, depth = 0) {
    function roll(chance) {
        return (rng.random.next() * 100) <= chance
    }

    if (attacker.stats.currentLife <= 0 || defender.stats.currentLife <= 0) {
        return
    }
    if (depth > MAX_DEPTH) {
        console.log("max counters reached, this shouldn't happen lol")
        return
    }


    // crit chance roll on attacker
    if (roll(attacker.stats.secondary.criticalChance())) {
        console.log(`${attacker.name} crits ${defender.name} for ${resolveRangeDamage(attacker) * 2} life!`)
        defender.stats.currentLife -= resolveRangeDamage(attacker) * 2
        return
    }

    // dodge chance roll on defender
    if (roll(defender.stats.secondary.dodgeChance() - attacker.stats.secondary.enemyDodgeReduction())) {
        console.log(`${defender.name} successfully dodges attack from ${attacker.name}`)
        return
    }

    // counter chance roll on defender can occur if you are adjacent to the enemy when shooting
    const areAdjacent = apply2d(Math.abs, sub2d(attacker.pos, defender.pos)).reduce((x,y) => x + y, 0) === 1
    console.log(`Attacker and defender adjacent = ${areAdjacent}`)
    if (areAdjacent && roll(defender.stats.secondary.counterChance())) {
        console.log(`${defender.name} counters attack from ${attacker.name}!`)
        return melee(rng, defender, attacker, depth + 1)
    }
    
    // block chance roll on defender
    if (roll(defender.stats.secondary.blockChance())) {
        console.log(`${defender.name} successfully blocks attack from ${attacker.name}, for ${Math.floor(resolveRangeDamage(attacker) / 4)} life!`)
        // successful block flatly block 75% normal damage
        defender.stats.currentLife -= Math.floor(resolveRangeDamage(attacker) / 4)
        return
    }

    console.log(`${attacker.name} hits ${defender.name} for ${resolveRangeDamage(attacker)} life!`)
    defender.stats.currentLife -= resolveRangeDamage(attacker)    
}