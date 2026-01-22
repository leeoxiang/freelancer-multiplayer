// Game state structure for the card game (shared between client and server)
const createInitialGameState = (player1Id, player2Id) => {
  return {
    players: {
      [player1Id]: {
        id: player1Id,
        lifePoints: 8000,
        mana: 3,
        maxMana: 3,
        hand: [],
        deck: [],
        board: {
          monsters: [null, null, null, null, null], // 5 monster zones
          spells: [null, null, null, null, null] // 5 spell/trap zones
        }
      },
      [player2Id]: {
        id: player2Id,
        lifePoints: 8000,
        mana: 3,
        maxMana: 3,
        hand: [],
        deck: [],
        board: {
          monsters: [null, null, null, null, null],
          spells: [null, null, null, null, null]
        }
      }
    },
    currentTurn: player1Id,
    turnNumber: 1,
    phase: 'draw', // draw, main, battle, end
    gameStarted: false,
    winner: null
  };
};

// Template card structure
const createTemplateCard = (id, ownerId, type = 'monster') => {
  if (type === 'monster') {
    return {
      id,
      name: `Monster ${id.slice(-2)}`,
      type: 'monster',
      attack: Math.floor(Math.random() * 2000) + 1000,
      defense: Math.floor(Math.random() * 2000) + 800,
      level: Math.floor(Math.random() * 6) + 3,
      manaCost: Math.floor(Math.random() * 4) + 1,
      ownerId,
      position: 'attack', // attack or defense
      description: 'A basic monster card'
    };
  } else {
    return {
      id,
      name: `Spell ${id.slice(-2)}`,
      type: 'spell',
      manaCost: Math.floor(Math.random() * 3) + 1,
      ownerId,
      effect: 'basic-damage',
      effectValue: Math.floor(Math.random() * 1000) + 500,
      description: 'A basic spell card'
    };
  }
};

const GamePhases = {
  DRAW: 'draw',
  MAIN: 'main',
  BATTLE: 'battle',
  END: 'end'
};

const CardTypes = {
  MONSTER: 'monster',
  SPELL: 'spell'
};

module.exports = {
  createInitialGameState,
  createTemplateCard,
  GamePhases,
  CardTypes
};
