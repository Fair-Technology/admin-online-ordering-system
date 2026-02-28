import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import bgImage from '../../assets/background-image.jpg';

export function Layout() {
  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle darkening overlay so glass text is always readable */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <Sidebar />

      <div className="relative flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto backdrop-blur-xl bg-white/10 border-t border-white/10 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
