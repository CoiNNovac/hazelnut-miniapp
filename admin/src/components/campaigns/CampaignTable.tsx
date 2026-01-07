import React from 'react';
import { Campaign } from '../../types';
import { Eye, Check, X, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignTableProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, onSelectCampaign, onUpdateStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timing</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Supply</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">{campaign.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{campaign.token_symbol}</div>
                <div className="text-xs text-gray-500">{campaign.token_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-xs text-gray-500">
                  Start: {format(new Date(campaign.start_time), 'MMM d, yyyy')}
                 </div>
                 <div className="text-xs text-gray-500">
                  End: {format(new Date(campaign.end_time), 'MMM d, yyyy')}
                 </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${Number(campaign.suggested_price).toFixed(2)}</div>
                <div className="text-xs text-gray-500">Supply: {campaign.token_supply}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => onSelectCampaign(campaign)}
                    className="text-gray-600 hover:text-gray-900"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {campaign.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(campaign.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(campaign.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {campaign.status === 'approved' && (
                      <button 
                        onClick={() => onUpdateStatus(campaign.id, 'running')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Start Running"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                  )}

                  {campaign.status === 'running' && (
                      <button 
                        onClick={() => onUpdateStatus(campaign.id, 'paused')}
                        className="text-orange-600 hover:text-orange-900"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
