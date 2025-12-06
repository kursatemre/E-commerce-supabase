export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-gray-300">Sayfa yükleniyor, lütfen bekleyin…</p>
      </div>
    </div>
  )
}
