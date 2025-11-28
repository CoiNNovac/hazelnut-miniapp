// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// App state
let walletConnected = false;
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
    const walletStatus = document.getElementById('walletStatus');
    const statusIndicator = document.getElementById('statusIndicator');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWallet');

    // Check if wallet is available
    if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
        checkWalletConnection();
    }

    connectBtn.addEventListener('click', async () => {
        try {
            await connectWallet();
        } catch (error) {
            console.error('Wallet connection error:', error);
            showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    });
}

// Check wallet connection status
async function checkWalletConnection() {
    try {
        // In a real app, you would check the actual wallet connection
        // For now, we'll simulate it
        if (tg.initDataUnsafe?.start_param) {
            walletConnected = true;
            updateWalletUI(true);
        } else {
            updateWalletUI(false);
        }
    } catch (error) {
        console.error('Error checking wallet:', error);
        updateWalletUI(false);
    }
}

// Connect to Telegram Wallet
async function connectWallet() {
    try {
        // Telegram Wallet integration
        // In production, you would use the actual Telegram Wallet API
        if (window.ton) {
            const accounts = await window.ton.request({ method: 'ton_requestAccounts' });
            if (accounts && accounts.length > 0) {
                walletConnected = true;
                updateWalletUI(true);
                showNotification('Wallet connected successfully!', 'success');
                return;
            }
        }

        // Fallback: Simulate wallet connection for demo
        walletConnected = true;
        updateWalletUI(true);
        showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Wallet connection error:', error);
        throw error;
    }
}

// Update wallet UI
function updateWalletUI(connected) {
    const statusIndicator = document.getElementById('statusIndicator');
    const walletText = document.getElementById('walletText');
    const connectBtn = document.getElementById('connectWallet');

    if (connected) {
        statusIndicator.className = 'status-indicator connected';
        walletText.textContent = 'Wallet Connected';
        connectBtn.style.display = 'none';
        walletConnected = true;
    } else {
        statusIndicator.className = 'status-indicator disconnected';
        walletText.textContent = 'Wallet Not Connected';
        connectBtn.style.display = 'block';
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
        // In production, this would interact with a smart contract
        // For now, we'll simulate the transaction
        
        const tokenPrice = 0.10;
        const tonPrice = 2.5;
        const tokens = (tonAmount * tonPrice) / tokenPrice;

        // Simulate transaction
        showNotification('Processing transaction...', 'info');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update portfolio
        userPortfolio.tokens += tokens;
        userPortfolio.totalInvested += tonAmount;
        userPortfolio.transactions.push({
            type: 'Buy',
            amount: tokens,
            tonAmount: tonAmount,
            date: new Date().toLocaleString()
        });

        // Save to localStorage (in production, this would be on a backend)
        savePortfolio();

        // Update UI
        loadPortfolio();
        document.getElementById('buyAmount').value = '';
        document.getElementById('tokenAmount').textContent = '0 HZN';

        showNotification(`Successfully purchased ${tokens.toFixed(2)} HZN!`, 'success');
    } catch (error) {
        console.error('Buy tokens error:', error);
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
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const totalProfit = userPortfolio.profits.reduce((sum, p) => sum + p.amount, 0);
    if (totalProfit <= 0) {
        showNotification('No profit available to claim', 'error');
        return;
    }

    try {
        showNotification('Processing claim...', 'info');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In production, this would transfer TON to the user's wallet
        // For now, we'll just clear the profits
        userPortfolio.profits = [];
        localStorage.setItem('hazelnut_profits', JSON.stringify([]));

        loadProfit();
        showNotification('Profit claimed successfully!', 'success');
    } catch (error) {
        console.error('Claim profit error:', error);
        showNotification('Failed to claim profit. Please try again.', 'error');
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

// Auto-check wallet connection on load
setTimeout(() => {
    checkWalletConnection();
}, 1000);

