/**
 * server.js - Real-Time Chat Application Server
 * 
 * This is the main server file for the Task-2 Chat Application.
 * It sets up an Express web server to serve static frontend files,
 * configures Socket.IO to handle real-time bi-directional communication,
 * and manages user connections, disconnections, and message broadcasting.
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = socketIo(server);

// Define PORT (Defaults to 3002 or custom environment port)
const PORT = process.env.PORT || 3002;

// Serve static frontend assets from the "../frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Store active users in memory mapping Socket ID to Username/Avatar info
// Example structure: { "socket_id_123": { username: "Alice", color: "#6366f1" } }
const activeUsers = {};

// Handle Socket.IO connection event
io.on('connection', (socket) => {
    console.log(`[System] New connection established. Socket ID: ${socket.id}`);

    /**
     * Event: join-chat
     * Triggered when a new user enters their username and joins the room.
     */
    socket.on('join-chat', (userData) => {
        const username = userData.username ? userData.username.trim() : 'Anonymous';
        const color = userData.color || '#6366f1'; // Default Indigo color

        // Basic validation
        if (!username) {
            return socket.emit('error-msg', 'Username cannot be empty.');
        }

        // Store user in active list
        activeUsers[socket.id] = { username, color };

        console.log(`[User Joined] ${username} (Socket ID: ${socket.id})`);

        // 1. Broadcast join notification to ALL OTHER users
        socket.broadcast.emit('system-notification', {
            type: 'join',
            text: `${username} joined the chat`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // 2. Send welcome message back to the user who joined
        socket.emit('system-notification', {
            type: 'welcome',
            text: `Welcome to the chat room, ${username}!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // 3. Broadcast the updated active users list to everyone
        io.emit('user-list-update', Object.values(activeUsers));
    });

    /**
     * Event: send-message
     * Triggered when a user submits a chat message.
     */
    socket.on('send-message', (msgText) => {
        const currentUser = activeUsers[socket.id];
        
        // Ensure user is registered/joined
        if (!currentUser) {
            return socket.emit('error-msg', 'Please join the chat before sending messages.');
        }

        // Input validation
        const trimmedMsg = msgText ? msgText.trim() : '';
        if (trimmedMsg.length === 0) {
            return socket.emit('error-msg', 'Message cannot be empty.');
        }

        if (trimmedMsg.length > 500) {
            return socket.emit('error-msg', 'Message is too long (maximum 500 characters).');
        }

        // Construct message payload
        const messagePayload = {
            id: `${socket.id}-${Date.now()}`,
            username: currentUser.username,
            color: currentUser.color,
            text: trimmedMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            socketId: socket.id // Used by client to distinguish sent vs received
        };

        // Broadcast message to everyone (including sender)
        io.emit('new-message', messagePayload);
    });

    /**
     * Event: typing
     * Broadcasts typing status to other users.
     */
    socket.on('typing', (isTyping) => {
        const currentUser = activeUsers[socket.id];
        if (currentUser) {
            socket.broadcast.emit('user-typing', {
                username: currentUser.username,
                isTyping: isTyping
            });
        }
    });

    /**
     * Event: disconnect
     * Triggered when a socket connection terminates (closed tab, network drop, etc.).
     */
    socket.on('disconnect', () => {
        const disconnectedUser = activeUsers[socket.id];

        if (disconnectedUser) {
            console.log(`[User Left] ${disconnectedUser.username} (Socket ID: ${socket.id})`);

            // 1. Broadcast leave notification to everyone else
            socket.broadcast.emit('system-notification', {
                type: 'leave',
                text: `${disconnectedUser.username} left the chat`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // 2. Remove user from active list
            delete activeUsers[socket.id];

            // 3. Broadcast the updated active users list to everyone
            io.emit('user-list-update', Object.values(activeUsers));
        }
    });
});

// Start listening on the server port
server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Real-Time Chat Server is running!`);
    console.log(`👉 Local: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
