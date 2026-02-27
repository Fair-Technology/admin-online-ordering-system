import { useMsal } from '@azure/msal-react';

export function Header() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="text-sm text-gray-500">
        {/* Breadcrumb placeholder */}
        Admin Dashboard
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-700">{user.name ?? user.username}</span>
        )}
        <button
          onClick={() => instance.logoutRedirect()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
