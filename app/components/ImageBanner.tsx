type ImageBannerProps = {
  title: string;
  subtitle: string;
};

export default function ImageBanner({ title, subtitle }: ImageBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8 my-8">
      <div className="w-full h-80 bg-[#1e293b] rounded-3xl overflow-hidden relative shadow-lg flex items-center justify-end px-16 text-right">
        {/* Abstract Background Placeholder (Since no real image) */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-black pointer-events-none"></div>
        
        {/* Placeholder text for the large image banner */}
        <div className="relative z-10 max-w-md text-white">
           <h2 className="text-4xl font-bold mb-4 leading-tight">{title}</h2>
           <p className="text-xl text-blue-200">{subtitle}</p>
        </div>
        
        {/* Visual cue that it's an image area */}
        <div className="absolute left-16 bottom-0 opacity-10 text-9xl pointer-events-none">
          📸
        </div>
      </div>
    </div>
  );
}
