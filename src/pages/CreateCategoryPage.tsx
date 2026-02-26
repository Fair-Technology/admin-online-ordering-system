import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateCategoryMutation } from '../store/api/categoriesApi';

export function CreateCategoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [createCategory, { isLoading, isError, error }] = useCreateCategoryMutation();

  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        shopId: shopId!,
        body: { name, sortOrder: sortOrder ? Number(sortOrder) : undefined },
      }).unwrap();
      navigate(`/shops/${shopId}/categories`);
    } catch {
      // error shown below
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Category</h1>
      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {(error as { data?: { error?: string } })?.data?.error ?? 'Failed to create category.'}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}
