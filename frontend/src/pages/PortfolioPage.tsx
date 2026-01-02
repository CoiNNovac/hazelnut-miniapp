import { Link } from 'react-router-dom';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 p-4 flex items-center justify-center">
        <div className="text-white/50">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Investments Yet</h2>
            <p className="text-white/70 mb-6">Start investing in agricultural tokens to build your portfolio</p>
            <Link to="/tokens">
              <Button variant="default" size="lg">
                Browse Tokens
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-white/70">Track your investments and returns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-white">{formatCurrency(portfolio.totalInvested)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Current Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Total Profit</p>
              <p className={`text-xl font-bold ${portfolio.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(portfolio.totalProfit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-white/70 mb-1">Profit %</p>
              <p className={`text-xl font-bold ${portfolio.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(portfolio.profitPercentage)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Holdings</h2>
          <div className="space-y-4">
            {portfolio.holdings.map((holding) => (
              <Card key={holding.token.id} className="hover:bg-white/15 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{holding.token.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{holding.token.name}</CardTitle>
                        <p className="text-sm text-white/70">{holding.token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">APY</p>
                      <p className="text-lg font-bold text-green-400">{holding.token.apy}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-white/70 mb-1">Amount</p>
                      <p className="text-sm font-medium text-white">{holding.amount} {holding.token.symbol}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">Invested</p>
                      <p className="text-sm font-medium text-white">{formatCurrency(holding.invested)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">Current Value</p>
                      <p className="text-sm font-medium text-white">{formatCurrency(holding.currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">Profit</p>
                      <p className={`text-sm font-medium ${holding.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(holding.profit)} ({formatPercentage(holding.profitPercentage)})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
