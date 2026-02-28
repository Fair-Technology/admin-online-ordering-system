import { useMsal } from '@azure/msal-react';

export function Header() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  return (
    <header className="relative z-10 h-14 backdrop-blur-xl bg-white/8 border-b border-white/15 flex items-center justify-between px-6">
      <div className="text-sm text-white/45">Admin Dashboard</div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex flex-col items-end">
            <span className="text-sm text-white">{user.name ?? user.username}</span>
            <span className="text-xs text-white/35">{user.localAccountId}</span>
          </div>
        )}
        <button
          onClick={() => instance.logoutRedirect()}
          className="text-sm text-white/45 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
