const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Game rooms storage
const rooms = new Map();

// Question Bank
const questions = {
    clean: {
        truths: [
            "What's your most embarrassing moment?",
            "What's your biggest fear?",
            "What's the worst gift you've ever received?",
            "What's your guilty pleasure?",
            "What's the most childish thing you still do?",
            "What's the last lie you told?",
            "What's your worst habit?",
            "What's the most embarrassing thing in your search history?",
            "What's your biggest pet peeve?",
            "What's the silliest thing you're afraid of?",
            "What's your most unpopular opinion?",
            "What talent do you wish you had?",
            "What's the weirdest dream you've ever had?",
            "What's the most awkward date you've been on?",
            "What would you do with a million dollars?",
            "What's your biggest regret?",
            "What's the meanest thing you've ever said to someone?",
            "What's your secret talent?",
            "If you could be invisible for a day, what would you do?",
            "What's the most trouble you've been in?",
        ],
        dares: [
            "Do your best celebrity impression",
            "Show the last photo in your camera roll",
            "Do 10 jumping jacks",
            "Speak in an accent for the next 3 rounds",
            "Let another player post something on your social media",
            "Do your best dance move",
            "Make up a short rap about another player",
            "Talk without closing your mouth",
            "Act like a chicken for 30 seconds",
            "Let the group give you a new nickname for the game",
            "Do your best evil laugh",
            "Sing everything you say for 2 rounds",
            "Do your best impression of another player",
            "Call a friend and sing happy birthday",
            "Let someone draw on your face (or hand)",
            "Do a dramatic reading of the last text you sent",
            "Hold your breath for 30 seconds",
            "Do 5 push-ups",
            "Say the alphabet backwards",
            "Make an animal sound and don't stop until someone guesses it",
        ]
    },
    friends: {
        truths: [
            "Who's your secret crush?",
            "What's the most embarrassing thing you've done for a crush?",
            "Have you ever lied to get out of plans?",
            "What's the worst thing you've ever said behind someone's back?",
            "Have you ever cheated on a test?",
            "What's your most embarrassing social media moment?",
            "Who would you want to be stuck on an island with?",
            "What's the weirdest thing you've done when alone?",
            "Have you ever stalked someone on social media?",
            "What's the longest you've gone without showering?",
            "What's the biggest secret you've kept from your parents?",
            "What's the most cringy text you've ever sent?",
            "Have you ever pretended to like a gift?",
            "What's your most embarrassing nickname?",
            "What's the worst date you've ever been on?",
            "Have you ever broken something and blamed someone else?",
            "What's the most immature thing you still do?",
            "Who in this room would you least want to be stuck in an elevator with?",
            "What's the last thing you cried about?",
            "Have you ever had a wardrobe malfunction?",
        ],
        dares: [
            "Let another player go through your phone for 1 minute",
            "Send a flirty text to someone",
            "Post an embarrassing photo on social media",
            "Show your screen time",
            "Call your crush",
            "Do a TikTok dance",
            "Let the group pick your profile picture for a day",
            "Read out your last 5 search history items",
            "Text your ex 'I miss you'",
            "Let someone send a text from your phone",
            "Do your best model walk",
            "Show your most embarrassing saved photo",
            "Do a dramatic breakup scene",
            "Attempt to do the splits",
            "Let someone restyle your hair",
            "Eat a weird food combination",
            "Do an impression of your crush",
            "Call someone and tell them you love them",
            "Act out your most embarrassing moment",
            "Let the group create a dating profile for you",
        ]
    },
    party: {
        truths: [
            "What's your body count?",
            "Have you ever been caught doing something naughty?",
            "What's your wildest fantasy?",
            "What's the craziest thing you've done at a party?",
            "Have you ever skinny dipped?",
            "What's your most scandalous secret?",
            "Have you ever had a one night stand?",
            "What's the furthest you've gone on a first date?",
            "Have you ever been caught watching something embarrassing?",
            "What's the most rebellious thing you've done?",
            "Have you ever lied about your age?",
            "What's the drunkest you've ever been?",
            "Have you ever woken up somewhere and not known where you were?",
            "What's something you've never told anyone?",
            "What's the craziest rumor about you that's actually true?",
            "Have you ever been in handcuffs?",
            "What's your biggest turn on?",
            "Have you ever ghosted someone? Why?",
            "What's the most scandalous photo on your phone?",
            "What would you do if you knew you wouldn't get caught?",
        ],
        dares: [
            "Take a body shot (or pretend to)",
            "Give someone a lap dance",
            "Remove one piece of clothing",
            "Exchange an item of clothing with another player",
            "Let someone give you a hickey (or draw one)",
            "Sit on someone's lap for the next round",
            "Do your sexiest dance",
            "Send a risky text to someone",
            "Whisper something seductive to the player on your right",
            "Do 7 minutes in heaven (closet/room) with someone",
            "Let someone body paint something on you",
            "Do a strip tease (keep it PG-13)",
            "Kiss the person to your left on the cheek",
            "Play the rest of the game blindfolded",
            "Let someone go through your DMs",
            "Show your most scandalous photo",
            "Do your best fake moan",
            "Recreate a romantic movie scene",
            "Give someone a massage for 1 minute",
            "Do a body shot (or drink equivalent)",
        ]
    }
};

