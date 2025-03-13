// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const chatPage = document.getElementById('chat-page');
    const loginForm = document.getElementById('login-form');
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages');
    const userList = document.getElementById('user-list');
    const userCount = document.getElementById('user-count');
    const usernameInput = document.getElementById('username-input');
    const messageInput = document.getElementById('message-input');
    const usernameDisplay = document.getElementById('username-display');
    const sidebarHeader = document.querySelector('.sidebar-header');
    
    // Variables
    let socket;
    let username = '';
    let userTyping = false;
    let typingTimeout;
    
    // Check if user is on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    messageForm.addEventListener('submit', handleSendMessage);
    messageInput.addEventListener('input', handleTyping);
    
    // Toggle sidebar on mobile
    if (isMobile) {
        sidebarHeader.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('expanded');
        });
    }
    
    // Functions
    function handleLogin(e) {
        e.preventDefault();
        username = usernameInput.value.trim();
        
        if (!username) return;
        
        // Connect to socket server
        socket = io();
        
        // Setup socket event listeners
        setupSocketListeners();
        
        // Join the chat
        socket.emit('join', username);
        
        // Display username in chat header
        usernameDisplay.textContent = username;
        
        // Show chat interface with animation
        loginPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        
        // Auto focus message input
        setTimeout(() => {
            messageInput.focus();
        }, 500);
    }
    
    function setupSocketListeners() {
        socket.on('messages', handleRecentMessages);
        socket.on('newMessage', addMessage);
        socket.on('userList', updateUserList);
        
        socket.on('userJoined', data => {
            addSystemMessage(`${data.username} joined the chat`);
        });
        
        socket.on('userLeft', data => {
            addSystemMessage(`${data.username} left the chat`);
        });
        
        socket.on('typing', data => {
            if (data.username !== username) {
                showTypingIndicator(data.username);
            }
        });
        
        socket.on('stopTyping', data => {
            if (data.username !== username) {
                removeTypingIndicator(data.username);
            }
        });
    }
    
    function handleRecentMessages(messages) {
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            addSystemMessage('No messages yet. Be the first to say hello!');
        } else {
            messages.reverse().forEach(addMessage);
        }
        
        scrollToBottom();
    }
    
    function updateUserList(users) {
        userList.innerHTML = '';
        userCount.textContent = users.length;
        
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.name === username ? `${user.name} (You)` : user.name;
            
            if (user.name === username) {
                li.style.fontWeight = 'bold';
            }
            
            userList.appendChild(li);
        });
    }
    
    function handleSendMessage(e) {
        e.preventDefault();
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        socket.emit('sendMessage', {
            sender: username,
            content: content
        });
        
        messageInput.value = '';
        messageInput.focus();
        
        // Emit stop typing event
        socket.emit('stopTyping', { username });
        clearTimeout(typingTimeout);
        userTyping = false;
    }
    
    function handleTyping() {
        if (!userTyping) {
            userTyping = true;
            socket.emit('typing', { username });
        }
        
        // Clear existing timeout
        clearTimeout(typingTimeout);
        
        // Set new timeout
        typingTimeout = setTimeout(() => {
            userTyping = false;
            socket.emit('stopTyping', { username });
        }, 1000);
    }
    
    function addMessage(message) {
        // Remove typing indicator if it exists
        removeTypingIndicator(message.sender);
        
        const div = document.createElement('div');
        div.className = `message ${message.sender === username ? 'my-message' : 'other-message'}`;
        
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        senderDiv.textContent = message.sender === username ? 'You' : message.sender;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message.content;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = formatTime(message.createdAt || new Date());
        
        div.appendChild(senderDiv);
        div.appendChild(contentDiv);
        div.appendChild(timeDiv);
        
        messagesContainer.appendChild(div);
        scrollToBottom();
    }
    
    function addSystemMessage(content) {
        const div = document.createElement('div');
        div.className = 'system-message';
        div.textContent = content;
        
        messagesContainer.appendChild(div);
        scrollToBottom();
    }
    
    function showTypingIndicator(username) {
        // Check if typing indicator already exists
        if (document.getElementById(`typing-${username}`)) return;
        
        const div = document.createElement('div');
        div.id = `typing-${username}`;
        div.className = 'system-message';
        div.innerHTML = `<em>${username} is typing...</em>`;
        
        messagesContainer.appendChild(div);
        scrollToBottom();
    }
    
    function removeTypingIndicator(username) {
        const indicator = document.getElementById(`typing-${username}`);
        if (indicator) {
            indicator.remove();
        }
    }
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function formatTime(timeStr) {
        const date = new Date(timeStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
});