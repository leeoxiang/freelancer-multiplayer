const socket = require("socket.io")
const client = require("./client");
const { io, set } = require("./io")
const gameLogic = require("./gameLogic");

const set_listeners = () => {
    io().on("connection", async (sock) => {
        const session_id = sock.handshake.sessionID
        await client.connect(session_id, sock.id)

        console.log("Client connected:", session_id);

        // Handle card play
        sock.on("playCard", ({ handIndex, card }) => {
            const game = gameLogic.getGame(session_id);
            if (!game) return;

            const playerId = sock.handshake.sessionID;
            const result = gameLogic.playCard(game, playerId, handIndex);

            if (result.success) {
                // Broadcast updated game state to both players
                io().to(session_id).emit("gameState", game);
            } else {
                sock.emit("error", { message: result.error });
            }
        });

        // Handle end turn
        sock.on("endTurn", () => {
            const game = gameLogic.getGame(session_id);
            if (!game) return;

            const playerId = sock.handshake.sessionID;
            const result = gameLogic.endTurn(game, playerId);

            if (result.success) {
                // Emit drawn card to the new turn player
                if (result.drawnCard) {
                    const opponentId = game.currentTurn;
                    io().to(session_id).emit("draw", { playerId: opponentId, card: result.drawnCard });
                }
                // Broadcast updated game state
                io().to(session_id).emit("gameState", game);
            } else {
                sock.emit("error", { message: result.error });
            }
        });

        // Handle attack
        sock.on("attack", ({ attackerIndex, targetIndex }) => {
            const game = gameLogic.getGame(session_id);
            if (!game) return;

            const playerId = sock.handshake.sessionID;
            const result = gameLogic.attack(game, playerId, attackerIndex, targetIndex);

            if (result.success) {
                // Check for game over
                if (game.winner) {
                    io().to(session_id).emit("gameOver", { winner: game.winner });
                    gameLogic.deleteGame(session_id);
                } else {
                    io().to(session_id).emit("gameState", game);
                }
            } else {
                sock.emit("error", { message: result.error });
            }
        });

        sock.on("disconnect", async () => {
            console.log("Client disconnected:", session_id);
            await client.disconnect(session_id);
            gameLogic.deleteGame(session_id);
        });
    });
}

const connect = (http, session) => {
    set(socket(http, {
        origins: "*:*",
        serveClient: false,
        path: "/api/socket.io",
    }));
    io().use(session)
    set_listeners()
    console.log("socket created")
}

module.exports = {
    connect,
}