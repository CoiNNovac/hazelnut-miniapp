# Phase 4: UI Components

## Overview
- **Date:** 2026-01-03
- **Priority:** P1
- **Status:** pending
- **Effort:** 1.5 hours

## Context
- **Related files:**
  - `/frontend/src/components/ProfileButton.tsx` - User profile display
  - `/frontend/src/components/` - UI components directory
  - Material-UI components for consistent styling

## Key Insights

1. **TonConnectButton auto-transforms** - Shows connect/disconnect automatically
2. **ProfileButton needs wallet display** - Show address when connected
3. **Mobile-first design** - Optimize for Telegram mini-app
4. **Smooth transitions** - Loading states during connection

## Requirements

- [ ] Update ProfileButton with wallet info
- [ ] Create wallet connection modal
- [ ] Add address display with copy functionality
- [ ] Implement loading states
- [ ] Style for mobile screens

## Architecture Decisions

- **Use SDK's TonConnectButton:** Leverage built-in functionality
- **Custom profile integration:** Extend ProfileButton for wallet
- **Address display:** Truncated with copy-to-clipboard
- **Modal vs inline:** Use modal for connection flow

## Implementation Steps

### Step 1: Update ProfileButton

```tsx
// src/components/ProfileButton.tsx
import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { formatAddress } from '../utils/tonAddress';

export function ProfileButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const {
    user,
    walletAddress,
    isWalletConnected,
    walletName,
    logout,
    disconnectWallet
  } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDisconnect = async () => {
    handleClose();

    if (user?.authMethod === 'wallet') {
      await disconnectWallet();
    } else {
      await logout();
    }
  };

  const displayName = user?.name || formatAddress(walletAddress || '', 6);
  const isWalletAuth = user?.authMethod === 'wallet';

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={
          <Avatar sx={{ width: 32, height: 32 }}>
            {isWalletAuth ? <WalletIcon /> : <PersonIcon />}
          </Avatar>
        }
        sx={{
          textTransform: 'none',
          color: 'text.primary'
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {displayName}
          </Typography>
          {isWalletConnected && (
            <Typography variant="caption" color="text.secondary">
              {walletName || 'TON Wallet'}
            </Typography>
          )}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 280, mt: 1 }
        }}
      >
        {/* User Info Section */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {isWalletAuth ? 'Wallet Account' : 'User Account'}
          </Typography>
          {user?.email && (
            <Typography variant="body2">{user.email}</Typography>
          )}
        </Box>

        <Divider />

        {/* Wallet Section */}
        {isWalletConnected && walletAddress && (
          <>
            <MenuItem sx={{ gap: 1 }}>
              <WalletIcon fontSize="small" color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {formatAddress(walletAddress, 6)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {walletName}
                </Typography>
              </Box>
              <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAddress();
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
            <Divider />
          </>
        )}

        {/* Actions */}
        <MenuItem onClick={handleDisconnect}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          {isWalletAuth ? 'Disconnect Wallet' : 'Sign Out'}
        </MenuItem>
      </Menu>
    </>
  );
}
```

### Step 2: Create Wallet Connect Button

```tsx
// src/components/WalletConnectButton.tsx
import { TonConnectButton } from '@tonconnect/ui-react';
import { Box, styled } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const StyledTonButton = styled(Box)(({ theme }) => ({
  '& > div': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    padding: '8px 16px',
    fontFamily: theme.typography.fontFamily,

    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  }
}));

export function WalletConnectButton() {
  const { isWalletConnected } = useAuth();

  return (
    <StyledTonButton>
      <TonConnectButton />
    </StyledTonButton>
  );
}
```

### Step 3: Create Wallet Info Card

