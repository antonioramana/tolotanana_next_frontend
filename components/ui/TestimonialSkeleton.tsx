'use client';

export default function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
        </div>
        <div className="ml-4 flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
    </div>
  );
}

