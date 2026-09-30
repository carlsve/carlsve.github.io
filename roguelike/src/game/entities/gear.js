export const equip = (game, type, item) => {
    game.gear[type] = item
    for (const [stat, value] of Object.entries(item.stats.primary || {})) {
        game.player.stats.statDump.primary[stat] += value
    }
    
    for (const [stat, value] of Object.entries(item.stats.secondary || {})) {
        game.player.stats.statDump.secondary[stat] += value
    }
    
    for (const [damageType, value] of Object.entries(item.stats.damages || {})) {
        game.player.stats.damages[damageType] += value
    }
    
    for (const [damageType, value] of Object.entries(item.stats.resistances || {})) {
        game.player.stats.resistances[damageType] += value
    }
}

export const unequip = (game, type, item) => {
    game.gear[type] = null
    for (const [stat, value] of Object.entries(item.stats.primary || {})) {
        game.player.stats.statDump.primary[stat] -= value
    }
    for (const [stat, value] of Object.entries(item.stats.secondary || {})) {
        game.player.stats.statDump.secondary[stat] -= value
    }
    for (const [damageType, value] of Object.entries(item.stats.damages || {})) {
        game.player.stats.damages[damageType] -= value
    }
    for (const [damageType, value] of Object.entries(item.stats.resistances || {})) {
        game.player.stats.resistances[damageType] -= value
    }
}