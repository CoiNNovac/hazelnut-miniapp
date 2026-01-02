import { useParams, useNavigate } from 'react-router-dom';
import { mockTokens } from '@/lib/mockData';
import RoadmapTimeline from '@/components/RoadmapTimeline';
import FAQAccordion from '@/components/FAQAccordion';
import TokenDistributionChart from '@/components/TokenDistributionChart';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/Button';

export default function TokenDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = mockTokens.find((t) => t.id === id);

  if (!token) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <p className="text-white">Token not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-white hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-white">{token.name}</h1>

          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            Us
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Roadmap Section */}
        {token.roadmap && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Roadmap</h2>
            <div className="bg-dark-card rounded-2xl p-6">
              <RoadmapTimeline roadmap={token.roadmap} />
            </div>
          </section>
        )}

        {/* Whitepaper Section */}
        {token.whitepaperUrl && (
          <section>
            <div className="bg-dark-card rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Whitepaper</h3>
              <p className="text-sm text-text-muted mb-4">Download detailed project documentation</p>
              <Button variant="secondary" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Whitepaper
              </Button>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {token.faq && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
            <FAQAccordion items={token.faq} />
          </section>
        )}

        {/* Token Issuer Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Token Issuer</h2>
          <div className="bg-dark-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{token.issuer.name}</h3>
              {token.issuer.verified && (
                <span className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded-full">
                  Verified Producer
                </span>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-text-muted">Farm Address:</span>
                <p className="text-white mt-1">{token.issuer.location}</p>
              </div>

              {token.issuer.experience && (
                <div>
                  <span className="text-text-muted">Experience:</span>
                  <p className="text-white mt-1">{token.issuer.experience}</p>
                </div>
              )}

              {token.issuer.license && (
                <div>
                  <span className="text-text-muted">Agricultural License:</span>
                  <p className="text-white mt-1 font-mono">{token.issuer.license}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Join Telegram Channel */}
        {token.telegramChannel && (
          <section>
            <div className="bg-blue-accent/10 border border-blue-accent/20 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Join Official Channel</h3>
                  <p className="text-sm text-white/60">{token.telegramChannel}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Investment Stats */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Investment</h2>
          <div className="space-y-4">
            <div className="bg-dark-card rounded-2xl p-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-white">125.5</span>
                <span className="text-xl text-text-muted">{token.symbol}</span>
              </div>
              <p className="text-text-muted mb-3">≈ €30,747.50</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-muted">Your share:</span>
                <span className="text-white font-semibold">1.26%</span>
              </div>
            </div>

            <StatCard
              title="Target Yearly Yield"
              value="10%"
              variant="success"
              className="text-center"
            />
          </div>
        </section>

        {/* Investment Return Overview */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Investment Return</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Received" value="€629.20" />
              <StatCard title="Investment Returned" value="2.0%" variant="primary" />
            </div>

            {token.yearlyYields && token.yearlyYields.length > 0 && (
              <div className="bg-dark-card rounded-2xl p-6">
                {token.yearlyYields.map((year, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-white">{year.year}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-text-muted">Target Yield</span>
                        <p className="text-lg font-bold text-white">{year.targetYield}%</p>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted">Actual Yield</span>
                        <p className="text-lg font-bold text-success">{year.actualYield}%</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">Distributions</h4>
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
                    <span className="text-sm text-white">Q4 Harvest Distribution</span>
                    <span className="text-sm font-bold text-success">+€201.90</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Token Distribution Chart */}
        {token.distribution && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Token Distribution</h2>
            <div className="bg-dark-card rounded-2xl p-6">
              <TokenDistributionChart distribution={token.distribution} />
            </div>
          </section>
        )}
      </div>

      {/* Fixed Bottom Token Card */}
      <div className="fixed bottom-16 left-0 right-0 bg-dark/95 backdrop-blur-md border-t border-white/10 p-4 z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-dark-card rounded-xl flex items-center justify-center text-2xl">
              {token.logo}
            </div>
            <div>
              <p className="font-semibold text-white">{token.symbol}</p>
              <p className="text-sm text-text-muted">€{token.price}</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/trade/${token.id}`)}>Buy Now</Button>
        </div>
      </div>
    </div>
  );
}
