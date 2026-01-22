const { createInitialGameState, createTemplateCard } = require("../../shared/GameState");

// Game room management
const games = new Map(); // sessionId -> gameState

function createGame(sessionId, player1Id, player2Id) {
  const gameState = createInitialGameState(player1Id, player2Id);

  // Initialize decks with template cards
  gameState.players[player1Id].deck = Array.from({ length: 20 }, (_, i) =>
    createTemplateCard(`p1-card-${i}`, player1Id, i % 3 === 0 ? 'spell' : 'monster')
  );
  gameState.players[player2Id].deck = Array.from({ length: 20 }, (_, i) =>
    createTemplateCard(`p2-card-${i}`, player2Id, i % 3 === 0 ? 'spell' : 'monster')
  );

  // Draw initial hands (5 cards each)
  for (let i = 0; i < 5; i++) {
    drawCard(gameState, player1Id);
    drawCard(gameState, player2Id);
  }

  gameState.gameStarted = true;
  games.set(sessionId, gameState);

  return gameState;
}

function drawCard(gameState, playerId) {
  const player = gameState.players[playerId];
  if (player.deck.length > 0) {
    const card = player.deck.pop();
    player.hand.push(card);
    return card;
  }
  return null;
}

function playCard(gameState, playerId, handIndex) {
  const player = gameState.players[playerId];

  if (gameState.currentTurn !== playerId) {
    return { success: false, error: "Not your turn" };
  }

  if (handIndex < 0 || handIndex >= player.hand.length) {
    return { success: false, error: "Invalid hand index" };
  }

  const card = player.hand[handIndex];

  // Check mana cost
  if (card.manaCost > player.mana) {
    return { success: false, error: "Not enough mana" };
  }

  // Remove from hand
  player.hand.splice(handIndex, 1);

  // Deduct mana
  player.mana -= card.manaCost;

  // Place on board
  if (card.type === 'monster') {
    // Find empty monster zone
    const emptySlot = player.board.monsters.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      player.board.monsters[emptySlot] = card;
    } else {
      return { success: false, error: "No empty monster zones" };
    }
  } else if (card.type === 'spell') {
    // Execute spell effect immediately
    const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
    const opponent = gameState.players[opponentId];

    if (card.effect === 'basic-damage') {
      opponent.lifePoints -= card.effectValue;
    }

    // Spell goes to graveyard (not implemented yet, just discard)
  }

  return { success: true, gameState };
}

function attack(gameState, attackerId, attackerIndex, targetIndex) {
  const attacker = gameState.players[attackerId];
  const opponentId = Object.keys(gameState.players).find(id => id !== attackerId);
  const opponent = gameState.players[opponentId];

  if (gameState.currentTurn !== attackerId) {
    return { success: false, error: "Not your turn" };
  }

  if (gameState.phase !== 'battle') {
    return { success: false, error: "Not battle phase" };
  }

  const attackingMonster = attacker.board.monsters[attackerIndex];
  if (!attackingMonster) {
    return { success: false, error: "No monster in that position" };
  }

  // Direct attack
  if (targetIndex === -1) {
    // Check if opponent has monsters
    const hasMonsters = opponent.board.monsters.some(m => m !== null);
    if (hasMonsters) {
      return { success: false, error: "Cannot attack directly while opponent has monsters" };
    }
    opponent.lifePoints -= attackingMonster.attack;
  } else {
    // Attack monster
    const targetMonster = opponent.board.monsters[targetIndex];
    if (!targetMonster) {
      return { success: false, error: "No target monster" };
    }

    // Battle calculation
    if (attackingMonster.attack > targetMonster.defense) {
      // Destroy target
      opponent.board.monsters[targetIndex] = null;
    } else if (attackingMonster.attack < targetMonster.defense) {
      // Attacker takes damage
      attacker.lifePoints -= (targetMonster.defense - attackingMonster.attack);
    } else {
      // Both destroyed
      opponent.board.monsters[targetIndex] = null;
      attacker.board.monsters[attackerIndex] = null;
    }
  }

  // Check for game over
  if (opponent.lifePoints <= 0) {
    gameState.winner = attackerId;
    gameState.gameStarted = false;
  }

  return { success: true, gameState };
}

function endTurn(gameState, playerId) {
  if (gameState.currentTurn !== playerId) {
    return { success: false, error: "Not your turn" };
  }

  // Switch turns
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  gameState.currentTurn = opponentId;
  gameState.turnNumber += 1;
  gameState.phase = 'draw';

  // Restore mana for new turn player
  const newTurnPlayer = gameState.players[opponentId];
  newTurnPlayer.maxMana = Math.min(10, Math.floor(gameState.turnNumber / 2) + 3);
  newTurnPlayer.mana = newTurnPlayer.maxMana;

  // Draw card
  const drawnCard = drawCard(gameState, opponentId);

  return { success: true, gameState, drawnCard };
}

function getGame(sessionId) {
  return games.get(sessionId);
}

function deleteGame(sessionId) {
  games.delete(sessionId);
}

module.exports = {
  createGame,
  getGame,
  deleteGame,
  playCard,
  attack,
  endTurn,
  drawCard
};
