'use client';

export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200" />
        <div className="absolute top-3 left-3">
          <div className="h-6 w-20 bg-gray-300 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full mr-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

