import React from 'react';
import { Campaign } from '../../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
  onApprove: (id: string) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaign, onClose, onApprove }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
            <div>
                <h3 className="text-sm font-medium text-gray-500">Token Info</h3>
                <p className="mt-1 text-sm text-gray-900">{campaign.token_name} ({campaign.token_symbol})</p>
                <p className="mt-1 text-sm text-gray-900">Supply: {campaign.token_supply}</p>
                <p className="mt-1 text-sm text-gray-900">Price: ${Number(campaign.suggested_price).toFixed(4)}</p>
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                <p className="mt-1 text-sm text-gray-900">Start: {format(new Date(campaign.start_time), 'PPpp')}</p>
                <p className="mt-1 text-sm text-gray-900">End: {format(new Date(campaign.end_time), 'PPpp')}</p>
            </div>
            <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-900">{campaign.description || 'No description provided.'}</p>
            </div>
            {campaign.image_url && (
                <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Image</h3>
                    <img src={campaign.image_url} alt="Campaign" className="w-full h-48 object-cover rounded-lg" />
                </div>
            )}
            {campaign.logo_url && (
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Token Logo</h3>
                    <img src={campaign.logo_url} alt="Logo" className="w-24 h-24 object-contain rounded-lg border" />
                </div>
            )}

            {campaign.token_address && (
                <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Token Address</h3>
                    <p className="mt-1 text-sm font-mono text-gray-900 break-all">{campaign.token_address}</p>
                </div>
            )}

            {campaign.tx_hash && (
                <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Creation Transaction</h3>
                    <p className="mt-1 text-sm font-mono text-gray-900 break-all">{campaign.tx_hash}</p>
                    <a
                        href={`https://testnet.tonscan.org/tx/${campaign.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                        View on TON Scanner →
                    </a>
                </div>
            )}

            <div className="col-span-2 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Token Buyers (Placeholder)</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                    No buyers yet. (Integration with blockchain indexer required)
                </div>
            </div>
        </div>

        <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
             <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Close</button>
             {campaign.status === 'pending' && (
                 <button 
                    onClick={() => onApprove(campaign.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                 >
                    Approve Campaign
                 </button>
             )}
        </div>
      </div>
    </div>
  );
};
