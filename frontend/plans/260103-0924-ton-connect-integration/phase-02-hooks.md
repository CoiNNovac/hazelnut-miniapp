# Phase 2: Wallet Hooks

## Overview
- **Date:** 2026-01-03
- **Priority:** P1
- **Status:** pending
- **Effort:** 1 hour

## Context
- **Related files:**
  - `/frontend/src/hooks/` - Existing hooks directory
  - `/frontend/src/contexts/AuthContext.tsx` - Auth state management
  - SDK hooks: `useTonConnectUI`, `useTonWallet`, `useTonAddress`, `useIsConnectionRestored`

## Key Insights

1. **SDK provides 4 main hooks** - Each serves specific purpose
2. **Connection restoration is async** - Must wait for useIsConnectionRestored
3. **Address formatting needed** - Raw addresses are too long for UI
4. **State sync critical** - Wallet state must sync with AuthContext

## Requirements

- [ ] Create centralized wallet hook
- [ ] Handle connection/disconnection
- [ ] Format wallet addresses
- [ ] Manage loading states
- [ ] Provide error handling

## Architecture Decisions

- **Single custom hook:** `useTonConnect` aggregates all SDK hooks
- **Address format:** Show first 4 + last 4 chars with ellipsis
- **State management:** Sync with AuthContext, not separate state
- **Error handling:** Return error state from hook

## Implementation Steps

### Step 1: Create Main Hook

```typescript
// src/hooks/useTonConnect.ts
import {
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
  useIsConnectionRestored
} from '@tonconnect/ui-react';
import { useCallback, useEffect, useState } from 'react';

export interface TonConnectState {
  wallet: ReturnType<typeof useTonWallet>;
  address: string | null;
  formattedAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isRestored: boolean;
  error: Error | null;
}

export interface TonConnectActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  openModal: () => void;
}

export function useTonConnect(): TonConnectState & TonConnectActions {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const isRestored = useIsConnectionRestored();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const formattedAddress = address ? formatAddress(address) : null;
  const isConnected = !!wallet;

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await tonConnectUI.openModal();
    } catch (err) {
      setError(err as Error);
      console.error('Connection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await tonConnectUI.disconnect();
    } catch (err) {
      setError(err as Error);
      console.error('Disconnection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI]);

  const openModal = useCallback(() => {
    tonConnectUI.openModal();
  }, [tonConnectUI]);

  return {
    wallet,
    address,
    formattedAddress,
    isConnected,
    isLoading,
    isRestored,
    error,
    connect,
    disconnect,
    openModal
  };
}
```

### Step 2: Address Formatting Utility

```typescript
// src/utils/tonAddress.ts
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2) {
    return address;
  }

  const start = address.slice(0, chars);
  const end = address.slice(-chars);

  return `${start}...${end}`;
}

export function validateTonAddress(address: string): boolean {
  // TON addresses are 48 characters (base64) or
  // 66 characters with 0: prefix (hex)
  const base64Pattern = /^[a-zA-Z0-9_-]{48}$/;
  const hexPattern = /^0:[a-fA-F0-9]{64}$/;

  return base64Pattern.test(address) || hexPattern.test(address);
}

export function shortenAddress(address: string): string {
  return formatAddress(address, 6);
}
```

### Step 3: Connection Status Hook

```typescript
// src/hooks/useConnectionStatus.ts
import { useEffect, useState } from 'react';
import { useTonConnect } from './useTonConnect';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'restoring'
  | 'error';

export function useConnectionStatus(): ConnectionStatus {
  const { isConnected, isLoading, isRestored, error } = useTonConnect();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (!isRestored) {
      setStatus('restoring');
    } else if (isLoading) {
      setStatus('connecting');
    } else if (isConnected) {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
  }, [isConnected, isLoading, isRestored, error]);

  return status;
}
```

### Step 4: Wallet Info Hook

```typescript
// src/hooks/useWalletInfo.ts
import { useTonConnect } from './useTonConnect';
import { useMemo } from 'react';

export interface WalletInfo {
  name: string;
  icon: string;
  address: string;
  shortAddress: string;
  balance?: string;
}

export function useWalletInfo(): WalletInfo | null {
  const { wallet, address, formattedAddress } = useTonConnect();

  return useMemo(() => {
    if (!wallet || !address) return null;

    return {
      name: wallet.device.appName,
      icon: wallet.imageUrl || '',
      address,
      shortAddress: formattedAddress || address,
      balance: undefined // Will be implemented later
    };
  }, [wallet, address, formattedAddress]);
}
```

### Step 5: Auto-Connect Hook

```typescript
// src/hooks/useAutoConnect.ts
import { useEffect, useRef } from 'react';
import { useTonConnect } from './useTonConnect';

export function useAutoConnect(
  onConnect?: (address: string) => void,
  onDisconnect?: () => void
) {
  const { address, isRestored } = useTonConnect();
  const previousAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!isRestored) return;

    if (address && !previousAddress.current) {
      // Just connected
      onConnect?.(address);
    } else if (!address && previousAddress.current) {
      // Just disconnected
      onDisconnect?.();
    }

    previousAddress.current = address;
  }, [address, isRestored, onConnect, onDisconnect]);
}
```

## Todo List

- [ ] Create useTonConnect main hook
- [ ] Implement address formatting utilities
- [ ] Add connection status tracking
- [ ] Create wallet info hook
- [ ] Implement auto-connect detection
- [ ] Add TypeScript types
- [ ] Test all hooks functionality
- [ ] Document hook usage

## Success Criteria

✅ Hooks compile without TypeScript errors
✅ Connection/disconnection works smoothly
✅ Address formatting displays correctly
✅ Loading states update properly
✅ Error states captured and returned
✅ Auto-reconnection on page refresh

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Hook race conditions | Medium | High | Use proper dependencies |
| Memory leaks | Low | Medium | Cleanup in useEffect |
| State sync issues | Medium | High | Single source of truth |

## Security Considerations

- **Address validation:** Always validate addresses before use
- **Connection verification:** Verify wallet actually connected
- **State tampering:** Don't trust client-side wallet state
- **Event injection:** Validate all wallet events

## Next Steps

→ [Phase 3: AuthContext Integration](phase-03-auth.md) - Integrate wallet state with authentication