```tsx
// src/components/WalletInfoCard.tsx
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  OpenInNew as ExplorerIcon
} from '@mui/icons-material';
import { useWalletAuth } from '../hooks/useAuth';
import { formatAddress } from '../utils/tonAddress';
import { useState } from 'react';

export function WalletInfoCard() {
  const { address, isConnected, walletName } = useWalletAuth();
  const [copied, setCopied] = useState(false);

  if (!isConnected) {
    return null;
  }

  const handleCopy = async () => {
    if (!address) return;

    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExplorer = () => {
    if (!address) return;

    window.open(
      `https://tonscan.org/address/${address}`,
      '_blank'
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip
            label="Connected"
            color="success"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {walletName || 'TON Wallet'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {address ? formatAddress(address, 8) : <Skeleton width="100%" />}
          </Typography>

          <IconButton
            size="small"
            onClick={handleCopy}
            disabled={!address}
          >
            <CopyIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleOpenExplorer}
            disabled={!address}
          >
            <ExplorerIcon fontSize="small" />
          </IconButton>
        </Box>

        {copied && (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ mt: 1, display: 'block' }}
          >
            Address copied to clipboard!
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create Connection Flow Component

```tsx
// src/components/WalletConnectionFlow.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WalletConnectButton } from './WalletConnectButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WalletConnectionFlow({ open, onClose }: Props) {
  const { isWalletConnected, walletAddress } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Choose Wallet',
    'Connect',
    'Verify'
  ];

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return;
    }

    if (!isWalletConnected) {
      setActiveStep(0);
    } else if (!walletAddress) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
      // Auto-close after successful connection
      setTimeout(onClose, 1500);
    }
  }, [isWalletConnected, walletAddress, open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Connect Your Wallet</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {activeStep === 0 && (
            <>
              <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                Connect your TON wallet to access all features
              </Typography>
              <WalletConnectButton />
            </>
          )}

          {activeStep === 1 && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Waiting for wallet confirmation...
              </Typography>
            </>
          )}

          {activeStep === 2 && (
            <>
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                ✓ Connected Successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {walletAddress && formatAddress(walletAddress, 6)}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {activeStep === 2 ? 'Done' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Step 5: Mobile-Optimized Wallet Display

```tsx
// src/components/MobileWalletBar.tsx
import { AppBar, Toolbar, Box, Chip, IconButton } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useWalletAuth } from '../hooks/useAuth';
import { formatAddress } from '../utils/tonAddress';

export function MobileWalletBar() {
  const { address, isConnected, connect } = useWalletAuth();

  if (!isConnected) {
    return (
      <AppBar
        position="fixed"
        color="default"
        sx={{
          top: 'auto',
          bottom: 0,
          background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.9))'
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Chip
            icon={<WalletIcon />}
            label="Connect Wallet"
            onClick={connect}
            color="primary"
            variant="outlined"
          />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ top: 'auto', bottom: 0 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletIcon />
          <Chip
            label={formatAddress(address || '', 4)}
            size="small"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

## Todo List

- [ ] Update ProfileButton with wallet display
- [ ] Style TonConnectButton for consistency
- [ ] Create WalletInfoCard component
- [ ] Implement connection flow dialog
- [ ] Add mobile-optimized wallet bar
- [ ] Add copy address functionality
- [ ] Implement loading states
- [ ] Test on mobile screens

## Success Criteria

✅ Wallet address displays in ProfileButton
✅ Address truncation works correctly
✅ Copy to clipboard functionality works
✅ Connection flow guides user smoothly
✅ Mobile UI is optimized for small screens
✅ Loading states show during operations

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| UI breaks on mobile | Medium | High | Responsive testing |
| Copy fails on some browsers | Low | Low | Fallback implementation |
| Button styling conflicts | Medium | Low | CSS isolation |

## Security Considerations

- **No private keys in UI:** Never display or handle private keys
- **Address validation:** Validate addresses before display
- **Clipboard security:** Only copy verified addresses
- **XSS prevention:** Sanitize all wallet data display

## Next Steps

→ [Phase 5: Testing & Polish](phase-05-testing.md) - Test integration and polish UX