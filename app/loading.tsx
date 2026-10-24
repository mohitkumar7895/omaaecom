export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center w-full py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-[#6069c9]/25 border-t-[#6069c9] rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Loading...</p>
      </div>
    </div>
  );
}
