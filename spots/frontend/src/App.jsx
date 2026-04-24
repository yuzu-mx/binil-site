import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './components/Layout/AppShell';
import LoginScreen from './components/Auth/LoginScreen';
import MapView from './components/Map/MapView';
import ImportUrl from './components/Import/ImportUrl';
import ListsView from './components/Lists/ListsView';
import ListDetail from './components/Lists/ListDetail';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-spots-cream">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse-dot">📍</div>
          <p className="text-spots-dark font-bold text-lg">Spots</p>
          <p className="text-spots-muted text-sm mt-1">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/add" element={<ImportUrl />} />
        <Route path="/lists" element={<ListsView />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
