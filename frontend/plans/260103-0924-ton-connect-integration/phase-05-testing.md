# Phase 5: Testing & Polish

## Overview
- **Date:** 2026-01-03
- **Priority:** P1
- **Status:** pending
- **Effort:** 45 minutes

## Context
- **Related files:**
  - All components from previous phases
  - Test utilities and mocks
  - Performance monitoring setup

## Key Insights

1. **Test all connection flows** - QR code, deep link, in-app browser
2. **Handle edge cases** - Network errors, user cancellation, timeout
3. **Performance matters** - Connection should be < 3 seconds
4. **Mobile focus** - Primary platform is Telegram mini-app

## Requirements

- [ ] Test wallet connection flows
- [ ] Handle error scenarios
- [ ] Optimize performance
- [ ] Polish UX transitions
- [ ] Verify security measures

## Architecture Decisions

- **Integration tests over unit tests:** Focus on user flows
- **Real wallet testing:** Test with actual TON wallets
- **Error recovery:** Graceful degradation on failures
- **Performance budget:** Max 3s for connection

## Implementation Steps

### Step 1: Test Utilities

```typescript
// src/utils/testUtils/tonConnect.ts
import { vi } from 'vitest';

export function mockTonConnect() {
  return {
    useTonConnectUI: vi.fn(() => [{
      openModal: vi.fn(),
      disconnect: vi.fn(),
      connected: false
    }]),
    useTonWallet: vi.fn(() => null),
    useTonAddress: vi.fn(() => null),
    useIsConnectionRestored: vi.fn(() => true)
  };
}

export function createMockWallet() {
  return {
    device: {
      appName: 'Test Wallet',
      platform: 'ios',
      appVersion: '1.0.0',
      maxProtocolVersion: 2,
      features: []
    },
    provider: 'http',
    account: {
      address: 'EQD4FPq-PRDi...x1IGt--I7ruVZ',
      chain: '-239',
      walletStateInit: 'te6ccsEBAQEAA...'
    },
    imageUrl: 'https://wallet.ton.org/icon.png'
  };
}
```

### Step 2: Integration Tests

```typescript
// src/components/__tests__/WalletConnection.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { ProfileButton } from '../ProfileButton';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

describe('Wallet Connection Flow', () => {
  it('should show connect button when not connected', () => {
    render(
      <TonConnectUIProvider manifestUrl="/manifest.json">
        <AuthProvider>
          <ProfileButton />
        </AuthProvider>
      </TonConnectUIProvider>
    );

    expect(screen.queryByText(/0x/)).not.toBeInTheDocument();
  });

  it('should display wallet address after connection', async () => {
    const { rerender } = render(
      <TonConnectUIProvider manifestUrl="/manifest.json">
        <AuthProvider>
          <ProfileButton />
        </AuthProvider>
      </TonConnectUIProvider>
    );

    // Simulate wallet connection
    // This would be done via mocking in actual tests

    await waitFor(() => {
      expect(screen.getByText(/EQD4/)).toBeInTheDocument();
    });
  });

  it('should handle disconnection properly', async () => {
    // Test disconnection flow
  });
});
```

### Step 3: Error Handling

```typescript
// src/utils/errorHandling.ts
export class WalletConnectionError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable = true
  ) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

export function handleWalletError(error: unknown): WalletConnectionError {
  if (error instanceof WalletConnectionError) {
    return error;
  }

  if (error instanceof Error) {
    // Map known errors
    if (error.message.includes('User rejected')) {
      return new WalletConnectionError(
        'Connection cancelled by user',
        'USER_REJECTED',
        true
      );
    }

    if (error.message.includes('timeout')) {
      return new WalletConnectionError(
        'Connection timed out. Please try again.',
        'TIMEOUT',
        true
      );
    }

    if (error.message.includes('network')) {
      return new WalletConnectionError(
        'Network error. Check your connection.',
        'NETWORK_ERROR',
        true
      );
    }
  }

  return new WalletConnectionError(
    'Unknown error occurred',
    'UNKNOWN',
    false
  );
}

// Error recovery component
export function WalletErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<WalletConnectionError | null>(null);

  const handleReset = () => {
    setError(null);
    window.location.reload();
  };

  if (error) {
    return (
      <Alert severity="error" action={
        error.recoverable && (
          <Button size="small" onClick={handleReset}>
            Retry
          </Button>
        )
      }>
        <AlertTitle>Wallet Connection Error</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  return <>{children}</>;
}
```

