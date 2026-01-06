import type { User, Token, Purchase, Profit, Transaction } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  telegramId: '123456789',
  username: 'testuser',
  firstName: 'John',
  lastName: 'Doe',
  walletAddress: 'UQD...abc123',
  photoUrl: 'https://via.placeholder.com/150',
  createdAt: new Date().toISOString(),
};

// Mock token data with complete information
export const mockTokens: Token[] = [
  {
    id: '1',
    symbol: 'CORN',
    name: 'Organic Corn Farm',
    description: 'Premium organic corn from Egyptian farms. Invest in sustainable agriculture with verified profit sharing.',
    price: 245,
    totalSupply: 10000,
    availableSupply: 4500,
    saleStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    saleEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    logo: '🌽',
    status: 'active',
    issuer: {
      name: 'Ahmed Hassan',
      farmAddress: 'Nile Delta, Dakahlia Governorate, Egypt',
      verified: true,
      yearsOfExperience: 28,
      licenseNumber: 'EG-DK-2013-04567',
    },
    apy: 10,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    roadmap: [
      {
        quarter: 'Q1 2025',
        status: 'completed',
        title: 'Token Launch',
        items: ['Public sale begins', 'Smart contract deployment', 'Initial distribution'],
      },
      {
        quarter: 'Q2 2025',
        status: 'active',
        title: 'Farm Operations',
        items: ['Planting season starts', 'First harvest begins', 'Yield reporting system'],
      },
      {
        quarter: 'Q3 2025',
        status: 'upcoming',
        title: 'Profit Distribution',
        items: ['First profit sharing', 'Market expansion', 'New farm partnerships'],
      },
      {
        quarter: 'Q4 2025',
        status: 'upcoming',
        title: 'Platform Growth',
        items: ['Secondary market launch', 'Mobile app release', 'Global expansion'],
      },
    ],
    faq: [
      {
        question: 'What are profit-sharing tokens?',
        answer: 'Profit-sharing tokens represent ownership in agricultural harvests. Token holders receive a proportional share of the profits generated from crop sales, typically distributed quarterly based on harvest cycles.',
      },
      {
        question: 'How often are profits distributed?',
        answer: 'Profits are distributed quarterly, aligned with harvest cycles. Each distribution is based on the actual yield and market prices achieved during that quarter.',
      },
      {
        question: 'What is the minimum investment?',
        answer: 'The minimum investment is 1 token. You can purchase tokens in any quantity based on current availability and your investment goals.',
      },
      {
        question: 'Can I sell my tokens?',
        answer: 'Yes, tokens can be traded on the secondary market once it launches in Q4 2025. Until then, you can hold tokens to receive quarterly profit distributions.',
      },
      {
        question: 'What risks are involved?',
        answer: 'Agricultural investments carry risks including weather conditions, crop diseases, market price fluctuations, and regulatory changes. Historical yields are not guaranteed for future performance.',
      },
    ],
    whitepaperUrl: '/documents/corn-whitepaper.pdf',
    distribution: [
      { label: 'Public Sale', value: 30, color: '#F47621' },
      { label: 'Farmers', value: 35, color: '#1A1D3D' },
      { label: 'Team', value: 15, color: '#3B82F6' },
      { label: 'Reserve', value: 10, color: '#4ADE80' },
      { label: 'Liquidity', value: 10, color: '#8E92BC' },
    ],
    telegramChannel: '@cornfarm_official',
    yearlyYields: [
      { year: '2025', targetYield: 10, actualYield: 11.2 },
    ],
  },
  {
    id: '2',
    symbol: 'COTTON',
    name: 'Cotton Fields',
    description: 'High-quality cotton from verified Egyptian producers. Sustainable farming with proven track record.',
    price: 245,
    totalSupply: 10000,
    availableSupply: 3200,
    saleStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    saleEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    logo: '🌾',
    status: 'active',
    issuer: {
      name: 'Ahmed Hassan',
      farmAddress: 'Nile Delta, Dakahlia Governorate, Egypt',
      verified: true,
      yearsOfExperience: 28,
      licenseNumber: 'EG-DK-2013-04567',
    },
    apy: 10,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    roadmap: [
      {
        quarter: 'Q1 2025',
        status: 'completed',
        title: 'Token Launch',
        items: ['Public sale begins', 'Smart contract deployment', 'Initial distribution'],
      },
      {
        quarter: 'Q2 2025',
        status: 'active',
        title: 'Farm Operations',
        items: ['Planting season starts', 'First harvest begins', 'Yield reporting system'],
      },
      {
        quarter: 'Q3 2025',
        status: 'upcoming',
        title: 'Profit Distribution',
        items: ['First profit sharing', 'Market expansion', 'New farm partnerships'],
      },
      {
        quarter: 'Q4 2025',
        status: 'upcoming',
        title: 'Platform Growth',
        items: ['Secondary market launch', 'Mobile app release', 'Global expansion'],
      },
    ],
    faq: [
      {
        question: 'What are profit-sharing tokens?',
        answer: 'Profit-sharing tokens represent ownership in agricultural harvests. Token holders receive a proportional share of the profits generated from crop sales.',
      },
      {
        question: 'How often are profits distributed?',
        answer: 'Profits are distributed quarterly based on harvest cycles and market conditions.',
      },
      {
        question: 'What is the minimum investment?',
        answer: 'The minimum investment is 1 token. You can purchase any quantity based on availability.',
      },
      {
        question: 'Can I sell my tokens?',
        answer: 'Yes, tokens can be traded on the secondary market once it launches in Q4 2025.',
      },
      {
        question: 'What risks are involved?',
        answer: 'Agricultural investments carry risks including weather, crop diseases, and market fluctuations.',
      },
    ],
    whitepaperUrl: '/documents/cotton-whitepaper.pdf',
    distribution: [
      { label: 'Public Sale', value: 30, color: '#F47621' },
      { label: 'Farmers', value: 35, color: '#1A1D3D' },
      { label: 'Team', value: 15, color: '#3B82F6' },
      { label: 'Reserve', value: 20, color: '#4ADE80' },
      { label: 'Liquidity', value: 10, color: '#8E92BC' },
    ],
    telegramChannel: '@cottonfarm_official',
    yearlyYields: [
      { year: '2025', targetYield: 10, actualYield: 11.2 },
    ],
  },
  {
    id: '3',
    symbol: 'RICE',
    name: 'Rice Paddy Fields',
    description: 'Sustainable rice cultivation. Long-term agricultural investment opportunity.',
    price: 200,
    totalSupply: 15000,
    availableSupply: 8500,
    saleStart: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    saleEnd: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    logo: '🌾',
    status: 'upcoming',
    issuer: {
      name: 'Delta Agro',
      farmAddress: 'Banat, Serbia',
      yearsOfExperience: 15,
      licenseNumber: 'RS-BN-2018-03421',
      verified: true,
    },
    apy: 14.2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock purchases
export const mockPurchases: Purchase[] = [
  {
    id: '1',
    userId: '1',
    tokenId: '1',
    amount: 125.5,
    price: 245,
    total: 30747.50,
    txHash: 'tx_abc123',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    token: mockTokens[0],
  },
  {
    id: '2',
    userId: '1',
    tokenId: '2',
    amount: 125.5,
    price: 245,
    total: 30747.50,
    txHash: 'tx_def456',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    token: mockTokens[1],
  },
];

// Mock profits
export const mockProfits: Profit[] = [
  {
    id: '1',
    userId: '1',
    amount: 155,
    txHash: 'tx_profit1',
    claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    amount: 128,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock transactions for wallet
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'received',
    from: '0xFa...7A2E',
    amount: 50,
    currency: 'COTTON',
    eurValue: 12250,
    status: 'completed',
    timestamp: '2024-12-24 16:30',
  },
  {
    id: '2',
    type: 'sent',
    to: '0xBa...4f1A',
    amount: 25,
    currency: 'COTTON',
    eurValue: 6125,
    status: 'completed',
    timestamp: '2024-12-23 10:15',
  },
  {
    id: '3',
    type: 'received',
    from: '0x12...34Ab',
    amount: 100,
    currency: 'COTTON',
    eurValue: 24500,
    status: 'completed',
    timestamp: '2024-12-20 14:22',
  },
  {
    id: '4',
    type: 'sent',
    to: '0xCd...9876',
    amount: 15,
    currency: 'COTTON',
    eurValue: 3675,
    status: 'pending',
    timestamp: '2024-12-19 09:45',
  },
  {
    id: '5',
    type: 'received',
    from: '0xEf...5432',
    amount: 75,
    currency: 'COTTON',
    eurValue: 18375,
    status: 'completed',
    timestamp: '2024-12-18 11:30',
  },
];
