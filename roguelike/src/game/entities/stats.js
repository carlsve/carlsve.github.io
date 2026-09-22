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

export const initStats = (_primary = {}, _secondary = {}) => {
    const primary = {
        burliness: 0,
        sagacity: 0,
        nimbleness: 0,
        caddishness: 0,
        savvy: 0,
        stubborness: 0,
        ..._primary
    }

    const secondary = {
        meleePower: () => _secondary.meleePower || (Math.floor((primary.burliness - 5)/3)),
        criticalChance: () => _secondary.criticalChance || (Math.floor(primary.caddishness / 2)),
        counterChance: () => _secondary.counterChance || (Math.floor((primary.nimbleness + primary.caddishness) / 6)),
        magicPower: () => _secondary.magicPower || (Math.floor(primary.sagacity / 2)),
        haywire: () => _secondary.haywire || (Math.floor(primary.savvy / 2)),
        magicResistance: () => _secondary.magicResistance || (Math.floor(primary.stubborness / 2)),
        armourAbsorption: () => _secondary.armourAbsorption || (0),
        blockChance: () => _secondary.blockChance || (Math.floor((primary.burliness + primary.stubborness) / 6)),
        dodgeChance: () => _secondary.dodgeChance || (Math.floor(primary.nimbleness / 2)),
        enemyDodgeReduction: () => _secondary.enemyDodgeReduction || (Math.floor(primary.nimbleness / 3)),
        sneakiness: () => _secondary.sneakiness || (Math.max(Math.floor(3/4 * (primary.nimbleness + primary.savvy)) - 20, 0)),
        visualSightRadius: () => _secondary.visualSightRadius || (1),
        trapSightRadius: () => _secondary.trapSightRadius || (1),
        trapAffinity: () => _secondary.trapAffinity || (0),
        life: () => _secondary.life || (primary.burliness + primary.caddishness + 5),
        lifeRegen: () => _secondary.lifeRegen || (0),
        mana: () => _secondary.mana || (primary.sagacity * 2 + 5),
        manaRegen: () => _secondary.manaRegen || (0),
        magicReflect: () => _secondary.magicReflect || (0),
    }

    return {
        primary,
        secondary,
        currentLife: secondary.life(),
        currentMana: secondary.mana()
    }
}

export const printStats = (stats) => {
    return Object.entries(stats.secondary).reduce((obj, [k, f]) => ({...obj, [k]: f()}),{})
}