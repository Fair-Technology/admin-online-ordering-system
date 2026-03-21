import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { FloatingActionButton } from './FloatingActionButton';

export function Layout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <TopNav />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex flex-col flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <FloatingActionButton />
    </div>
  );
}