### Step 4: Performance Monitoring

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      console.warn(`Mark ${startMark} not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;

    // Log to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration)
      });
    }

    return duration;
  }

  logConnectionTime(duration: number) {
    console.log(`Wallet connection took ${duration}ms`);

    if (duration > 3000) {
      console.warn('Connection exceeded 3s threshold');
    }
  }
}

// Usage in connection hook
export function useMonitoredConnection() {
  const monitor = useRef(new PerformanceMonitor());
  const { connect: baseConnect } = useTonConnect();

  const connect = useCallback(async () => {
    monitor.current.mark('connection_start');

    try {
      await baseConnect();
      const duration = monitor.current.measure(
        'wallet_connection',
        'connection_start'
      );
      monitor.current.logConnectionTime(duration);
    } catch (error) {
      monitor.current.measure('connection_failed', 'connection_start');
      throw error;
    }
  }, [baseConnect]);

  return { connect };
}
```

### Step 5: E2E Test Scenarios

```typescript
// cypress/e2e/wallet-connection.cy.ts
describe('TON Connect Integration', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete full connection flow', () => {
    // Click connect button
    cy.get('[data-testid="wallet-connect-btn"]').click();

    // Modal should open
    cy.get('[role="dialog"]').should('be.visible');

    // Simulate QR code scan (would need custom command)
    cy.simulateWalletConnection();

    // Check address displays
    cy.get('[data-testid="wallet-address"]')
      .should('contain', 'EQD4');

    // Test copy functionality
    cy.get('[data-testid="copy-address"]').click();
    cy.window().its('navigator.clipboard')
      .invoke('readText')
      .should('match', /^EQD4/);
  });

  it('should persist connection on refresh', () => {
    cy.simulateWalletConnection();
    cy.reload();

    cy.get('[data-testid="wallet-address"]', { timeout: 5000 })
      .should('be.visible');
  });

  it('should handle disconnection', () => {
    cy.simulateWalletConnection();

    cy.get('[data-testid="profile-menu"]').click();
    cy.get('[data-testid="disconnect-wallet"]').click();

    cy.get('[data-testid="wallet-connect-btn"]')
      .should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '/api/auth/wallet', {
      statusCode: 500,
      body: { error: 'Server error' }
    });

    cy.simulateWalletConnection();

    cy.get('[role="alert"]')
      .should('contain', 'error');
  });
});
```

### Step 6: Polish & Optimization Checklist

```typescript
// src/utils/optimizationChecklist.ts
export const OPTIMIZATION_CHECKLIST = {
  performance: [
    'Bundle size < 50KB for TON Connect',
    'Connection time < 3 seconds',
    'No memory leaks on disconnect',
    'Efficient re-renders (React DevTools)'
  ],

  ux: [
    'Loading states for all async operations',
    'Error messages are user-friendly',
    'Success feedback is visible',
    'Mobile touch targets >= 44px',
    'Animations are smooth (60fps)'
  ],

  security: [
    'No sensitive data in localStorage',
    'Address validation before display',
    'HTTPS only for manifest',
    'CSP headers configured',
    'No console.log of wallet data'
  ],

  accessibility: [
    'Keyboard navigation works',
    'Screen reader announces states',
    'Color contrast passes WCAG AA',
    'Focus indicators visible'
  ]
};

// Automated checks
export async function runOptimizationChecks() {
  const results = {
    bundleSize: checkBundleSize(),
    performanceMetrics: await checkPerformance(),
    securityAudit: runSecurityChecks(),
    accessibilityScore: await runA11yTests()
  };

  return results;
}
```

## Todo List

- [ ] Create test utilities and mocks
- [ ] Write integration tests for connection flow
- [ ] Implement error handling and recovery
- [ ] Add performance monitoring
- [ ] Create E2E test scenarios
- [ ] Run optimization checklist
- [ ] Test on real devices
- [ ] Document known issues

## Success Criteria

✅ All test scenarios pass
✅ Connection time < 3 seconds
✅ Error recovery works smoothly
✅ No memory leaks detected
✅ Mobile experience is smooth
✅ Accessibility standards met

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Wallet app bugs | Medium | High | Test multiple wallets |
| Network latency | High | Medium | Add timeout handling |
| Memory leaks | Low | High | Cleanup in useEffect |

## Security Considerations

- **No logging of sensitive data:** Remove all wallet data logs
- **HTTPS enforcement:** Ensure manifest served over HTTPS
- **Content Security Policy:** Update CSP for wallet connections
- **Regular security audits:** Schedule periodic reviews

## Final Checklist

- [ ] ✅ Wallet connects via QR and deep link
- [ ] ✅ Address displays correctly truncated
- [ ] ✅ Copy address works on all platforms
- [ ] ✅ Connection persists on refresh
- [ ] ✅ Disconnection cleans up properly
- [ ] ✅ Error states handled gracefully
- [ ] ✅ Loading states show during operations
- [ ] ✅ Mobile UI optimized for Telegram
- [ ] ✅ Performance meets targets
- [ ] ✅ Security best practices followed

## Deployment Notes

1. **Environment variables:** Set VITE_TON_CONNECT_MANIFEST_URL
2. **CORS configuration:** Ensure manifest accessible
3. **Monitoring setup:** Add connection success/failure metrics
4. **Rollback plan:** Feature flag for gradual rollout

## Post-Launch Monitoring

- Track connection success rate
- Monitor average connection time
- Log error frequencies by type
- Collect user feedback on UX
- Review security logs regularly