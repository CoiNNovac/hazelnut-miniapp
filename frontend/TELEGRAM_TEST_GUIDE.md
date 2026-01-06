# Testing TON Connect in Telegram Mini App

## Quick Start (5 minutes)

### Step 1: Get Public HTTPS URL

Choose one method:

#### Option A: Cloudflare Tunnel (Easiest, No Account)
```bash
npx cloudflared tunnel --url http://localhost:3000
```
Copy the HTTPS URL (e.g., `https://abc-def-123.trycloudflare.com`)

#### Option B: ngrok (More Stable)
```bash
# Install
brew install ngrok

# Run
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.app`)

### Step 2: Update Manifest

1. Open `public/tonconnect-manifest.json`
2. Replace `https://your-domain.com` with your public URL
3. Save the file
4. Restart `npm run dev` if needed

Example:
```json
{
  "url": "https://abc-def-123.trycloudflare.com",
  "name": "CoinNovac",
  "iconUrl": "https://abc-def-123.trycloudflare.com/vite.svg",
  "termsOfUseUrl": "https://abc-def-123.trycloudflare.com",
  "privacyPolicyUrl": "https://abc-def-123.trycloudflare.com"
}
```

### Step 3: Create Telegram Bot

1. Open Telegram
2. Message [@BotFather](https://t.me/BotFather)
3. Send `/newbot`
4. Follow prompts:
   - Bot name: `CoinNovac`
   - Bot username: `coinnovac_bot` (or any available name)
5. Save your bot token

### Step 4: Configure Web App

Message BotFather:
```
/mybots
→ Select your bot
→ Bot Settings
→ Menu Button
→ Configure Menu Button
→ Send your HTTPS URL
```

### Step 5: Test in Telegram

1. Find your bot in Telegram search
2. Start the bot: `/start`
3. Click the Menu button (bottom left)
4. Your Mini App should open!
5. Click "Connect Wallet" to test TON Connect

## Testing TON Wallet Connection

### Install TON Wallet

**Tonkeeper** (Recommended):
1. Install Tonkeeper from App Store/Google Play
2. Create or import wallet
3. Fund with test TON (use testnet faucet)

**Telegram Wallet**:
1. Already built into Telegram
2. Search @wallet in Telegram
3. Create wallet

### Test the Connection

1. Open your Mini App in Telegram
2. Click "Connect Wallet"
3. Choose Tonkeeper or Telegram Wallet
4. Approve connection
5. Your wallet address should appear in the app

## Debugging

### Manifest not found
- Make sure your manifest URL is accessible: `YOUR_URL/tonconnect-manifest.json`
- Check CORS settings (should be disabled for Telegram)

### Connection fails
- Verify manifest URL matches your public URL exactly
- Check browser console for errors
- Ensure you're using HTTPS (not HTTP)

### App doesn't load in Telegram
- Verify URL is HTTPS
- Check if ngrok/cloudflare tunnel is still running
- Try refreshing the Mini App

## Environment Variables

Create `.env.local`:
```env
VITE_TON_CONNECT_MANIFEST_URL=https://your-public-url.com/tonconnect-manifest.json
VITE_TMA_BOT_NAME=your_bot_username
```

## Production Deployment

For production, deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- Your own server

Update manifest with production URLs before deploying.

## Useful Links

- [TON Connect Docs](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Tonkeeper Wallet](https://tonkeeper.com/)
- [TON Testnet Faucet](https://faucet.ton.org/)
