import React from 'react';
import { useForm } from 'react-hook-form';

interface CreateCampaignModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onSubmit }) => {
  const { register, handleSubmit } = useForm();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Request New Campaign</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
              <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Token Name</label>
              <input {...register('token_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Token Symbol</label>
              <input {...register('token_symbol')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Token Supply</label>
              <input type="number" {...register('token_supply')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Suggested Price ($)</label>
              <input type="number" step="0.0001" {...register('suggested_price')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="datetime-local" {...register('start_time')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="datetime-local" {...register('end_time')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows={3} />
            </div>

            <div className="col-span-2">
               <label className="block text-sm font-medium text-gray-700">Logo URL</label>
               <input {...register('logo_url')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="https://..." />
            </div>
            
            <div className="col-span-2">
               <label className="block text-sm font-medium text-gray-700">Image URL</label>
               <input {...register('image_url')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="https://..." />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};
