export default function Pagination({ page, total, limit = 10, onChange }) {
  const pages = Math.ceil(total / limit);

  if (pages <= 1) return null; // no pagination needed

  // limit visible buttons (window)
  const maxVisible = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6 select-none">
      {/* Prev Button */}
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`px-3 py-1.5 rounded-lg text-sm transition 
          ${
            page === 1
              ? "bg-[#1f1f1f] text-gray-600 cursor-not-allowed"
              : "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300"
          }`}
      >
        ← Prev
      </button>

      {/* Page Buttons */}
      {start > 1 && (
        <>
          <PageBtn num={1} page={page} onChange={onChange} />
          <span className="text-gray-500 text-xs">…</span>
        </>
      )}

      {[...Array(end - start + 1)].map((_, i) => (
        <PageBtn
          key={i}
          num={start + i}
          page={page}
          onChange={onChange}
        />
      ))}

      {end < pages && (
        <>
          <span className="text-gray-500 text-xs">…</span>
          <PageBtn num={pages} page={page} onChange={onChange} />
        </>
      )}

      {/* Next Button */}
      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className={`px-3 py-1.5 rounded-lg text-sm transition 
          ${
            page === pages
              ? "bg-[#1f1f1f] text-gray-600 cursor-not-allowed"
              : "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300"
          }`}
      >
        Next →
      </button>
    </div>
  );
}

function PageBtn({ num, page, onChange }) {
  const active = page === num;
  return (
    <button
      onClick={() => onChange(num)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#ff6b00] to-[#ff8800] text-black shadow-lg scale-105"
          : "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-200 hover:scale-105"
      }`}
    >
      {num}
    </button>
  );
}
