# TON Connect Fix Guide

## Current Issue
TON Connect UI library is not loading/initializing properly in Telegram Mini App.

## Solution Steps

### 1. Verify Manifest File
✅ Manifest is accessible at: https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json

### 2. Updated Code
- Changed to load TON Connect SDK and UI from unpkg CDN
- Simplified initialization logic
- Added better error handling

### 3. Test Checklist

After deploying, check:
1. Open browser console (if possible in Telegram)
2. Look for "TON Connect UI initialized successfully" message
3. Check for any error messages
4. Verify manifest loads: `fetch('https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json').then(r => r.json()).then(console.log)`

### 4. Alternative: Use Core SDK

If UI library still doesn't work, we can use core SDK:

```javascript
import { TonConnect } from '@tonconnect/sdk';

const tonConnect = new TonConnect({
    manifestUrl: 'https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json'
});

// Connect wallet
const walletsList = await tonConnect.getWallets();
const wallet = walletsList[0]; // Telegram Wallet
await tonConnect.connect(wallet);
```

### 5. Debug Steps

1. Check if scripts load:
   - Open Network tab
   - Look for `tonconnect-ui.min.js` and `tonconnect-sdk.min.js`
   - Check if they return 200 status

2. Check console for:
   - "TON Connect UI loaded"
   - Any CORS errors
   - Any script loading errors

3. Test manifest:
   ```bash
   curl https://coinnovac.github.io/hazelnut-miniapp/tonconnect-manifest.json
   ```

## Next Steps

1. Deploy updated code
2. Test in Telegram
3. Check console for errors
4. If still not working, we'll switch to core SDK approach


