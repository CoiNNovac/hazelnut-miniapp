# Phase 1: Provider Setup

## Overview
- **Date:** 2026-01-03
- **Priority:** P1
- **Status:** pending
- **Effort:** 45 minutes

## Context
- **Related files:**
  - `/frontend/src/App.tsx` - Main app component
  - `/frontend/public/tonconnect-manifest.json` - Connection manifest
  - `/frontend/src/main.tsx` - App entry point

## Key Insights

1. **TonConnectUIProvider must wrap entire app** - Provider handles all wallet connection state
2. **Manifest URL must be absolute** - Use window.location.origin for dynamic URL
3. **SDK handles persistence automatically** - No need for custom localStorage logic
4. **Provider config is immutable** - Set all options during initialization

## Requirements

- [ ] Wrap App component with TonConnectUIProvider
- [ ] Configure manifest URL dynamically
- [ ] Set wallet list preferences
- [ ] Add error boundary for provider failures
- [ ] Verify manifest accessibility

## Architecture Decisions

- **Provider placement:** Wrap at App.tsx level (not main.tsx) for better control
- **Manifest URL:** Use environment variable with fallback to window.location
- **Wallet preferences:** Start with all wallets, filter later if needed
- **Error handling:** Use React Error Boundary pattern

## Implementation Steps

### Step 1: Import TonConnect Provider

```typescript
// App.tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';
```

### Step 2: Configure Provider

```typescript
// App.tsx
const manifestUrl = import.meta.env.VITE_TON_CONNECT_MANIFEST_URL ||
                   `${window.location.origin}/tonconnect-manifest.json`;

function App() {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: window.location.href
      }}
      walletsListConfiguration={{
        includeWallets: 'all'
      }}
    >
      <AuthProvider>
        {/* existing app content */}
      </AuthProvider>
    </TonConnectUIProvider>
  );
}
```

### Step 3: Add Error Boundary

```typescript
// src/components/TonConnectErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class TonConnectErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TON Connect Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ton-connect-error">
          <h2>Wallet Connection Error</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 4: Verify Manifest

```typescript
// src/utils/verifyManifest.ts
export async function verifyManifest(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const manifest = await response.json();
    const required = ['url', 'name', 'iconUrl'];

    return required.every(field => field in manifest);
  } catch (error) {
    console.error('Manifest verification failed:', error);
    return false;
  }
}
```

### Step 5: Environment Variables

```bash
# .env.local
VITE_TON_CONNECT_MANIFEST_URL=https://yourdomain.com/tonconnect-manifest.json
```

## Todo List

- [ ] Import TonConnectUIProvider in App.tsx
- [ ] Wrap app with provider component
- [ ] Configure manifest URL dynamically
- [ ] Create error boundary component
- [ ] Add manifest verification utility
- [ ] Test provider initialization
- [ ] Verify console has no errors

## Success Criteria

✅ Provider loads without errors
✅ Manifest URL resolves correctly
✅ No TypeScript errors
✅ Error boundary catches provider failures
✅ Console shows successful initialization

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Manifest CORS | Medium | High | Serve from same origin |
| Provider crash | Low | High | Error boundary implementation |
| Wrong URL config | Medium | Medium | Runtime verification |

## Security Considerations

- **Manifest integrity:** Verify manifest hasn't been tampered
- **URL validation:** Ensure manifest URL is from trusted source
- **CSP headers:** Update Content-Security-Policy for wallet connections
- **HTTPS only:** Enforce secure connections

## Next Steps

→ [Phase 2: Wallet Hooks](phase-02-hooks.md) - Create custom hooks for wallet interaction