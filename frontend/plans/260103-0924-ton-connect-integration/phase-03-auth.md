# Phase 3: AuthContext Integration

## Overview
- **Date:** 2026-01-03
- **Priority:** P1
- **Status:** pending
- **Effort:** 1 hour

## Context
- **Related files:**
  - `/frontend/src/contexts/AuthContext.tsx` - Existing auth context
  - `/frontend/src/hooks/useTonConnect.ts` - Wallet hooks from Phase 2
  - Authentication flow needs wallet integration

## Key Insights

1. **Wallet as auth method** - Wallet connection can serve as authentication
2. **Dual auth support** - Support both traditional and wallet auth
3. **State synchronization** - Keep wallet and auth state in sync
4. **Session persistence** - TON Connect handles wallet persistence

## Requirements

- [ ] Extend AuthContext with wallet state
- [ ] Add wallet auth methods
- [ ] Sync wallet connection with login
- [ ] Handle wallet disconnect as logout
- [ ] Preserve existing auth functionality

## Architecture Decisions

- **Extend, don't replace:** Keep existing auth, add wallet as option
- **Wallet priority:** If wallet connected, use as primary auth
- **State coupling:** Wallet connection triggers auth state update
- **Backward compatible:** Existing components continue working

## Implementation Steps

### Step 1: Extend AuthContext Types

```typescript
// src/contexts/AuthContext.tsx
import { useTonConnect } from '../hooks/useTonConnect';

export interface User {
  id: string;
  name?: string;
  email?: string;
  walletAddress?: string; // New field
  authMethod: 'traditional' | 'wallet'; // New field
}

export interface AuthContextValue {
  // Existing fields
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // New wallet fields
  walletAddress: string | null;
  isWalletConnected: boolean;
  walletName?: string;

  // Existing methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // New wallet methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  authenticateWithWallet: (address: string) => Promise<void>;
}
```

### Step 2: Update AuthProvider

```typescript
// src/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Integrate TON Connect
  const {
    address: walletAddress,
    isConnected: isWalletConnected,
    wallet,
    connect: connectTonWallet,
    disconnect: disconnectTonWallet,
    isRestored
  } = useTonConnect();

  // Sync wallet connection with auth
  useEffect(() => {
    if (!isRestored) return;

    if (isWalletConnected && walletAddress && !user?.walletAddress) {
      // Wallet connected, authenticate
      authenticateWithWallet(walletAddress);
    } else if (!isWalletConnected && user?.authMethod === 'wallet') {
      // Wallet disconnected, logout if using wallet auth
      logout();
    }
  }, [isWalletConnected, walletAddress, isRestored]);

  const authenticateWithWallet = useCallback(async (address: string) => {
    try {
      setIsLoading(true);

      // Call backend to verify wallet and get/create user
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) throw new Error('Wallet auth failed');

      const userData = await response.json();

      setUser({
        ...userData,
        walletAddress: address,
        authMethod: 'wallet'
      });

      // Store auth token if provided
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
    } catch (error) {
      console.error('Wallet authentication error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      await connectTonWallet();
      // Authentication will happen via useEffect
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }, [connectTonWallet]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnectTonWallet();

      if (user?.authMethod === 'wallet') {
        await logout();
      }
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      throw error;
    }
  }, [disconnectTonWallet, user]);

  const logout = useCallback(async () => {
    // If using wallet auth, disconnect wallet too
    if (user?.authMethod === 'wallet' && isWalletConnected) {
      await disconnectTonWallet();
    }

    setUser(null);
    localStorage.removeItem('authToken');

    // Call backend logout if needed
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user, isWalletConnected, disconnectTonWallet]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !isRestored,
    walletAddress,
    isWalletConnected,
    walletName: wallet?.device.appName,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    authenticateWithWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Step 3: Create Auth Guard

```typescript
// src/components/AuthGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireWallet?: boolean;
  fallback?: string;
}

export function AuthGuard({
  children,
  requireWallet = false,
  fallback = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, isWalletConnected, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  if (requireWallet && !isWalletConnected) {
    return <Navigate to="/connect-wallet" replace />;
  }

  return <>{children}</>;
}
```

### Step 4: Wallet Auth Flow

```typescript
// src/utils/walletAuth.ts
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  // Implement signature verification
  // This is a placeholder - actual implementation depends on backend
  try {
    const response = await fetch('/api/auth/verify-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature, message })
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function generateAuthMessage(): string {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2);

  return `Sign this message to authenticate with Hazelnut:
Timestamp: ${timestamp}
Nonce: ${nonce}`;
}
```

### Step 5: Update Auth Hook

```typescript
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// Helper hook for wallet-specific auth
export function useWalletAuth() {
  const {
    walletAddress,
    isWalletConnected,
    walletName,
    connectWallet,
    disconnectWallet
  } = useAuth();

  return {
    address: walletAddress,
    isConnected: isWalletConnected,
    walletName,
    connect: connectWallet,
    disconnect: disconnectWallet
  };
}
```

## Todo List

- [ ] Extend AuthContext interface with wallet fields
- [ ] Update AuthProvider with wallet integration
- [ ] Sync wallet state with auth state
- [ ] Create wallet authentication flow
- [ ] Add auth guard component
- [ ] Implement wallet signature verification
- [ ] Create useWalletAuth helper hook
- [ ] Test auth flows (traditional + wallet)

## Success Criteria

✅ Wallet connection triggers authentication
✅ Wallet disconnect triggers logout (if wallet auth)
✅ Traditional auth still works
✅ Auth state syncs with wallet state
✅ Protected routes work with both auth types
✅ Session persists on refresh

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| State desync | Medium | High | Single source of truth |
| Auth bypass | Low | Critical | Server-side verification |
| Breaking changes | Low | High | Backward compatibility |

## Security Considerations

- **Signature verification:** Always verify wallet signatures server-side
- **Nonce usage:** Use nonce to prevent replay attacks
- **Token rotation:** Rotate auth tokens regularly
- **Address validation:** Validate wallet addresses on backend
- **Rate limiting:** Limit auth attempts per address

## Next Steps

→ [Phase 4: UI Components](phase-04-ui.md) - Update UI components with wallet functionality