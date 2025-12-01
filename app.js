// Telegram Web App initialization (Blum-style)
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// TON Connect UI (Blum-style approach)
let tonConnectUI = null;
let walletAddress = null;
let walletConnected = false;

// Initialize TON Connect UI (adapted from ChatGPT suggestion)
function initTONConnect() {
    console.log('Initializing TON Connect UI (Blum-style)...');
    
    // Wait for TonConnectUI to be available
    function waitForTonConnectUI() {
        if (window.TonConnectUI) {
            initializeTonConnectUI();
        } else {
            setTimeout(waitForTonConnectUI, 100);
        }
    }
    
    function initializeTonConnectUI() {
        try {
            const manifestUrl = 'https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json';
            
            console.log('Creating TonConnectUI instance...');
            
            // Initialize TON Connect UI (Blum-style)
            tonConnectUI = new window.TonConnectUI({
                manifestUrl: manifestUrl,
                buttonRootId: 'ton-connect-button',
                language: 'en',
                actionsConfiguration: {
                    twaReturnUrl: 'https://t.me/hazelnuttokenbot'
                }
            });
            
            console.log('TON Connect UI initialized');
            
            // Listen for wallet status changes (Blum-style)
            tonConnectUI.onStatusChange((walletInfo) => {
                console.log('Wallet status changed:', walletInfo);
                
                if (walletInfo && walletInfo.account) {
                    walletAddress = walletInfo.account.address;
                    walletConnected = true;
                    updateWalletUI(true, walletAddress);
                    showNotification('Wallet connected successfully!', 'success');
                } else {
                    walletAddress = null;
                    walletConnected = false;
                    updateWalletUI(false);
                }
            });
            
            // Check if already connected
            tonConnectUI.connectionRestored.then((restored) => {
                console.log('Connection restored:', restored);
                if (restored && tonConnectUI.account) {
                    walletAddress = tonConnectUI.account.address;
                    walletConnected = true;
                    updateWalletUI(true, walletAddress);
                } else {
                    updateWalletUI(false);
                }
            }).catch((error) => {
                console.log('No previous connection:', error);
                updateWalletUI(false);
            });
            
        } catch (error) {
            console.error('TON Connect UI initialization error:', error);
            showSDKError('Failed to initialize wallet connection');
        }
    }
    
    // Start waiting for library
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(waitForTonConnectUI, 500);
        });
    } else {
        setTimeout(waitForTonConnectUI, 500);
    }
    
    // Timeout fallback
    setTimeout(() => {
        if (!tonConnectUI && !window.TonConnectUI) {
            console.error('TON Connect UI not loaded after timeout');
            showSDKError('Wallet service unavailable. Please refresh the page.');
        }
    }, 5000);
}

// Show SDK error
function showSDKError(message) {
    const connectBtn = document.getElementById('connectWallet');
    connectBtn.style.display = 'block';
    connectBtn.onclick = () => {
        showNotification(message, 'error');
    };
    updateWalletUI(false);
}

// Wait for SDK to load (legacy function - keeping for compatibility)
async function waitForSDK() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        function check() {
            attempts++;
            
            if (window.TonConnect) {
                console.log('TON Connect SDK loaded successfully');
                resolve(true);
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('TON Connect SDK failed to load after', attempts, 'attempts');
                resolve(false);
                return;
            }
            
            setTimeout(check, 100);
        }
        
        check();
    });
}

