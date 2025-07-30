
export const rollDice = (sides = 20, count = 1): number => {
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total
}

export const rollStats = () => {
  return {
    STR: rollDice(6, 3) + 3,
    DEX: rollDice(6, 3) + 3,
    CON: rollDice(6, 3) + 3,
    INT: rollDice(6, 3) + 3,
    WIS: rollDice(6, 3) + 3,
    CHA: rollDice(6, 3) + 3,
  }
}
