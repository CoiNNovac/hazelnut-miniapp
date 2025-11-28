// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// TON Connect initialization
let tonConnectUI;
let walletAddress = null;
let walletConnected = false;

// Initialize TON Connect
function initTONConnect() {
    // TON Connect manifest URL
    const manifestUrl = window.location.origin + '/tonconnect-manifest.json';
    console.log('TON Connect manifest URL:', manifestUrl);
    
    // Verify manifest is accessible
    fetch(manifestUrl)
        .then(response => {
            if (!response.ok) {
                console.error('Manifest file not accessible:', response.status);
            } else {
                console.log('Manifest file is accessible');
            }
        })
        .catch(error => {
            console.error('Error checking manifest:', error);
        });
    
    // Function to initialize TON Connect when library is available
    function tryInitTONConnect() {
        console.log('Checking for TON Connect UI...', {
            TonConnectUI: typeof window.TonConnectUI,
            tonConnectUILoaded: window.tonConnectUILoaded,
            windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('ton'))
        });
        
        if (window.TonConnectUI) {
            try {
                console.log('Initializing TON Connect UI with manifest:', manifestUrl);
                // Initialize TON Connect UI
                tonConnectUI = new window.TonConnectUI({
                    manifestUrl: manifestUrl,
                    buttonRootId: 'tonconnect-button-container',
                    language: 'en',
                    actionsConfiguration: {
                        twaReturnUrl: 'https://t.me/hazelnuttokenbot'
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
                    console.error('Connection restore error:', error);
                    updateWalletUI(false);
                });

                // Listen for wallet connection changes
                tonConnectUI.onStatusChange((wallet) => {
                    console.log('Wallet status changed:', wallet);
                    if (wallet && wallet.account) {
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
                
                console.log('TON Connect UI initialized successfully');
            } catch (error) {
                console.error('TON Connect initialization error:', error);
                // Fallback to manual button
                showFallbackButton();
            }
        } else {
            // Try again after a short delay
            setTimeout(tryInitTONConnect, 100);
        }
    }
    
    // Show fallback button
    function showFallbackButton() {
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.style.display = 'block';
        connectBtn.onclick = () => {
            showNotification('TON Connect is loading. Please wait...', 'info');
            // Try to initialize again
            setTimeout(tryInitTONConnect, 500);
        };
        updateWalletUI(false);
    }
    
    // Start trying to initialize
    // Wait a bit for scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(tryInitTONConnect, 500);
        });
    } else {
        setTimeout(tryInitTONConnect, 500);
    }
    
    // Also set a timeout to show fallback if library doesn't load
    setTimeout(() => {
        if (!tonConnectUI && !window.TonConnectUI) {
            console.warn('TON Connect UI library not loaded after timeout');
            showFallbackButton();
        }
    }, 3000);
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
    initTONConnect();
    initializeWallet();
    initializeTabs();
    initializeBuySection();
    loadPortfolio();
    loadProfit();
});

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

        // Send transaction via TON Connect
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

