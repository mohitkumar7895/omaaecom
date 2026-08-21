import Link from "next/link";

export default function HomeCategories({ categories }: { categories: any[] }) {
  // Mapping titles to the emojis requested by the user
  const getIcon = (title: string) => {
    if (title.includes("Ac Repair")) return "❄️";
    if (title.includes("Refrigerator")) return "🧊";
    if (title.includes("Washing")) return "👕";
    if (title.includes("Microwave")) return "♨️";
    if (title.includes("Water Purifier")) return "🚰";
    if (title.includes("Product")) return "📦";
    if (title.includes("AMC")) return "🛡️";
    return "🔧";
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Home Services...
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {categories.map((cat) => (
          <Link href={`/category/${cat.id}`} key={cat.id} className="flex flex-col items-center group">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-4xl group-hover:shadow-md group-hover:border-blue-100 transition-all transform group-hover:-translate-y-1 overflow-hidden p-2">
              {cat.image_url && cat.image_url.length > 5 ? (
                <img src={cat.image_url} alt={cat.title} className="w-full h-full object-contain" />
              ) : (
                <span>{getIcon(cat.title)}</span>
              )}
            </div>
            <span className="mt-3 text-center text-sm font-semibold text-gray-800 leading-tight">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