// Show SDK error to user
function showSDKError(message) {
    const connectBtn = document.getElementById('connectWallet');
    const walletText = document.getElementById('walletText');
    
    if (!connectBtn || !walletText) return;
    
    connectBtn.style.display = 'block';
    connectBtn.textContent = 'Retry Connection';
    connectBtn.onclick = () => {
        connectBtn.textContent = 'Connecting...';
        connectBtn.disabled = true;
        setTimeout(() => {
            location.reload();
        }, 1000);
    };
    
    walletText.textContent = message || 'Connection failed';
    walletText.style.color = '#FF3B30';
    updateWalletUI(false);
}
    
    // Restore existing connection if available
    async function restoreConnection() {
        try {
            const restored = await tonConnect.restoreConnection();
            if (restored && tonConnect.wallet) {
                walletAddress = tonConnect.wallet.account.address;
                walletConnected = true;
                reconnectAttempts = 0;
                updateWalletUI(true, walletAddress);
                console.log('Wallet connection restored:', walletAddress);
                
                // Set up connection status listener
                setupConnectionListeners();
                return true;
            }
            return false;
        } catch (error) {
            console.log('No previous connection to restore:', error);
            return false;
        }
    }
    
    // Setup connect button
    function setupConnectButton() {
        const connectBtn = document.getElementById('connectWallet');
        const container = document.getElementById('tonconnect-button-container');
        
        // Hide TON Connect UI container (we're using our own button)
        if (container) container.style.display = 'none';
        
        // Show our connect button
        connectBtn.style.display = 'block';
        connectBtn.onclick = connectWallet;
    }
    
    // Set up connection listeners
    function setupConnectionListeners() {
        if (!tonConnect) return;
        
        // Handle connection status changes
        tonConnect.onStatusChange((wallet) => {
            if (wallet) {
                walletAddress = wallet.account.address;
                walletConnected = true;
                reconnectAttempts = 0;
                updateWalletUI(true, walletAddress);
                showNotification('Wallet connected successfully!', 'success');
            } else {
                handleDisconnect();
            }
        });
        
        // Handle connection errors
        tonConnect.onError((error) => {
            console.error('TON Connect error:', error);
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                setTimeout(() => restoreConnection(), 1000 * reconnectAttempts);
            } else {
                handleDisconnect('Connection lost. Please reconnect your wallet.');
            }
        });
    }
    
    // Handle wallet disconnection
    function handleDisconnect(message) {
        walletAddress = null;
        walletConnected = false;
        updateWalletUI(false, message || 'Disconnected from wallet');
        
        // Show reconnect button
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.style.display = 'block';
            connectBtn.textContent = 'Reconnect Wallet';
            connectBtn.onclick = connectWallet;
        }
    }
}

// Connect wallet function with Blum-style behavior
async function connectWallet() {
    if (!tonConnect) {
        showNotification('Wallet service not ready. Please try again.', 'error');
        return;
    }

    try {
        // Show loading state
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
        }
        
        // Get available wallets
        const walletsList = await tonConnect.getWallets();
        console.log('Available wallets:', walletsList);
        
        if (!walletsList || walletsList.length === 0) {
            throw new Error('No wallets available. Please install Telegram Wallet.');
        }

        // Prefer Telegram Wallet if available
        let targetWallet = walletsList.find(w => 
            w.name.toLowerCase().includes('telegram') || 
            w.appName.toLowerCase().includes('telegram')
        ) || walletsList[0];

        console.log('Connecting to wallet:', targetWallet.name);
        
        // Use the built-in connect method which shows the wallet selection UI
        await tonConnect.connect({
            jsBridgeKey: targetWallet.jsBridgeKey,
            // These options make it behave more like Blum
            showSelectedWallet: true,
            showWalletModal: true,
            disableAutoConnect: false
        });
        
        // Connection status will be handled by the status change listener
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        
        // Reset button state
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.disabled = false;
        }
        
        // Show appropriate error message
        let errorMessage = 'Failed to connect wallet';
        if (error.message.includes('User rejected') || error.message.includes('cancelled')) {
            errorMessage = 'Connection cancelled';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Connection timed out. Please try again.';
        } else if (error.message.includes('No wallets available')) {
            errorMessage = 'No wallet found. Please install Telegram Wallet.';
        }
        
        showNotification(errorMessage, 'error');
        updateWalletUI(false, errorMessage);
    }
}

// Show wallet selection modal
function showWalletSelection(wallets) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'wallet-selection-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 16px;
        max-width: 400px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    content.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #333;">Select Wallet</h2>
        <div id="wallets-list" style="margin-bottom: 20px;"></div>
        <button id="cancel-wallet-btn" style="width: 100%; padding: 12px; background: #f8f9fa; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Cancel
        </button>
    `;
    
    const walletsList = document.getElementById('wallets-list');
    wallets.forEach(wallet => {
        const walletBtn = document.createElement('button');
        walletBtn.style.cssText = `
            display: flex;
            align-items: center;
            width: 100%;
            padding: 16px;
            margin: 8px 0;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            cursor: pointer;
            text-align: left;
            font-size: 16px;
            transition: all 0.2s;
        `;
        walletBtn.onmouseover = () => {
            walletBtn.style.background = '#e9ecef';
            walletBtn.style.borderColor = '#667eea';
        };
        walletBtn.onmouseout = () => {
            walletBtn.style.background = '#f8f9fa';
            walletBtn.style.borderColor = '#e0e0e0';
        };
        
        walletBtn.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${wallet.name}</div>
                ${wallet.about ? `<div style="font-size: 12px; color: #666;">${wallet.about}</div>` : ''}
            </div>
        `;
        
        walletBtn.onclick = async () => {
            try {
                showNotification(`Connecting to ${wallet.name}...`, 'info');
                await tonConnect.connect({ jsBridgeKey: wallet.jsBridgeKey });
                modal.remove();
            } catch (error) {
                console.error('Connection error:', error);
                showNotification('Connection failed: ' + (error.message || 'Unknown error'), 'error');
            }
        };
        
        walletsList.appendChild(walletBtn);
    });
    
    content.querySelector('#cancel-wallet-btn').onclick = () => {
        modal.remove();
    };
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// App state
let userData = null;
let userPortfolio = {
    tokens: 0,
    totalInvested: 0,
    transactions: [],
    profits: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeUser();
    initializeVersion();
    initTONConnect();
    initializeWallet();
    initializeTabs();
    initializeBuySection();
    loadPortfolio();
    loadProfit();
});

