document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = createTypingIndicator();

    // Create typing indicator element
    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        indicator.style.display = 'none';
        chatContainer.appendChild(indicator);
        return indicator;
    }

    // Add message with icon and styling
    function addMessage(message, type = 'bot') {
        const messageElement = document.createElement('div');
        messageElement.classList.add(
            type === 'user' ? 'user-message' : 'bot-message', 
            'rounded-lg',
            'p-4',
            'relative',
            'max-w-[85%]',
            'clear-both'
        );

        // Add message icon
        const iconElement = document.createElement('div');
        iconElement.classList.add('message-icon');
        messageElement.appendChild(iconElement);

        // Add message text
        const textElement = document.createElement('div');
        textElement.textContent = message;
        messageElement.appendChild(textElement);

        // Handle error messages
        if (type === 'error') {
            messageElement.classList.add('js-error');
        }

        chatContainer.appendChild(messageElement);
        
        // Auto scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Send message function with enhanced error handling
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) {
            userInput.classList.add('border-red-500');
            setTimeout(() => userInput.classList.remove('border-red-500'), 1000);
            return;
        }

        // Disable input and send button during request
        userInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Show typing indicator
        typingIndicator.style.display = 'flex';

        // Add user message
        addMessage(message, 'user');
        userInput.value = '';

        // Send to backend
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Hide typing indicator
            typingIndicator.style.display = 'none';

            // Add bot response
            addMessage(data.response || 'Sorry, I couldn\'t process that message.');
        })
        .catch(error => {
            // Hide typing indicator
            typingIndicator.style.display = 'none';

            // Add error message
            addMessage('Error processing your request. Please try again.', 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            // Re-enable input and send button
            userInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            userInput.focus();
        });
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default enter key behavior
            sendMessage();
        }
    });

    // Add placeholder and focus effects
    userInput.addEventListener('focus', () => {
        userInput.classList.add('border-blue-500');
    });

    userInput.addEventListener('blur', () => {
        userInput.classList.remove('border-blue-500');
    });

    // Optional: Add welcome message
    addMessage('Hello! I\'m your weather assistant. How can I help you today?');
});