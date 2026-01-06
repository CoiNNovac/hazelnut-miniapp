---
title: TON Connect Wallet Integration
description: Integrate TON Connect for wallet connection and authentication in the frontend
status: pending
priority: P1
effort: 5h
branch: main
tags: [wallet, ton-connect, authentication, frontend]
created: 2026-01-03
---

# TON Connect Wallet Integration Plan

## Executive Summary

Integrate TON Connect UI SDK into the Hazelnut mini-app frontend to enable wallet connection, display user wallet address, and provide seamless connect/disconnect functionality integrated with existing AuthContext.

## Context

- **Dependencies installed:** @tonconnect/ui-react (2.2.2), @ton/core (0.56.3), @ton/ton (13.11.2)
- **Manifest ready:** tonconnect-manifest.json exists in public folder
- **Integration points:** AuthContext, ProfileButton, App.tsx

## Architecture Overview

```
App.tsx (TonConnectUIProvider)
    ├── AuthContext (wallet state integration)
    ├── ProfileButton (wallet display)
    └── Wallet Hooks
        ├── useTonConnectUI()
        ├── useTonWallet()
        ├── useTonAddress()
        └── useIsConnectionRestored()
```

## Implementation Phases

### [Phase 1: Provider Setup](phase-01-provider.md) (45min)
- **Status:** `pending`
- Configure TonConnectUIProvider in App.tsx
- Set manifest URL and wallet preferences
- Add error boundaries

### [Phase 2: Wallet Hooks](phase-02-hooks.md) (1h)
- **Status:** `pending`
- Create custom wallet connection hooks
- Handle connection/disconnection logic
- Implement state management

### [Phase 3: AuthContext Integration](phase-03-auth.md) (1h)
- **Status:** `pending`
- Extend AuthContext with wallet state
- Sync wallet connection with auth state
- Handle wallet session persistence

### [Phase 4: UI Components](phase-04-ui.md) (1.5h)
- **Status:** `pending`
- Update ProfileButton with wallet display
- Add connection button/modal
- Implement address truncation

### [Phase 5: Testing & Polish](phase-05-testing.md) (45min)
- **Status:** `pending`
- Test wallet connection flows
- Handle edge cases & errors
- Performance optimization

## Success Metrics

- ✅ Wallet connects successfully via QR/deep link
- ✅ Address displays in ProfileButton (truncated)
- ✅ Connection persists across sessions
- ✅ Clean disconnect functionality
- ✅ Error states handled gracefully

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CORS issues with manifest | High | Verify manifest served at root |
| Connection persistence | Medium | Use SDK's built-in storage |
| Type conflicts | Low | Strict TypeScript configuration |

## Dependencies

- TON Connect UI React: 2.2.2
- React: 18.x
- TypeScript: 5.x

## Timeline

**Total effort:** ~5 hours
**Start date:** 2026-01-03
**Target completion:** Same day implementation