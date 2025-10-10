'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SimplePagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const renderNumbers = () => {
    const items: JSX.Element[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    if (start > 1) {
      items.push(
        <button key={1} onClick={() => go(1)} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">1</button>
      );
      if (start > 2) items.push(<span key="start-ellipsis" className="px-2">…</span>);
    }
    for (let p = start; p <= end; p++) {
      items.push(
        <button
          key={p}
          onClick={() => go(p)}
          className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-gray-50'}`}
        >
          {p}
        </button>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<span key="end-ellipsis" className="px-2">…</span>);
      items.push(
        <button key={totalPages} onClick={() => go(totalPages)} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">{totalPages}</button>
      );
    }
    return items;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => go(page - 1)}
        disabled={!canPrev}
        className={`px-3 py-1 rounded border text-sm ${canPrev ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
      >
        Précédent
      </button>
      {renderNumbers()}
      <button
        onClick={() => go(page + 1)}
        disabled={!canNext}
        className={`px-3 py-1 rounded border text-sm ${canNext ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
      >
        Suivant
      </button>
    </div>
  );
}



