export interface User {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'farmer';
  address: string;
  name?: string;
  is_disabled?: boolean;
  created_at?: string;
}

export interface Campaign {
  id: string;
  farmer_id: string;
  name: string;
  description?: string;
  token_name: string;
  token_symbol: string;
  token_supply: string;
  logo_url?: string;
  image_url?: string;
  start_time: string;
  end_time: string;
  suggested_price: string;
  status: 'pending' | 'running' | 'paused' | 'finished' | 'rejected' | 'cancelled' | 'approved';
  token_address?: string;
  tx_hash?: string;
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    address: string;
  };
}

export interface MintMkoinRequest {
  recipient: string;
  amount: string;
}

export interface MintMkoinResponse {
  success: boolean;
  tx_hash?: string;
  message: string;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balance_nanocoins: string;
  token_address?: string;
}

export interface MkoinMint {
  id: string;
  recipient_address: string;
  amount: string;
  tx_hash?: string;
  minted_by: string;
  status: string;
  minted_at?: string;
  confirmed_at?: string;
}
