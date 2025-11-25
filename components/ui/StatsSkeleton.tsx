'use client';

export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
          <div className="h-8 bg-gray-200 rounded-lg mb-2 w-24 mx-auto animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        </div>
      ))}
    </div>
  );
}

