import React, { useCallback, useEffect, useState } from 'react';
import "./Game.css"
import Over from "../Over/Over"
import Board from "../Board/Board"
import Online from "../interface/Online"
import { createInitialGameState, createTemplateCard } from "../../../engine/GameState"

export default function Game() {
  const [gameState, setGameState] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [online, set_online] = useState(false)
  const [socket, set_socket] = useState()

  // Listen for socket events
  useEffect(() => {
    if (socket && online) {
      socket.on("gameState", (newState) => {
        console.log("Received game state:", newState);
        setGameState(newState);
      });

      socket.on("playerAssigned", (id) => {
        console.log("Player assigned:", id);
        setPlayerId(id);
      });

      socket.on("draw", ({ playerId: drawPlayerId, card }) => {
        console.log("Player drew card:", drawPlayerId, card);
        setGameState(prev => {
          if (!prev) return prev;
          const newState = { ...prev };
          newState.players[drawPlayerId].hand.push(card);
          return newState;
        });
      });

      socket.on("gameOver", ({ winner }) => {
        alert(`Game Over! ${winner === playerId ? 'You win!' : 'You lose!'}`);
      });

      return () => {
        socket.off("gameState");
        socket.off("playerAssigned");
        socket.off("draw");
        socket.off("gameOver");
      };
    }
  }, [socket, online, playerId]);

  const start_online = useCallback((socket) => {
    console.log("Starting online game with socket");
    set_online(true);
    set_socket(socket);
  }, []);

  const handlePlayCard = useCallback((card, handIndex) => {
    if (!socket || !gameState || gameState.currentTurn !== playerId) {
      console.log("Cannot play card:", { socket: !!socket, gameState: !!gameState, isMyTurn: gameState?.currentTurn === playerId });
      return;
    }

    console.log("Playing card:", card, handIndex);
    socket.emit("playCard", { handIndex, card });
  }, [socket, gameState, playerId]);

  const handleEndTurn = useCallback(() => {
    if (!socket || !gameState || gameState.currentTurn !== playerId) {
      return;
    }

    console.log("Ending turn");
    socket.emit("endTurn");
  }, [socket, gameState, playerId]);

  const handleAttack = useCallback((attackerIndex, targetIndex) => {
    if (!socket || !gameState || gameState.currentTurn !== playerId) {
      return;
    }

    console.log("Attacking:", attackerIndex, targetIndex);
    socket.emit("attack", { attackerIndex, targetIndex });
  }, [socket, gameState, playerId]);

  return (
    <div className="game">
      {!online && (
        <Online
          start={start_online}
          started={online}
        />
      )}
      {online && gameState && playerId && (
        <Board
          gameState={gameState}
          playerId={playerId}
          onPlayCard={handlePlayCard}
          onEndTurn={handleEndTurn}
          onAttack={handleAttack}
        />
      )}
      {online && (!gameState || !playerId) && (
        <div className="waiting-for-game">
          <h2>Waiting for opponent...</h2>
        </div>
      )}
    </div>
  )
}
