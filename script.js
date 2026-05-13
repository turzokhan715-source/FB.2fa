let recentCodes = [];
let recentVisible = false;
let mailCheckInterval = null;

// Page Navigation
function showPage(pageId) {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('2faPage').classList.add('hidden');
    document.getElementById('mailPage').classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
}

// 2FA Functions
function generate2FACode() {
    const secretKey = document.getElementById('secretKey').value.trim();
    
    if (!secretKey) {
        alert('Please enter a secret key!');
        return;
    }

    // Generate random 6-digit code (in real app, use TOTP algorithm)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Display code
    document.getElementById('generatedCode').textContent = code;
    document.getElementById('2faCodeDisplay').classList.remove('hidden');
    
    // Auto copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        showSuccessMessage('Code generated and copied to clipboard!');
    });

    // Add to recent codes
    addToRecent(code);
}

function addToRecent(code) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    recentCodes.unshift({
        code: code,
        time: timeString
    });

    // Keep only last 10 codes
    if (recentCodes.length > 10) {
        recentCodes.pop();
    }

    updateRecentList();
}

function updateRecentList() {
    const listDiv = document.getElementById('recentList');
    
    if (recentCodes.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: 
;">No codes generated yet</p>';
        return;
    }

    listDiv.innerHTML = recentCodes.map(item => `
        <div class="recent-item">
            <div class="recent-code">${item.code}</div>
            <div class="recent-time">${item.time}</div>
        </div>
    `).join('');
}

function toggleRecent() {
    recentVisible = !recentVisible;
    const listDiv = document.getElementById('recentList');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (recentVisible) {
        listDiv.classList.remove('hidden');
        toggleBtn.textContent = 'Hide';
    } else {
        listDiv.classList.add('hidden');
        toggleBtn.textContent = 'Show';
    }
}

// Mail Box Functions
function extractEmail() {
    const token = document.getElementById('tokenInput').value.trim();
    
    if (!token) {
        document.getElementById('emailDisplay').classList.add('hidden');
        document.getElementById('codeDisplay').classList.add('hidden');
        stopMailCheck();
        return;
    }

    // Extract email (first part before |)
    const parts = token.split('|');
    if (parts.length > 0 && parts[0].includes('@')) {
        const email = parts[0];
        document.getElementById('extractedEmail').textContent = email;
        document.getElementById('emailDisplay').classList.remove('hidden');
        document.getElementById('codeDisplay').classList.remove('hidden');
        
        // Start checking for code
        startMailCheck();
    }
}

function startMailCheck() {
    stopMailCheck(); // Clear any existing interval
    
    // Reset code display
    document.getElementById('verificationCode').textContent = 'Waiting... ⏳';
    document.getElementById('verificationCode').classList.add('waiting');
    document.getElementById('copyCodeBtn').disabled = true;
    document.getElementById('copyCodeBtn').style.opacity = '0.5';
    
    // Simulate checking for code (in real app, this would call an API)
    mailCheckInterval = setInterval(() => {
        // Simulate random code arrival (20% chance each check)
        if (Math.random() < 0.2) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            displayVerificationCode(code);
        }
    }, 2000);
}

function stopMailCheck() {
    if (mailCheckInterval) {
        clearInterval(mailCheckInterval);
        mailCheckInterval = null;
    }
}

function displayVerificationCode(code) {
    stopMailCheck();
    document.getElementById('verificationCode').textContent = code;
    document.getElementById('verificationCode').classList.remove('waiting');
    document.getElementById('copyCodeBtn').disabled = false;
    document.getElementById('copyCodeBtn').style.opacity = '1';
    showSuccessMessage('Verification code received!');
}

function clearMailData() {
    document.getElementById('tokenInput').value = '';
    document.getElementById('emailDisplay').classList.add('hidden');
    document.getElementById('codeDisplay').classList.add('hidden');
    stopMailCheck();
}

// Copy Functions
function copyCode(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showSuccessMessage('Copied to clipboard!');
    });
}

function copyText(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (text && text !== 'Waiting... ⏳') {
        navigator.clipboard.writeText(text).then(() => {
            showSuccessMessage('Copied to clipboard!');
        });
    }
}

function showSuccessMessage(message) {
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'success-message';
    msgDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(msgDiv, container.firstChild);

    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopMailCheck();
});
