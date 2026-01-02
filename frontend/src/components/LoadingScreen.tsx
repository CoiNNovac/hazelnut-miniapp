export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-primary/20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🌰</div>
        <p className="text-white/70 text-lg">Loading...</p>
      </div>
    </div>
  );
}
