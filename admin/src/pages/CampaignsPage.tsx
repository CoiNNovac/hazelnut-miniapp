import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Campaign } from '../types';
import { Plus } from 'lucide-react';
import { CampaignTable } from '../components/campaigns/CampaignTable';
import { CreateCampaignModal } from '../components/campaigns/CreateCampaignModal';
import { CampaignDetailModal } from '../components/campaigns/CampaignDetailModal';

export const CampaignsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get<Campaign[]>('/campaigns');
      return res.data;
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
      };
      await api.post('/campaigns', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreateModal(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/campaigns/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (selectedCampaign) {
          setSelectedCampaign(null);
      }
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    if (confirm(`Are you sure you want to mark this campaign as ${status}?`)) {
        updateStatusMutation.mutate({ id, status });
    }
  };

  const handleCreateSubmit = (data: any) => {
    createCampaignMutation.mutate(data);
  };

  if (isLoading) return <div>Loading campaigns...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Campaign
        </button>
      </div>

      <CampaignTable 
        campaigns={campaigns || []} 
        onSelectCampaign={setSelectedCampaign} 
        onUpdateStatus={handleStatusUpdate} 
      />

      {showCreateModal && (
        <CreateCampaignModal 
            onClose={() => setShowCreateModal(false)} 
            onSubmit={handleCreateSubmit} 
        />
      )}

      {selectedCampaign && (
        <CampaignDetailModal 
            campaign={selectedCampaign} 
            onClose={() => setSelectedCampaign(null)} 
            onApprove={(id) => handleStatusUpdate(id, 'approved')} 
        />
      )}
    </div>
  );
};
