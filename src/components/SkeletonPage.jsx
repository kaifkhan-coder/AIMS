// components/SkeletonPage.jsx
export default function SkeletonPage() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/3"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="h-40 bg-slate-800 rounded-xl"></div>
        <div className="h-40 bg-slate-800 rounded-xl"></div>
        <div className="h-40 bg-slate-800 rounded-xl"></div>
        <div className="h-40 bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}