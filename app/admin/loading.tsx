export default function AdminSectionLoading() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-4 xl:col-span-2">
          <div className="h-64 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
          <div className="h-64 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
          <div className="h-64 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
          <div className="h-48 bg-gray-900 rounded-2xl border border-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
