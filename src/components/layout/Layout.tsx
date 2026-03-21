import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { FloatingActionButton } from './FloatingActionButton';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex flex-col flex-1 p-6">
        <Outlet />
      </main>
      <FloatingActionButton />
    </div>
  );
}