// Initialize version display
function initializeVersion() {
    if (window.APP_VERSION) {
        document.getElementById('appVersion').textContent = window.APP_VERSION;
    }
    if (window.BUILD_DATE) {
        document.getElementById('buildDate').textContent = window.BUILD_DATE;
    }
}

// Initialize user data from Telegram
function initializeUser() {
    userData = tg.initDataUnsafe?.user;
    if (userData) {
        const username = userData.username || `${userData.first_name} ${userData.last_name || ''}`.trim() || 'User';
        document.getElementById('username').textContent = `@${username}`;
    } else {
        document.getElementById('username').textContent = 'Telegram User';
    }
}

// Initialize Telegram Wallet
function initializeWallet() {
    // TON Connect UI handles the connection button automatically
    // This function is kept for any additional initialization
}

// Update wallet UI with Blum-style design
function updateWalletUI(connected, statusText = '') {
    const statusIndicator = document.getElementById('statusIndicator');
    const walletText = document.getElementById('walletText');
    const walletAddress = document.getElementById('walletAddress');
    const connectBtn = document.getElementById('connectWallet');
    
    if (!statusIndicator || !walletText) return;
    
    if (connected) {
        // Connected state
        statusIndicator.className = 'status-indicator connected';
        walletText.textContent = 'Connected';
        walletText.style.color = '#34C759';
        
        if (walletAddress && walletAddress) {
            const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
            walletAddress.textContent = shortAddress;
            walletAddress.style.display = 'inline-block';
            walletAddress.title = walletAddress; // Show full address on hover
            walletAddress.style.marginLeft = '8px';
            walletAddress.style.fontSize = '14px';
            walletAddress.style.color = '#8E8E93';
        }
        
        if (connectBtn) {
            connectBtn.textContent = 'Disconnect';
            connectBtn.onclick = () => {
                if (tonConnect) {
                    tonConnect.disconnect();
                }
                updateWalletUI(false, 'Disconnected');
            };
        }
    } else {
        // Disconnected state
        statusIndicator.className = 'status-indicator';
        walletText.textContent = statusText || 'Not Connected';
        walletText.style.color = statusText && statusText.includes('fail') ? '#FF3B30' : '#8E8E93';
        
        if (walletAddress) {
            walletAddress.textContent = '';
            walletAddress.style.display = 'none';
        }
        
        if (connectBtn) {
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.onclick = connectWallet;
            connectBtn.style.display = 'block';
            connectBtn.disabled = false;
        }
    }
    
    // Update any UI elements that depend on wallet connection
    const walletDependentElements = document.querySelectorAll('.wallet-dependent');
    walletDependentElements.forEach(el => {
        el.style.opacity = connected ? '1' : '0.5';
        el.style.pointerEvents = connected ? 'auto' : 'none';
    });
    
    // Update theme if needed
    setupTheme();
}

