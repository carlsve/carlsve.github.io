export const CONSUMABLE = ['consumable']
export const SELECTABLE = ['throwable', 'shootable']
export const USABLE = [].concat(CONSUMABLE, SELECTABLE)

export const makeItem = (type) => {
    const items = {
        sword: { tile: 'sword', name: 'wooden sword', type: 'weapon', stats: { damages: { crushing: 2 }, secondary: { criticalChance: 2 } } },
        sword2: { tile: 'sword', name: 'wooden sword2', type: 'weapon', stats: { damages: { crushing: 4 }, secondary: { criticalChance: 2 } } },
        helmet: { tile: 'helmet', name: 'wooden helmet', type: 'helmet', stats: { resistances: { crushing: 2 }, secondary: { armourAbsorption: 2 }, } },
        glasses: { tile: 'helmet', name: 'glasses', type: 'helmet', stats: { secondary: { visualSightRadius: 1 } } },
        healthPotion: { tile: 'healthPotion', name: 'health potion', type: 'consumable', effect: 'heal' },
        arrows: { tile: 'arrows', name: 'arrows', type: 'shootable', stats: { damages: { piercing: 2, slashing: 1 } } },
        crossbow: { tile: 'crossbow', name: 'crossbow', type: 'crossbow', stats: { damages: { piercing: 3 } } },
        throwingStar: { tile: 'throwingStar', name: 'throwing star', type: 'throwable', stats: { damages: { slashing: 2, piercing: 3 } } },
    }

    if (items[type] === undefined) {
        throw new Error(`There exists no item of type ${type}`)
    }
    return items[type]
}
