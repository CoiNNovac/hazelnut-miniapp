import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { User } from '../types';
import { Plus, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<User[]>('/admin/users');
      return res.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (newUser: any) => {
      await api.post('/admin/users', newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      reset();
    },
  });

  const disableUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/admin/users/${id}/disable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const onSubmit = (data: any) => {
    createUserMutation.mutate(data);
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {user.address.substring(0, 6)}...{user.address.slice(-4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_disabled ? (
                    <span className="text-red-600 flex items-center text-sm"><Ban className="w-3 h-3 mr-1"/> Disabled</span>
                  ) : (
                    <span className="text-green-600 flex items-center text-sm"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => disableUserMutation.mutate(user.id)}
                    className="text-orange-600 hover:text-orange-900 mr-4"
                    title="Disable User"
                    disabled={user.is_disabled}
                  >
                    Disable
                  </button>
                  <button 
                    onClick={() => {
                        if(confirm('Are you sure you want to delete this user?')) {
                            deleteUserMutation.mutate(user.id)
                        }
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input {...register('username')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" {...register('password')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select {...register('role')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                  <option value="farmer">Farmer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Address (Optional)</label>
                <input {...register('address')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="0x..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
