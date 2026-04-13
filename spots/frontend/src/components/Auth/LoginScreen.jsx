import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-spots-cream px-8">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">📍</div>
        <h1 className="text-5xl font-bold text-spots-dark tracking-tight mb-3">
          Spots
        </h1>
        <p className="text-spots-muted text-base leading-relaxed max-w-xs mx-auto">
          Guarda los lugares de tus reels y TikToks favoritos en tu mapa personal
        </p>
      </div>

      {/* Feature highlights */}
      <div className="w-full max-w-xs space-y-4 mb-10">
        <div className="flex items-center gap-3 bg-spots-surface rounded-2xl p-3">
          <span className="text-2xl">🔗</span>
          <p className="text-spots-dark text-sm">Pega un link y encontramos el lugar</p>
        </div>
        <div className="flex items-center gap-3 bg-spots-surface rounded-2xl p-3">
          <span className="text-2xl">🗺️</span>
          <p className="text-spots-dark text-sm">Lo agregamos a tu mapa personal</p>
        </div>
        <div className="flex items-center gap-3 bg-spots-surface rounded-2xl p-3">
          <span className="text-2xl">📋</span>
          <p className="text-spots-dark text-sm">Organiza tus spots en boards</p>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-spots-dark text-spots-cream font-semibold py-3.5 px-6 rounded-2xl hover:bg-spots-dark-light transition-colors active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#FFFAE8"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#46DDAE"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FFD34A"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#46DDAE"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>
      </div>

      <p className="text-spots-muted-light text-xs mt-6 text-center">
        Al continuar, aceptas los terminos de uso
      </p>
    </div>
  );
}
