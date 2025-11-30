// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// TON Connect initialization (using core SDK - UI library has issues in Telegram Mini Apps)
let tonConnect;
let walletAddress = null;
let walletConnected = false;

// Initialize TON Connect using core SDK
async function initTONConnect() {
    const manifestUrl = 'https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json';
    console.log('Initializing TON Connect with manifest:', manifestUrl);
    console.log('Checking for TON Connect SDK...', {
        TonConnect: typeof window.TonConnect,
        tonConnectSDKLoaded: window.tonConnectSDKLoaded,
        allKeys: Object.keys(window).filter(k => k.toLowerCase().includes('ton'))
    });
    
    // Wait for SDK to load
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    function waitForSDK() {
        attempts++;
        
        // Check if SDK is loaded
        if (window.TonConnect) {
            console.log('TON Connect SDK found, initializing...');
            initializeTONConnect(manifestUrl);
            return;
        }
        
        // Check if we've exceeded max attempts
        if (attempts >= maxAttempts) {
            console.error('TON Connect SDK failed to load after', attempts, 'attempts');
            console.error('Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('ton')));
            showSDKError();
            return;
        }
        
        // Try again
        setTimeout(waitForSDK, 100);
    }
    
    function showSDKError() {
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.style.display = 'block';
        connectBtn.onclick = () => {
            showNotification('TON Connect SDK failed to load. Please check your internet connection and refresh.', 'error');
            // Try to reload SDK
            location.reload();
        };
        updateWalletUI(false);
        
        // Show error in UI
        const walletText = document.getElementById('walletText');
        walletText.textContent = 'SDK Loading Failed';
        walletText.style.color = '#dc3545';
    }
    
    async function initializeTONConnect(manifestUrl) {
        try {
            // Initialize TON Connect SDK
            tonConnect = new window.TonConnect({
                manifestUrl: manifestUrl
            });

            // Try to restore previous connection
            try {
                const restored = await tonConnect.restoreConnection();
                if (restored && tonConnect.wallet) {
                    walletAddress = tonConnect.wallet.account.address;
                    walletConnected = true;
                    updateWalletUI(true, walletAddress);
                    console.log('Wallet connection restored:', walletAddress);
                    return;
                }
            } catch (error) {
                console.log('No previous connection to restore');
            }

            // Set up connection button
            setupConnectButton();
            updateWalletUI(false);
            
        } catch (error) {
            console.error('TON Connect initialization error:', error);
            showNotification('Failed to initialize wallet connection', 'error');
            updateWalletUI(false);
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
    
    // Start initialization - wait a bit for script to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(waitForSDK, 1000); // Give SDK more time to load
        });
    } else {
        setTimeout(waitForSDK, 1000);
    }
}

// Connect wallet function
async function connectWallet() {
    if (!tonConnect) {
        showNotification('Wallet SDK not ready. Please wait...', 'error');
        return;
    }

    try {
        showNotification('Loading available wallets...', 'info');
        
        // Get available wallets
        const walletsList = await tonConnect.getWallets();
        console.log('Available wallets:', walletsList);
        
        if (!walletsList || walletsList.length === 0) {
            showNotification('No wallets available. Please install Telegram Wallet.', 'error');
            return;
        }

        // Find Telegram Wallet (usually first or has 'telegram' in name)
        let telegramWallet = walletsList.find(w => 
            w.name.toLowerCase().includes('telegram') || 
            w.appName.toLowerCase().includes('telegram')
        );
        
        // If not found, use first wallet (usually Telegram Wallet)
        if (!telegramWallet && walletsList.length > 0) {
            telegramWallet = walletsList[0];
        }

        if (telegramWallet) {
            console.log('Connecting to wallet:', telegramWallet.name);
            showNotification(`Connecting to ${telegramWallet.name}...`, 'info');
            
            // Connect to wallet
            await tonConnect.connect({ jsBridgeKey: telegramWallet.jsBridgeKey });
            
            // Wait for connection
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
        } else {
            // Show wallet selection
            showWalletSelection(walletsList);
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet: ' + (error.message || 'Unknown error'), 'error');
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

// Update wallet UI
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
        if (!tonConnect || !walletConnected || !walletAddress) {
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
        const result = await tonConnect.sendTransaction(transaction);

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
    if (!tonConnect || !walletConnected || !walletAddress) {
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

        const result = await tonConnect.sendTransaction(transaction);

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