// Avatars and colors for players
const avatars = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺', '🎻', '🎹', '🎤', '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🦄'];
const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

// Generate room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Get random question
function getRandomQuestion(mode, type) {
    const pool = questions[mode][type === 'truth' ? 'truths' : 'dares'];
    return pool[Math.floor(Math.random() * pool.length)];
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game/:code', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create room
    socket.on('createRoom', ({ playerName, mode }) => {
        const roomCode = generateRoomCode();
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const room = {
            code: roomCode,
            mode: mode || 'friends',
            host: socket.id,
            players: [{
                id: socket.id,
                name: playerName,
                avatar,
                color,
                points: 0,
                skipsLeft: 1,
                isOnline: true
            }],
            currentPlayer: 0,
            currentQuestion: null,
            currentType: null,
            gameStarted: false,
            spinResult: null,
            timer: null,
            messages: [],
            customQuestions: { truths: [], dares: [] }
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit('roomCreated', { roomCode, player: room.players[0], room });
        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join room
    socket.on('joinRoom', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode.toUpperCase());

        if (!room) {
            socket.emit('error', { message: 'Room not found!' });
            return;
        }

        if (room.players.length >= 20) {
            socket.emit('error', { message: 'Room is full!' });
            return;
        }

        // Check if player is reconnecting (same name exists and is offline)
        let player = room.players.find(p => p.name === playerName && !p.isOnline);
        
        if (player) {
            // Reconnect existing player
            player.id = socket.id;
            player.isOnline = true;
        } else {
            // New player
            const avatar = avatars[Math.floor(Math.random() * avatars.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            player = {
                id: socket.id,
                name: playerName,
                avatar,
                color,
                points: 0,
                skipsLeft: 1,
                isOnline: true
            };

            room.players.push(player);
        }
        
        socket.join(roomCode.toUpperCase());
        socket.roomCode = roomCode.toUpperCase();

        // Update host if needed
        if (!room.players.find(p => p.id === room.host && p.isOnline)) {
            room.host = socket.id;
        }

        socket.emit('joinedRoom', { player, room });
        io.to(roomCode.toUpperCase()).emit('playerJoined', { player, players: room.players });
        
        // Send system message
        const systemMsg = { type: 'system', text: `${playerName} joined the game!`, timestamp: Date.now() };
        room.messages.push(systemMsg);
        io.to(roomCode.toUpperCase()).emit('chatMessage', systemMsg);

        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Start game
    socket.on('startGame', () => {
        const room = rooms.get(socket.roomCode);
        if (!room || room.host !== socket.id) return;

        if (room.players.length < 2) {
            socket.emit('error', { message: 'Need at least 2 players to start!' });
            return;
        }

        room.gameStarted = true;
        room.currentPlayer = 0;
        io.to(socket.roomCode).emit('gameStarted', { room });
    });

    // Spin
    socket.on('spin', () => {
        const room = rooms.get(socket.roomCode);
        if (!room || !room.gameStarted) return;

        const onlinePlayers = room.players.filter(p => p.isOnline);
        if (onlinePlayers.length < 2) return;

        const randomIndex = Math.floor(Math.random() * onlinePlayers.length);
        const selectedPlayer = onlinePlayers[randomIndex];
        room.spinResult = selectedPlayer.id;
        room.currentPlayer = room.players.findIndex(p => p.id === selectedPlayer.id);

        io.to(socket.roomCode).emit('spinResult', { 
            selectedPlayer,
            players: onlinePlayers
        });
    });

    // Choose truth or dare
    socket.on('chooseTruthOrDare', ({ choice }) => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const currentPlayer = room.players[room.currentPlayer];
        if (currentPlayer.id !== socket.id) return;

        // Get question from custom or default pool
        let question;
        const customPool = room.customQuestions[choice === 'truth' ? 'truths' : 'dares'];
        if (customPool.length > 0 && Math.random() < 0.3) {
            question = customPool[Math.floor(Math.random() * customPool.length)];
        } else {
            question = getRandomQuestion(room.mode, choice);
        }

        room.currentType = choice;
        room.currentQuestion = question;

        io.to(socket.roomCode).emit('questionRevealed', {
            type: choice,
            question,
            player: currentPlayer,
            timeLimit: 30
        });
    });

    // Complete challenge
    socket.on('completeChallenge', ({ completed }) => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const currentPlayer = room.players[room.currentPlayer];
        if (currentPlayer.id !== socket.id) return;

        if (completed) {
            currentPlayer.points += room.currentType === 'dare' ? 20 : 10;
        }

        io.to(socket.roomCode).emit('challengeComplete', {
            player: currentPlayer,
            completed,
            players: room.players
        });

        room.currentQuestion = null;
        room.currentType = null;
        room.spinResult = null;
    });

    // Skip
    socket.on('skipChallenge', () => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const currentPlayer = room.players[room.currentPlayer];
        if (currentPlayer.id !== socket.id) return;

        if (currentPlayer.skipsLeft > 0) {
            currentPlayer.skipsLeft--;
            currentPlayer.points = Math.max(0, currentPlayer.points - 5);

            io.to(socket.roomCode).emit('challengeSkipped', {
                player: currentPlayer,
                players: room.players
            });

            room.currentQuestion = null;
            room.currentType = null;
            room.spinResult = null;
        }
    });

    // Reaction
    socket.on('sendReaction', ({ emoji }) => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        io.to(socket.roomCode).emit('reaction', {
            emoji,
            playerName: player.name,
            playerId: socket.id
        });
    });

    // Chat message
    socket.on('sendChatMessage', ({ text }) => {
        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const message = {
            type: 'player',
            playerId: socket.id,
            playerName: player.name,
            playerAvatar: player.avatar,
            playerColor: player.color,
            text,
            timestamp: Date.now()
        };

        room.messages.push(message);
        if (room.messages.length > 100) room.messages.shift();

        io.to(socket.roomCode).emit('chatMessage', message);
    });

    // Add custom question
    socket.on('addCustomQuestion', ({ type, question }) => {
        const room = rooms.get(socket.roomCode);
        if (!room || room.host !== socket.id) return;

        if (type === 'truth') {
            room.customQuestions.truths.push(question);
        } else {
            room.customQuestions.dares.push(question);
        }

        io.to(socket.roomCode).emit('customQuestionAdded', { type, question });
    });

    // Change game mode
    socket.on('changeMode', ({ mode }) => {
        const room = rooms.get(socket.roomCode);
        if (!room || room.host !== socket.id) return;

        room.mode = mode;
        io.to(socket.roomCode).emit('modeChanged', { mode });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isOnline = false;

            // Send system message
            const systemMsg = { type: 'system', text: `${player.name} left the game`, timestamp: Date.now() };
            room.messages.push(systemMsg);
            io.to(roomCode).emit('chatMessage', systemMsg);

            io.to(roomCode).emit('playerLeft', { player, players: room.players });

            // If host left, assign new host
            if (room.host === socket.id) {
                const onlinePlayer = room.players.find(p => p.isOnline);
                if (onlinePlayer) {
                    room.host = onlinePlayer.id;
                    io.to(roomCode).emit('newHost', { hostId: onlinePlayer.id });
                }
            }

            // Clean up empty rooms after a delay (grace period for page redirects)
            setTimeout(() => {
                const currentRoom = rooms.get(roomCode);
                if (currentRoom) {
                    const onlinePlayers = currentRoom.players.filter(p => p.isOnline);
                    if (onlinePlayers.length === 0) {
                        rooms.delete(roomCode);
                        console.log(`Room ${roomCode} deleted (empty)`);
                    }
                }
            }, 10000); // 10 second grace period
        }

        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`
    🎲 Truth or Dare Server Running!
    
    🌐 http://localhost:${PORT}
    
    Ready for players!
    `);
});
