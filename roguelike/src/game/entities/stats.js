import { damageTypes } from "./damageTypes.js"

export const initSkills = (_skills, stats) => {
    const skills = {
        warrior: 0,
        rogue: 0,
        wizard: 0,
        ..._skills
    }

    skills.incrementWarrior = (n = 1) => {
        stats.primary.burliness   += 2 * n
        stats.primary.sagacity    += 1 * n
        stats.primary.nimbleness  += 1 * n
        stats.primary.caddishness += 2 * n
        stats.primary.savvy       += 1 * n
        stats.primary.stubborness += 2 * n
    }

    skills.incrementRogue = (n = 1) => {
        stats.primary.burliness   += 1 * n
        stats.primary.sagacity    += 1 * n
        stats.primary.nimbleness  += 2 * n
        stats.primary.caddishness += 2 * n
        stats.primary.savvy       += 2 * n
        stats.primary.stubborness += 1 * n
    }

    skills.incrementWizard = (n = 1) => {
        stats.primary.burliness   += 1 * n
        stats.primary.sagacity    += 2 * n
        stats.primary.nimbleness  += 1 * n
        stats.primary.caddishness += 1 * n
        stats.primary.savvy       += 2 * n
        stats.primary.stubborness += 2 * n
    }

    skills.incrementWarrior(skills.warrior)
    skills.incrementRogue(skills.rogue)
    skills.incrementWizard(skills.wizard)

    stats.currentLife = stats.secondary.life()
    stats.currentMana = stats.secondary.mana()

    return skills
}

export const initStats = (_primary = {}, _secondary = {}, _damages = {}, _resistances = {}) => {
    const statDump = {
        secondary: {
            meleePower: 0,
            criticalChance: 0,
            counterChance: 0,
            magicPower: 0,
            haywire: 0,
            magicResistance: 0,
            armourAbsorption: 0,
            blockChance: 0,
            dodgeChance: 0,
            enemyDodgeReduction: 0,
            sneakiness: 0,
            visualSightRadius: 0,
            trapSightRadius: 0,
            trapAffinity: 0,
            life: 0,
            lifeRegen: 0,
            mana: 0,
            manaRegen: 0,
            magicReflect: 0,
            ..._secondary,
        },
        primary: {
            burliness: 0,
            sagacity: 0,
            nimbleness: 0,
            caddishness: 0,
            savvy: 0,
            stubborness: 0,
            ..._primary,
        },
    }

    const primary = {
        burliness: 0,
        sagacity: 0,
        nimbleness: 0,
        caddishness: 0,
        savvy: 0,
        stubborness: 0,
    }

    const secondary = {
        meleePower: () => statDump.secondary.meleePower + (Math.floor(((statDump.primary.burliness + primary.burliness) - 5)/3)),
        criticalChance: () => statDump.secondary.criticalChance + (Math.floor((statDump.primary.caddishness + primary.caddishness) / 2)),
        counterChance: () => statDump.secondary.counterChance + (Math.floor(((statDump.primary.nimbleness + primary.nimbleness) + (statDump.primary.caddishness + primary.caddishness)) / 6)),
        magicPower: () => statDump.secondary.magicPower + (Math.floor((statDump.primary.sagacity + primary.sagacity) / 2)),
        haywire: () => statDump.secondary.haywire + (Math.floor((statDump.primary.savvy + primary.savvy) / 2)),
        magicResistance: () => statDump.secondary.magicResistance + (Math.floor((statDump.primary.stubborness + primary.stubborness) / 2)),
        armourAbsorption: () => statDump.secondary.armourAbsorption + (0),
        blockChance: () => statDump.secondary.blockChance + (Math.floor(((statDump.primary.burliness + primary.burliness) + (statDump.primary.stubborness + primary.stubborness)) / 6)),
        dodgeChance: () => statDump.secondary.dodgeChance + (Math.floor((statDump.primary.nimbleness + primary.nimbleness) / 2)),
        enemyDodgeReduction: () => statDump.secondary.enemyDodgeReduction + (Math.floor((statDump.primary.nimbleness + primary.nimbleness) / 3)),
        sneakiness: () => statDump.secondary.sneakiness + (Math.max(Math.floor(3/4 * ((statDump.primary.nimbleness + primary.nimbleness) + (statDump.primary.savvy + primary.savvy))) - 20, 0)),
        visualSightRadius: () => statDump.secondary.visualSightRadius + (1),
        trapSightRadius: () => statDump.secondary.trapSightRadius + (1),
        trapAffinity: () => statDump.secondary.trapAffinity + (0),
        life: () => statDump.secondary.life + ((statDump.primary.burliness + primary.burliness) + (statDump.primary.caddishness + primary.caddishness) + 5),
        lifeRegen: () => statDump.secondary.lifeRegen + (0),
        mana: () => statDump.secondary.mana + ((statDump.primary.sagacity + primary.sagacity) * 2 + 5),
        manaRegen: () => statDump.secondary.manaRegen + (0),
        magicReflect: () => statDump.secondary.magicReflect + (0),
    }

    const damages = Object.keys(damageTypes).reduce((obj, damageType) => ({...obj, [damageType]: _damages[damageType] || 0}), {})
    const resistances = Object.keys(damageTypes).reduce((obj, damageType) => ({...obj, [damageType]: _resistances[damageType] || 0}), {})

    return {
        primary,
        secondary,
        statDump,
        damages,
        resistances,
        currentLife: secondary.life(),
        currentMana: secondary.mana(),
    }
}

export const printStats = (stats) => {
    return Object.entries(stats.secondary).reduce((obj, [k, f]) => ({...obj, [k]: f()}),{})
}
