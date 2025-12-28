import './App.scss';
import {THEME, TonConnectUIProvider, TonConnectButton} from "@tonconnect/ui-react";
import {Balance} from "./components/Balance/Balance";

function App() {
  return (
    <TonConnectUIProvider
      manifestUrl={import.meta.env.VITE_MANIFEST_URL}
      uiPreferences={{theme: THEME.DARK}}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/tc_twa_demo_bot/start'
      }}
    >
      <div className="app">
        <div className="app-container">
          <h1>TON Wallet</h1>
          <div className="wallet-section">
            <TonConnectButton />
            <Balance />
          </div>
        </div>
      </div>
    </TonConnectUIProvider>
  )
}

export default App
