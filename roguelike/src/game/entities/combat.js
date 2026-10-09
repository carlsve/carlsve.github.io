import { sub2d, apply2d } from "../../utils/vec2d.js"
import { damageTypes, MUNDANE, EXOTIC } from "./damageTypes.js"

const MAX_DEPTH = 100

function resolveMeleeDamage(attacker, defender, modifiers = {}) {
    // calculate attacker damages vs defender resistances
    const mundane = {}
    const exotic = {}
    const logs = []
    logs.push({modifiers: modifiers})
    logs.push({initialAttackerDamages: {...attacker.stats.damages}})
    logs.push({initialDefenderResistances: {...defender.stats.resistances}})
    // calculate attackers damage
    for (const damageType of Object.keys(damageTypes)) {
        if (attacker.stats.damages[damageType] > 0) {
            if (MUNDANE.includes(damageType)) {
                mundane[damageType] = attacker.stats.damages[damageType]
            } else if (EXOTIC.includes(damageType)) {
                exotic[damageType] = attacker.stats.damages[damageType]
            } else {
                throw new Error(`Damage type: ${damageType} not supported!`)
            }
        }
    }

    logs.push({initialMundane: {...mundane}})
    logs.push({initialExotic: {...exotic}})
    
    // Find dominant mundane damage to apply meleePower to, default to crushing
    let maxMundaneType = ['crushing', 0]
    for (const [mundaneType, value] of Object.entries(mundane)) {
        if (value > maxMundaneType[1]) {
            maxMundaneType = [mundaneType, value]
        }
    }
    mundane[maxMundaneType[0]] = (mundane[maxMundaneType[0]] || 0) + attacker.stats.secondary.meleePower()
    logs.push({mundaneAfterMeleePowerApplication: {...mundane}})

    if (modifiers.critical) {
        for (const damageType of Object.keys(mundane)) {
            mundane[damageType] *= 2
        }
    }
    logs.push({mundaneAfterCriticalApplication: {...mundane}})


    
    // Subtract Armour absorption
    let armourAbsorption = defender.stats.secondary.armourAbsorption()
    logs.push({defenderArmourAbsorption: armourAbsorption})
    for (const damageType of MUNDANE) {
        // First crushing, then slashing, then blasting, overflowing
        if (Object.keys(mundane).includes(damageType)) {
            let tempDmg = mundane[damageType]
            mundane[damageType] = Math.max(mundane[damageType] - armourAbsorption, 0)
            armourAbsorption = Math.max(armourAbsorption - tempDmg, 0)
            
            if (mundane[damageType] === 0) {
                delete mundane[damageType]
            }
        }
    }
    logs.push({mundaneDamageAfterArmourAbsorption: {...mundane}})

    // calculate defender resistances (Can get higher if defender has negative resistances)
    for (const damageType of Object.keys(mundane)) {
        mundane[damageType] = Math.max(mundane[damageType] - defender.stats.resistances[damageType], 0)
        if (modifiers.block) {
            // successful block flatly block 75% mundane damage and 50% exotic damage
            mundane[damageType] = Math.ceil(mundane[damageType] * 0.25)
        }
    }
    for (const damageType of Object.keys(exotic)) {
        exotic[damageType] = Math.max(exotic[damageType] - defender.stats.resistances[damageType], 0)
        if (modifiers.block) {
            // successful block flatly block 75% mundane damage and 50% exotic damage
            exotic[damageType] = Math.ceil(exotic[damageType] * 0.5)
        }
    }
    logs.push({mundaneAfterResistances: {...mundane}})
    logs.push({exoticAfterResistances: {...exotic}})

    let finalDamage = 0
    finalDamage += Object.values(mundane).reduce((s,v) => s + v,0)
    logs.push({finalDamageAfterMundane: finalDamage})
    finalDamage += Object.values(exotic).reduce((s,v) => s + v,0)
    logs.push({finalDamageAfterExotic: finalDamage})

    console.log(logs)
    return finalDamage
}

function resolveShootDamage(attacker, defender, modifiers = {}) {
    return 3 + attacker.stats.secondary.magicPower() * (modifiers.critical ? 2 : 1)
}

function resolveThrowDamage(attacker, defender, modifiers = {}) {
    return 38+ attacker.stats.secondary.magicPower() * (modifiers.critical ? 2 : 1)
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
        const damage = resolveMeleeDamage(attacker, defender, {critical: true})
        console.log(`${attacker.name} crits ${defender.name} for ${damage} life!`)
        defender.stats.currentLife -= damage
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
        const damage = resolveMeleeDamage(attacker, defender, { block: true })
        console.log(`${defender.name} successfully blocks attack from ${attacker.name}, for ${damage} life!`)
        defender.stats.currentLife -= damage
        return
    }

    const damage = resolveMeleeDamage(attacker, defender)
    console.log(`${attacker.name} hits ${defender.name} for ${damage} life!`)
    defender.stats.currentLife -= damage
}

export function rangeShoot(rng, attacker, defender, depth = 0) {
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
        const damage = resolveShootDamage(attacker, defender, {critical: true})
        console.log(`${attacker.name} crits ${defender.name} for ${damage} life!`)
        defender.stats.currentLife -= damage
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
        const damage = Math.floor(resolveShootDamage(attacker, defender, {block: true}))
        console.log(`${defender.name} successfully blocks attack from ${attacker.name}, for ${damage} life!`)
        defender.stats.currentLife -= damage
        return
    }

    const damage = resolveShootDamage(attacker, defender)
    console.log(`${attacker.name} hits ${defender.name} for ${damage} life!`)
    defender.stats.currentLife -= damage
}


export function rangeThrow(rng, attacker, defender, depth = 0) {
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
        const damage = resolveThrowDamage(attacker, defender, {critical: true})
        console.log(`${attacker.name} crits ${defender.name} for ${damage} life!`)
        defender.stats.currentLife -= damage
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
        const damage = Math.floor(resolveThrowDamage(attacker, defender, {block: true}))
        console.log(`${defender.name} successfully blocks attack from ${attacker.name}, for ${damage} life!`)
        defender.stats.currentLife -= damage
        return
    }

    const damage = resolveThrowDamage(attacker, defender)
    console.log(`${attacker.name} hits ${defender.name} for ${damage} life!`)
    defender.stats.currentLife -= damage
}
