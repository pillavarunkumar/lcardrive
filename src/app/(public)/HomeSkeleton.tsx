export default function HomeSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading homepage">
      {/* Hero */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto text-center">
          <div className="h-12 md:h-14 bg-gray-200 rounded-xl max-w-3xl mx-auto mb-6" />
          <div className="h-5 bg-gray-100 rounded-lg max-w-2xl mx-auto mb-12" />
          <div className="max-w-4xl mx-auto">
            <div className="h-20 bg-gray-100 rounded-[20px] border border-gray-200 mb-6" />
            <div className="flex flex-wrap justify-center gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-8 w-32 bg-gray-100 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI match banner */}
      <section className="py-10 md:py-14 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto h-64 md:h-80 bg-gray-100 rounded-3xl" />
      </section>

      {/* Featured instructors */}
      <section className="py-10 md:py-14 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="mb-8 space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded-lg" />
            <div className="h-5 w-96 max-w-full bg-gray-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border border-gray-200 rounded-[20px] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="h-9 w-full bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
