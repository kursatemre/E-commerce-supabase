export default function ShopLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 space-y-4 animate-pulse">
            <div className="aspect-square bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-6 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
