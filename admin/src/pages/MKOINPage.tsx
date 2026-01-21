import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mkoinService } from '../lib/mkoinService';
import { Coins, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

export const MKOINPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    message: string;
    tx_hash?: string;
  } | null>(null);

  // Fetch total supply
  const { data: totalSupply } = useQuery({
    queryKey: ['mkoin-total-supply'],
    queryFn: mkoinService.getTotalSupply,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch mint history
  const { data: mintHistory = [] } = useQuery({
    queryKey: ['mkoin-mint-history'],
    queryFn: mkoinService.getMintHistory,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Mint mutation
  const mintMutation = useMutation({
    mutationFn: mkoinService.mintMkoin,
    onSuccess: (data) => {
      setMintResult({
        success: true,
        message: data.message,
        tx_hash: data.tx_hash,
      });
      setRecipient('');
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['mkoin-total-supply'] });
      queryClient.invalidateQueries({ queryKey: ['mkoin-mint-history'] });
    },
    onError: (error: any) => {
      setMintResult({
        success: false,
        message: error.response?.data?.message || 'Minting failed. Please try again.',
      });
    },
  });

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // if (!recipient.startsWith('EQ') && !recipient.startsWith('UQ')) {
    //   alert('Invalid TON address format. Must start with EQ or UQ');
    //   return;
    // }

    mintMutation.mutate({ recipient, amount });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MKOIN Management</h1>
        <p className="text-gray-600">Mint MKOIN stablecoin and track minting history</p>
      </div>

      {/* Total Supply Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total MKOIN Supply</p>
            <p className="text-4xl font-bold">
              {totalSupply?.total_supply || '0'} MKOIN
            </p>
            <p className="text-blue-100 text-xs mt-2">
              {totalSupply?.total_supply_nanocoins || '0'} nanocoins
            </p>
          </div>
          <Coins className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Minting Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-blue-600" />
            Mint MKOIN
          </h2>

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="EQ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={mintMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">TON address starting with EQ or UQ</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (MKOIN)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                step="0.000000001"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={mintMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">1 MKOIN = 1,000,000,000 nanocoins</p>
            </div>

            <button
              type="submit"
              disabled={mintMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {mintMutation.isPending ? 'Minting...' : 'Mint MKOIN'}
            </button>
          </form>

          {/* Mint Result */}
          {mintResult && (
            <div
              className={`mt-4 p-4 rounded-md ${mintResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
                }`}
            >
              <div className="flex items-start">
                {mintResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${mintResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {mintResult.message}
                  </p>
                  {mintResult.tx_hash && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 mb-1">Transaction Hash:</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 break-all">
                        {mintResult.tx_hash}
                      </code>
                      <a
                        href={`https://testnet.tonscan.org/tx/${mintResult.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        View on TON Scanner →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity
          </h2>

          {mintHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No minting history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mintHistory.slice(0, 5).map((mint: any, index: number) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {parseFloat(mint.amount || 0).toLocaleString()} MKOIN
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        To: {mint.recipient_address}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${mint.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {mint.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Minting History Table */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Minting History</h2>

        {mintHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Coins className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No minting transactions yet</p>
            <p className="text-sm mt-2">Minted MKOIN will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    TX Hash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mintHistory.map((mint: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {mint.minted_at ? new Date(mint.minted_at).toLocaleString() : 'Pending'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {mint.recipient_address.substring(0, 8)}...{mint.recipient_address.substring(mint.recipient_address.length - 6)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {parseFloat(mint.amount || 0).toLocaleString()} MKOIN
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${mint.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : mint.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {mint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {mint.tx_hash ? (
                        <a
                          href={`https://testnet.tonscan.org/tx/${mint.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {mint.tx_hash.substring(0, 8)}...
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
