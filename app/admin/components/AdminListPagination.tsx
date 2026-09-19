import Link from "next/link";

export default function AdminListPagination({
  page,
  total,
  totalPages,
  hrefForPage,
}: {
  page: number;
  total: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (total <= 0) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white/70">
      <p className="text-xs text-gray-500 font-medium">
        Page {page} of {totalPages} · {total} records
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          prefetch
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            page <= 1 ? "pointer-events-none opacity-40 border-gray-200 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
        >
          Prev
        </Link>
        {pages.map((n) => (
          <Link
            key={n}
            href={hrefForPage(n)}
            prefetch
            className={`min-w-8 px-2.5 py-1.5 rounded-lg text-xs font-bold border text-center ${
              n === page
                ? "bg-[#5c67b8] text-white border-[#5c67b8]"
                : "border-gray-200 text-gray-700 hover:bg-indigo-50"
            }`}
          >
            {n}
          </Link>
        ))}
        <Link
          href={hrefForPage(Math.min(totalPages, page + 1))}
          prefetch
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            page >= totalPages ? "pointer-events-none opacity-40 border-gray-200 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