// Initialize tab switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Initialize buy section
function initializeBuySection() {
    const buyAmountInput = document.getElementById('buyAmount');
    const tokenAmountOutput = document.getElementById('tokenAmount');
    const buyBtn = document.getElementById('buyBtn');

    // Calculate tokens based on TON amount
    buyAmountInput.addEventListener('input', (e) => {
        const tonAmount = parseFloat(e.target.value) || 0;
        const tokenPrice = 0.10; // $0.10 per token
        const tonPrice = 2.5; // Assuming 1 TON = $2.5
        const tokens = (tonAmount * tonPrice) / tokenPrice;
        tokenAmountOutput.textContent = `${tokens.toFixed(2)} HZN`;
    });

    // Buy tokens
    buyBtn.addEventListener('click', async () => {
        const amount = parseFloat(buyAmountInput.value);
        
        if (!walletConnected) {
            showNotification('Please connect your wallet first', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }

        try {
            await buyTokens(amount);
        } catch (error) {
            console.error('Buy error:', error);
            showNotification('Transaction failed. Please try again.', 'error');
        }
    });
}

// Buy tokens function
async function buyTokens(tonAmount) {
    try {
        if (!tonConnectUI || !walletConnected || !walletAddress) {
            throw new Error('Wallet not connected');
        }

        const tokenPrice = 0.10;
        const tonPrice = 2.5;
        const tokens = (tonAmount * tonPrice) / tokenPrice;

        // Convert TON to nanoTON (1 TON = 1,000,000,000 nanoTON)
        const nanoTON = BigInt(Math.floor(tonAmount * 1000000000));

        // Create transaction request
        // NOTE: Replace with your actual smart contract address
        const contractAddress = 'YOUR_SMART_CONTRACT_ADDRESS_HERE';
        
        const transaction = {
            messages: [
                {
                    address: contractAddress, // Your smart contract address
                    amount: nanoTON.toString(),
                    payload: null // Add payload if needed for your contract
                }
            ],
            validUntil: Math.floor(Date.now() / 1000) + 300 // 5 minutes
        };

        showNotification('Please confirm the transaction in your wallet...', 'info');

        // Send transaction via TON Connect SDK
        const result = await tonConnectUI.sendTransaction(transaction);

        if (result) {
            // Transaction sent successfully
            showNotification('Transaction sent! Waiting for confirmation...', 'info');

            // In production, you would wait for blockchain confirmation
            // For now, we'll simulate success after a delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update portfolio
            userPortfolio.tokens += tokens;
            userPortfolio.totalInvested += tonAmount;
            userPortfolio.transactions.push({
                type: 'Buy',
                amount: tokens,
                tonAmount: tonAmount,
                date: new Date().toLocaleString(),
                txHash: result.boc // Transaction hash
            });

            // Save to localStorage (in production, this would be on a backend)
            savePortfolio();

            // Update UI
            loadPortfolio();
            document.getElementById('buyAmount').value = '';
            document.getElementById('tokenAmount').textContent = '0 HZN';

            showNotification(`Successfully purchased ${tokens.toFixed(2)} HZN!`, 'success');
        }
    } catch (error) {
        console.error('Buy tokens error:', error);
        if (error.message.includes('User rejected')) {
            showNotification('Transaction cancelled by user', 'error');
        } else {
            showNotification('Transaction failed. Please try again.', 'error');
        }
        throw error;
    }
}

// Load portfolio
function loadPortfolio() {
    // Load from localStorage (in production, this would be from a backend)
    const saved = localStorage.getItem('hazelnut_portfolio');
    if (saved) {
        userPortfolio = { ...userPortfolio, ...JSON.parse(saved) };
    }

    // Update UI
    document.getElementById('totalTokens').textContent = `${userPortfolio.tokens.toFixed(2)} HZN`;
    
    const tokenPrice = 0.10;
    const tonPrice = 2.5;
    const totalValue = (userPortfolio.tokens * tokenPrice) / tonPrice;
    document.getElementById('totalValue').textContent = `${totalValue.toFixed(4)} TON`;

    const avgPrice = userPortfolio.tokens > 0 
        ? (userPortfolio.totalInvested / userPortfolio.tokens).toFixed(4)
        : '-';
    document.getElementById('avgPrice').textContent = avgPrice !== '-' ? `${avgPrice} TON` : '-';

    // Update transaction list
    const transactionList = document.getElementById('transactionList');
    if (userPortfolio.transactions.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">No transactions yet</p>';
    } else {
        transactionList.innerHTML = userPortfolio.transactions
            .slice()
            .reverse()
            .map(tx => `
                <div class="transaction-item">
                    <div>
                        <div class="transaction-type">${tx.type}</div>
                        <div class="transaction-date">${tx.date}</div>
                    </div>
                    <div class="transaction-amount">+${tx.amount.toFixed(2)} HZN</div>
                </div>
            `)
            .join('');
    }
}

// Load profit
function loadProfit() {
    // Load profit data (in production, this would be from a backend)
    const saved = localStorage.getItem('hazelnut_profits');
    if (saved) {
        userPortfolio.profits = JSON.parse(saved);
    }

    // Calculate total profit
    const totalProfit = userPortfolio.profits.reduce((sum, p) => sum + p.amount, 0);
    const profitPercentage = userPortfolio.totalInvested > 0 
        ? ((totalProfit / userPortfolio.totalInvested) * 100).toFixed(2)
        : 0;

    document.getElementById('totalProfit').textContent = `${totalProfit.toFixed(4)} TON`;
    document.getElementById('totalProfit').className = `profit-value ${totalProfit < 0 ? 'negative' : ''}`;
    
    document.getElementById('profitPercentage').textContent = `${profitPercentage}%`;
    document.getElementById('profitPercentage').className = `profit-value ${profitPercentage < 0 ? 'negative' : ''}`;

    const lastProfit = userPortfolio.profits.length > 0 
        ? userPortfolio.profits[userPortfolio.profits.length - 1].date
        : '-';
    document.getElementById('lastDistribution').textContent = lastProfit;

    // Update profit history
    const profitHistoryList = document.getElementById('profitHistoryList');
    if (userPortfolio.profits.length === 0) {
        profitHistoryList.innerHTML = '<p class="empty-state">No profit distributions yet</p>';
    } else {
        profitHistoryList.innerHTML = userPortfolio.profits
            .slice()
            .reverse()
            .map(profit => `
                <div class="profit-item-history">
                    <div>
                        <div class="transaction-type">Profit Distribution</div>
                        <div class="transaction-date">${profit.date}</div>
                    </div>
                    <div class="transaction-amount" style="color: #28a745;">+${profit.amount.toFixed(4)} TON</div>
                </div>
            `)
            .join('');
    }

    // Show claim button if there's profit to claim
    const claimBtn = document.getElementById('claimProfitBtn');
    if (totalProfit > 0) {
        claimBtn.style.display = 'block';
        claimBtn.onclick = claimProfit;
    } else {
        claimBtn.style.display = 'none';
    }
}

// Claim profit
async function claimProfit() {
    if (!tonConnectUI || !walletConnected || !walletAddress) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const totalProfit = userPortfolio.profits.reduce((sum, p) => sum + p.amount, 0);
    if (totalProfit <= 0) {
        showNotification('No profit available to claim', 'error');
        return;
    }

    try {
        // Convert profit to nanoTON
        const nanoTON = BigInt(Math.floor(totalProfit * 1000000000));

        // In production, this would call your smart contract's claim function
        // For now, we'll simulate receiving TON from the contract
        // NOTE: Replace with your actual profit distribution contract address
        const profitContractAddress = 'YOUR_PROFIT_CONTRACT_ADDRESS_HERE';

        showNotification('Processing claim...', 'info');

        // In production, you would call a smart contract method to claim
        // This is a placeholder - actual implementation depends on your contract
        const transaction = {
            messages: [
                {
                    address: profitContractAddress,
                    amount: '0', // No TON sent, just calling contract method
                    payload: null // Add payload with claim method call
                }
            ],
            validUntil: Math.floor(Date.now() / 1000) + 300
        };

        const result = await tonConnectUI.sendTransaction(transaction);

        if (result) {
            // Clear profits after successful claim
            userPortfolio.profits = [];
            localStorage.setItem('hazelnut_profits', JSON.stringify([]));

            loadProfit();
            showNotification('Profit claimed successfully!', 'success');
        }
    } catch (error) {
        console.error('Claim profit error:', error);
        if (error.message.includes('User rejected')) {
            showNotification('Transaction cancelled by user', 'error');
        } else {
            showNotification('Failed to claim profit. Please try again.', 'error');
        }
    }
}

// Save portfolio to localStorage
function savePortfolio() {
    localStorage.setItem('hazelnut_portfolio', JSON.stringify({
        tokens: userPortfolio.tokens,
        totalInvested: userPortfolio.totalInvested,
        transactions: userPortfolio.transactions
    }));
}

// Show notification
function showNotification(message, type = 'info') {
    // Use Telegram's built-in notification
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Simulate profit distribution (for demo purposes)
// In production, this would be triggered by backend events
function simulateProfitDistribution() {
    if (userPortfolio.tokens > 0) {
        const profit = userPortfolio.tokens * 0.01; // 1% profit per distribution
        userPortfolio.profits.push({
            amount: profit,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('hazelnut_profits', JSON.stringify(userPortfolio.profits));
        loadProfit();
    }
}

// TON Connect is initialized automatically via initTONConnect()

