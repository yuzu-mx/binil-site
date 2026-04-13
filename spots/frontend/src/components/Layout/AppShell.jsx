import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  return (
    <div className="h-full flex flex-col bg-spots-bg">
      <main className="flex-1 overflow-hidden relative">{children}</main>
      <BottomNav />
    </div>
  );
}
