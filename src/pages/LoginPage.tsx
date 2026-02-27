import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Navigate } from 'react-router-dom';
import { loginRequest } from '../auth/msalConfig';

export function LoginPage() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (inProgress !== InteractionStatus.None) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500">Sign in to manage your stores and products.</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => instance.loginRedirect(loginRequest)}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => instance.loginRedirect({ ...loginRequest, prompt: 'create' })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
