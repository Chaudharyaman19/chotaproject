export default function Loading() {
  return (
    <div className="py-16 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading stylish products...</p>
      </div>
    </div>
  );
}
