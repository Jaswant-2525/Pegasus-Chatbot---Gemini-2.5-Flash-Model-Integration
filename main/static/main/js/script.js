// --- script.js ---

// 1. CONFIGURE MARKDOWN WITH COPY BUTTON
if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();

    // Custom Code Block Renderer
    renderer.code = function(code, language) {
        // Highlighting
        const validLang = !!(language && hljs.getLanguage(language));
        const highlighted = validLang ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
        
        // Escape code for the hidden textarea (so copy works perfectly)
        const rawCode = code.replace(/"/g, '&quot;');

        return `
        <div class="code-block-wrapper">
            <div class="code-header">
                <span>${language || 'code'}</span>
                <button class="copy-btn" onclick="copyToClipboard(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
            </div>
            <pre><code class="hljs ${language}">${highlighted}</code></pre>
            <textarea class="hidden-code" style="display:none;">${code}</textarea>
        </div>`;
    };

    marked.setOptions({
        renderer: renderer,
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
    });
}

// 2. COPY FUNCTION
function copyToClipboard(btn) {
    const wrapper = btn.closest('.code-block-wrapper');
    const code = wrapper.querySelector('.hidden-code').value;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span style="color:#4ade80">Copied!</span>`;
        
        setTimeout(() => { 
            btn.innerHTML = originalHTML; 
        }, 2000);
    });
}

// 3. DROPDOWNS & CHAT LOGIC (Standard)
let currentSessionId = null;

function toggleDropdown(id) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== id) menu.classList.remove('show');
    });
    const menu = document.getElementById(id);
    if (menu) menu.classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.matches('.plus-btn, .plus-btn *, .tools-btn, .tools-btn *, .model-trigger, .model-trigger *')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function startNewChat() {
    currentSessionId = null;
    document.getElementById('chatWindow').innerHTML = `
        <div class="welcome-msg" id="welcomeMsg">
            <h1 class="antigravity-text">Ask Intentionally!</h1>
            <p>What would you like to create today?</p>
        </div>`;
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
}

function loadChat(sessionId) {
    currentSessionId = sessionId;
    const chatWindow = document.getElementById('chatWindow');
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));

    fetch(`/api/history/${sessionId}/`)
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            chatWindow.innerHTML = ''; 
            chatWindow.style.justifyContent = 'flex-start';
            data.history.forEach(msg => {
                addMessageToUI(msg.content, msg.role);
            });
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    });
}

function sendMessage(predefinedText) {
    const userInput = document.getElementById('userInput');
    const text = predefinedText || userInput.value.trim();
    if (!text) return;

    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.style.display = 'none';
    
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.style.justifyContent = 'flex-start';

    addMessageToUI(text, 'user');
    userInput.value = '';
    
    const loadingId = 'loading-' + Date.now();
    addMessageToUI('<span class="thinking-dots">Thinking...</span>', 'ai', loadingId);

    fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ message: text, session_id: currentSessionId })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById(loadingId).remove();
        if (data.success) {
            currentSessionId = data.session_id;
            addMessageToUI(data.response, 'ai');
        } else {
            addMessageToUI("Error: " + data.error, 'ai');
        }
    })
    .catch(err => {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        addMessageToUI("Connection Error", 'ai');
    });
}

function addMessageToUI(text, sender, id=null) {
    const chatWindow = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    if(id) div.id = id;

    let avatar = sender === 'ai' 
        ? `<div class="avatar ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"></path></svg></div>` 
        : `<div class="avatar user">JR</div>`;

    let content = text;
    if (sender === 'ai' && typeof marked !== 'undefined') {
        try { content = marked.parse(text); } 
        catch (e) { console.error("Markdown error:", e); }
    } else if (sender === 'user') {
        content = text.replace(/\n/g, '<br>');
    }

    div.innerHTML = `${sender === 'ai' ? avatar : ''}<div class="msg-bubble">${content}</div>${sender === 'user' ? avatar : ''}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function clearHistory() {
    if(confirm("Are you sure you want to delete all chat history?")) {
        fetch('/api/delete_history/', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')}
        }).then(res => res.json()).then(data => {
            if(data.success) location.reload(); 
        });
    }
}

const txtArea = document.getElementById('userInput');
if(txtArea){
    txtArea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    txtArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}