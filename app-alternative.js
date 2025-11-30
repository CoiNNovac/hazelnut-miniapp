// Alternative implementation using core TON Connect SDK
// Use this if the UI library doesn't work

// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let tonConnect;
let walletAddress = null;
let walletConnected = false;

// Initialize TON Connect (Core SDK)
async function initTONConnectCore() {
    if (!window.TonConnect) {
        console.error('TON Connect SDK not loaded');
        showFallbackButton();
        return;
    }

    try {
        const manifestUrl = 'https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json';
        
        tonConnect = new window.TonConnect({
            manifestUrl: manifestUrl
        });

        // Restore connection if exists
        const restored = await tonConnect.restoreConnection();
        if (restored && tonConnect.wallet) {
            walletAddress = tonConnect.wallet.account.address;
            walletConnected = true;
            updateWalletUI(true, walletAddress);
        } else {
            updateWalletUI(false);
        }

        // Listen for wallet changes
        tonConnect.onStatusChange((wallet) => {
            if (wallet) {
                walletAddress = wallet.account.address;
                walletConnected = true;
                updateWalletUI(true, walletAddress);
                showNotification('Wallet connected successfully!', 'success');
            } else {
                walletAddress = null;
                walletConnected = false;
                updateWalletUI(false);
            }
        });

    } catch (error) {
        console.error('TON Connect initialization error:', error);
        showFallbackButton();
    }
}

// Connect wallet manually
async function connectWalletManual() {
    if (!tonConnect) {
        await initTONConnectCore();
    }

    try {
        // Get available wallets
        const walletsList = await tonConnect.getWallets();
        
        // Find Telegram Wallet
        const telegramWallet = walletsList.find(w => 
            w.name.toLowerCase().includes('telegram') || 
            w.name.toLowerCase().includes('ton')
        );

        if (telegramWallet) {
            // Connect to Telegram Wallet
            await tonConnect.connect(telegramWallet);
        } else {
            // Show wallet selection
            showWalletSelection(walletsList);
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Show wallet selection modal
function showWalletSelection(wallets) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 12px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    content.innerHTML = `
        <h2>Select Wallet</h2>
        <div id="wallets-list"></div>
        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
        </button>
    `;
    
    const walletsList = document.createElement('div');
    wallets.forEach(wallet => {
        const walletBtn = document.createElement('button');
        walletBtn.textContent = wallet.name;
        walletBtn.style.cssText = `
            display: block;
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
        `;
        walletBtn.onclick = async () => {
            try {
                await tonConnect.connect(wallet);
                modal.remove();
            } catch (error) {
                showNotification('Connection failed: ' + error.message, 'error');
            }
        };
        walletsList.appendChild(walletBtn);
    });
    
    content.querySelector('#wallets-list').appendChild(walletsList);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Show fallback button
function showFallbackButton() {
    const connectBtn = document.getElementById('connectWallet');
    connectBtn.style.display = 'block';
    connectBtn.onclick = connectWalletManual;
    updateWalletUI(false);
}

// Update wallet UI (same as main app.js)
function updateWalletUI(connected, address = null) {
    const statusIndicator = document.getElementById('statusIndicator');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWallet');
    const walletAddressDiv = document.getElementById('walletAddress');

    if (connected && address) {
        statusIndicator.className = 'status-indicator connected';
        walletText.textContent = 'Wallet Connected';
        connectBtn.style.display = 'none';
        walletAddressDiv.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
        walletAddressDiv.style.display = 'block';
        walletConnected = true;
    } else {
        statusIndicator.className = 'status-indicator disconnected';
        walletText.textContent = 'Wallet Not Connected';
        connectBtn.style.display = 'block';
        walletAddressDiv.style.display = 'none';
        walletConnected = false;
    }
}

// Show notification (same as main app.js)
function showNotification(message, type = 'info') {
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initTONConnectCore, 500);
    });
} else {
    setTimeout(initTONConnectCore, 500);
}


