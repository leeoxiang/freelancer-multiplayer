import React from "react";
import "./Board.css";

export default function Board({ gameState, playerId, onPlayCard, onAttack, onEndTurn }) {
  if (!gameState || !playerId) {
    return <div className="board_wrapper">Waiting for game to start...</div>;
  }

  const player = gameState.players[playerId];
  const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
  const opponent = gameState.players[opponentId];
  const isMyTurn = gameState.currentTurn === playerId;

  const handleCardClick = (card, zone, index) => {
    if (!isMyTurn) return;
    console.log('Card clicked:', card, zone, index);
  };

  const handleEndTurn = () => {
    if (isMyTurn && onEndTurn) {
      onEndTurn();
    }
  };

  const renderCardZone = (card, index, isOwner, type) => {
    return (
      <div
        key={`${type}-${index}`}
        className={`card-zone ${card ? 'has-card' : 'empty'}`}
        onClick={() => card && handleCardClick(card, type, index)}
      >
        {card ? (
          <div className="board-card">
            <div className="card-name">{card.name}</div>
            {card.type === 'monster' && (
              <>
                <div className="card-stats">
                  <span className="atk">ATK: {card.attack}</span>
                  <span className="def">DEF: {card.defense}</span>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="board_wrapper">
      <div className="game-board">
        {/* Opponent Side */}
        <div className="player-side opponent-side">
          <div className="player-info">
            <div className="player-name">Opponent</div>
            <div className="life-points">LP: {opponent?.lifePoints || 0}</div>
            <div className="mana">Mana: {opponent?.mana || 0}/{opponent?.maxMana || 0}</div>
          </div>
          <div className="card-zones">
            <div className="monster-zones">
              {opponent?.board.monsters.map((card, i) => renderCardZone(card, i, false, 'monster'))}
            </div>
            <div className="spell-zones">
              {opponent?.board.spells.map((card, i) => renderCardZone(card, i, false, 'spell'))}
            </div>
          </div>
          <div className="hand-indicator">
            Cards in hand: {opponent?.hand.length || 0}
          </div>
        </div>

        {/* Center Field */}
        <div className="center-field">
          <div className="turn-info">
            <div className="turn-number">Turn {gameState.turnNumber}</div>
            <div className={`turn-indicator ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
              {isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN"}
            </div>
            <div className="phase">Phase: {gameState.phase}</div>
          </div>
        </div>

        {/* Player Side */}
        <div className="player-side my-side">
          <div className="card-zones">
            <div className="spell-zones">
              {player?.board.spells.map((card, i) => renderCardZone(card, i, true, 'spell'))}
            </div>
            <div className="monster-zones">
              {player?.board.monsters.map((card, i) => renderCardZone(card, i, true, 'monster'))}
            </div>
          </div>
          <div className="player-info">
            <div className="player-name">You</div>
            <div className="life-points">LP: {player?.lifePoints || 0}</div>
            <div className="mana">Mana: {player?.mana || 0}/{player?.maxMana || 0}</div>
            <button
              className="end-turn-btn"
              onClick={handleEndTurn}
              disabled={!isMyTurn}
            >
              End Turn
            </button>
          </div>
        </div>

        {/* Player Hand */}
        <div className="hand-area">
          <div className="hand">
            {player?.hand.map((card, i) => (
              <div
                key={`hand-${i}`}
                className="hand-card"
                onClick={() => onPlayCard && onPlayCard(card, i)}
              >
                <div className="card-content">
                  <div className="card-name">{card.name}</div>
                  <div className="card-cost">Cost: {card.manaCost}</div>
                  {card.type === 'monster' && (
                    <div className="card-stats">
                      <div>ATK: {card.attack}</div>
                      <div>DEF: {card.defense}</div>
                    </div>
                  )}
                  <div className="card-desc">{card.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
