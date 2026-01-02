import { useState } from 'react';
import { useProfits, useClaimProfit } from '@/hooks/useProfits';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ProfitsPage() {
  const { data: profits, isLoading } = useProfits();
  const claimProfit = useClaimProfit();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (profitId: string) => {
    setClaimingId(profitId);
    try {
      await claimProfit.mutateAsync(profitId);
      alert('Profit claimed successfully!');
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Failed to claim profit. Please try again.');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 p-4 flex items-center justify-center">
        <div className="text-white/50">Loading profits...</div>
      </div>
    );
  }

  const totalProfits = profits?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const claimedProfits = profits?.filter(p => p.claimedAt).reduce((sum, p) => sum + p.amount, 0) || 0;
  const unclaimedProfits = totalProfits - claimedProfits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">Profits</h1>
          <p className="text-white/70">Track and claim your earnings</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Total Profits</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalProfits)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Claimed</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(claimedProfits)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Available</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(unclaimedProfits)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Profits List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Profit History</h2>
          {profits && profits.length > 0 ? (
            <div className="space-y-4">
              {profits.map((profit) => (
                <Card key={profit.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-lg font-bold text-white">{formatCurrency(profit.amount)}</p>
                          {profit.claimedAt ? (
                            <Badge variant="default" className="bg-green-500 text-white">Claimed</Badge>
                          ) : (
                            <Badge variant="default" className="bg-yellow-500 text-white">Available</Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/70">
                          {profit.claimedAt ? `Claimed on ${formatDateTime(profit.claimedAt)}` : `Available since ${formatDateTime(profit.createdAt)}`}
                        </p>
                        {profit.txHash && (
                          <p className="text-xs text-white/50 mt-1">
                            TX: {profit.txHash}
                          </p>
                        )}
                      </div>
                      {!profit.claimedAt && (
                        <Button
                          variant="default"
                          onClick={() => handleClaim(profit.id)}
                          disabled={!!claimingId}
                        >
                          {claimingId === profit.id ? 'Claiming...' : 'Claim'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-2">No Profits Yet</h3>
                <p className="text-white/70">Profits will appear here once your investments start generating returns</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
