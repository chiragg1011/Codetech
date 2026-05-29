/**
 * script.js - AeroChat Client Logic
 * 
 * Manages the Socket.IO connection, triggers view transitions,
 * processes user inputs, handles client-side typing indicator statuses,
 * manages active user list rendering, and handles real-time message feeds.
 */

document.addEventListener('DOMContentLoaded', () => {
    const errorOverlay = document.getElementById('error-overlay');
    
    // Check if Socket.IO library is loaded correctly (e.g., if opened via file:// instead of http://)
    if (typeof io === 'undefined') {
        console.error('Socket.IO client library is not loaded. Ensure the Node server is running.');
        if (errorOverlay) {
            errorOverlay.classList.remove('hidden');
        }
        return; // Halt script execution
    }

    // 1. Establish Socket.IO Client connection
    const socket = io();

    // Show connection error if backend connection fails
    socket.on('connect_error', () => {
        console.error('Failed to connect to the backend server.');
        if (errorOverlay) {
            errorOverlay.classList.remove('hidden');
        }
    });

    // Hide error overlay if connected successfully
    socket.on('connect', () => {
        console.log('Socket connected.');
        if (errorOverlay) {
            errorOverlay.classList.add('hidden');
        }
    });

    // 2. DOM Elements Selection
    const joinView = document.getElementById('join-view');
    const chatView = document.getElementById('chat-view');
    
    // Join Screen Elements
    const joinForm = document.getElementById('join-form');
    const usernameInput = document.getElementById('username-input');
    const usernameError = document.getElementById('username-error');
    
    // Header & Sidebar Elements
    const userCount = document.getElementById('user-count');
    const userList = document.getElementById('user-list');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const chatSidebar = document.getElementById('chat-sidebar');
    const leaveBtn = document.getElementById('leave-btn');
    
    // Chat Main Workspace Elements
    const messagesContainer = document.getElementById('messages-container');
    const typingContainer = document.getElementById('typing-container');
    const typingText = document.getElementById('typing-text');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    
    // Emoji Elements
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiDropdown = document.getElementById('emoji-dropdown');

    // 3. Application State Variables
    let currentUsername = '';
    let selectedColor = '#6366f1';
    let isTyping = false;
    let typingTimeout = null;

    // ==================== HELPER UTILITIES ====================

    /**
     * Escape HTML helper to prevent XSS attacks when rendering messages.
     * Escapes standard HTML special characters.
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Auto-scroll message container to the bottom when new message arrives.
     */
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Generate dynamic user initials for beautiful placeholder avatars.
     */
    function getInitials(name) {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    // ==================== EVENT HANDLERS & ACTION LOGIC ====================

    // A. JOIN WORKSPACE ACTION
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        
        // Input Validation
        if (username.length < 2 || username.length > 20) {
            usernameError.style.display = 'flex';
            usernameInput.focus();
            return;
        }

        usernameError.style.display = 'none';
        currentUsername = username;

        // Retrieve selected avatar color accent
        const colorRadio = document.querySelector('input[name="chat-color"]:checked');
        if (colorRadio) {
            selectedColor = colorRadio.value;
        }

        // Emit 'join-chat' event to backend
        socket.emit('join-chat', {
            username: currentUsername,
            color: selectedColor
        });

        // Switch active views on the frontend
        joinView.classList.remove('active');
        chatView.classList.add('active');

        // Focus message field
        messageInput.focus();
    });

    // B. SEND MESSAGE ACTION
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const messageText = messageInput.value.trim();

        if (messageText.length === 0) return;

        // Validate text length
        if (messageText.length > 500) {
            alert('Message cannot exceed 500 characters.');
            return;
        }

        // Emit message payload to the server
        socket.emit('send-message', messageText);

        // Reset message form and clear typing state
        messageInput.value = '';
        clearTypingState();
    });

    // C. TYPING STATUS HANDLING
    messageInput.addEventListener('input', () => {
        if (!isTyping) {
            isTyping = true;
            socket.emit('typing', true);
        }

        // Clear existing timer and restart countdown
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            clearTypingState();
        }, 1500); // clear typing state if user pauses for 1.5s
    });

    function clearTypingState() {
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', false);
        }
    }

    // D. EMOJI SELECTOR TOGGLE & INSERTION
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiDropdown.classList.toggle('hidden');
    });

    // Close emoji dropdown when clicking outside
    document.addEventListener('click', () => {
        emojiDropdown.classList.add('hidden');
    });

    // Insert emoji into input field on click
    emojiDropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-item')) {
            messageInput.value += e.target.textContent;
            messageInput.focus();
        }
    });

    // E. LEAVE CHAT ACTION
    leaveBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to exit the AeroChat workspace?')) {
            window.location.reload(); // Quick refresh disconnects the socket and resets UI
        }
    });

    // F. MOBILE RESPONSIVE SIDEBAR DRAWER TOGGLE
    toggleSidebarBtn.addEventListener('click', () => {
        chatSidebar.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', () => {
        chatSidebar.classList.remove('active');
    });

    // ==================== SOCKET.IO SERVER LISTENER CHANNELS ====================

    // Channel 1: Listen for system notifications (welcome, join, leave)
    socket.on('system-notification', (data) => {
        const systemEl = document.createElement('div');
        systemEl.classList.add('message-system', data.type);
        
        let iconClass = 'fa-solid fa-circle-info';
        if (data.type === 'join') iconClass = 'fa-solid fa-user-plus';
        if (data.type === 'leave') iconClass = 'fa-solid fa-user-minus';
        if (data.type === 'welcome') iconClass = 'fa-solid fa-door-open';

        systemEl.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${escapeHTML(data.text)}</span>
            <span style="font-size: 9px; opacity: 0.6; margin-left: 6px;">${data.timestamp}</span>
        `;

        messagesContainer.appendChild(systemEl);
        scrollToBottom();
    });

    // Channel 2: Listen for incoming chat messages
    socket.on('new-message', (msg) => {
        const messageRow = document.createElement('div');
        messageRow.classList.add('message-row');

        // Determine if message is sent by current user or received
        // (matches using the sender's socketId vs the current client socket id)
        const isSentByMe = (msg.socketId === socket.id);
        
        if (isSentByMe) {
            messageRow.classList.add('sent');
        } else {
            messageRow.classList.add('received');
        }

        // Render message content with escaped html for protection
        messageRow.innerHTML = `
            ${!isSentByMe ? `<span class="message-sender" style="color: ${msg.color}">${escapeHTML(msg.username)}</span>` : ''}
            <div class="message-bubble">
                <span class="message-text">${escapeHTML(msg.text)}</span>
                <span class="message-meta">${msg.timestamp}</span>
            </div>
        `;

        messagesContainer.appendChild(messageRow);
        scrollToBottom();
    });

    // Channel 3: Listen for online users updates
    socket.on('user-list-update', (users) => {
        userCount.textContent = users.length;
        userList.innerHTML = '';

        users.forEach(user => {
            const userEl = document.createElement('li');
            userEl.classList.add('user-item');

            const initials = getInitials(user.username);

            userEl.innerHTML = `
                <div class="user-avatar" style="background-color: ${user.color}">
                    ${escapeHTML(initials)}
                </div>
                <div class="user-details">
                    <span class="user-name">${escapeHTML(user.username)}</span>
                    <span class="user-status">Online</span>
                </div>
            `;

            userList.appendChild(userEl);
        });
    });

    // Channel 4: Listen for typing indicators from other users
    socket.on('user-typing', (data) => {
        if (data.isTyping) {
            typingText.textContent = `${data.username} is typing`;
            typingContainer.classList.add('active');
        } else {
            typingContainer.classList.remove('active');
        }
        scrollToBottom();
    });

    // Channel 5: Listen for server error alerts
    socket.on('error-msg', (errMsg) => {
        alert(`[Server Error] ${errMsg}`);
    });

    // Handle standard reconnection/disconnect socket events
    socket.on('disconnect', () => {
        console.warn('Socket connection lost.');
    });

    socket.on('connect', () => {
        console.log('Socket connected.');
    });
});
