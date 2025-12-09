export default function ProductDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-6 w-40 bg-gray-100 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-8 w-3/4 bg-gray-100 rounded" />
          <div className="h-6 w-1/3 bg-gray-100 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-100 rounded" />
            ))}
          </div>
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}
