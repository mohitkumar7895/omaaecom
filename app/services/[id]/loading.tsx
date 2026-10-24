export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full bg-white min-h-screen pb-24 px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 animate-pulse">
      {/* Breadcrumb & Title skeleton */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <div className="h-3 w-36 bg-gray-200 rounded mb-3"></div>
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Main Layout skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Subcategories Sidebar */}
        <div className="lg:w-[320px] flex-shrink-0">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex lg:flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 lg:flex-none flex items-center gap-3 p-2 bg-white rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="hidden lg:block flex-1">
                  <div className="h-3.5 w-24 bg-gray-200 rounded mb-1.5"></div>
                  <div className="h-2.5 w-16 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Services List Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex justify-between gap-4 shadow-xs">
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-100 rounded"></div>
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="w-24 sm:w-32 aspect-square bg-gray-100 rounded-xl shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
