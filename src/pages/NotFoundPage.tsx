import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-7xl font-black text-amber-400">404</h1>
        <p className="mt-2 text-xl font-semibold text-slate-800">Page not found</p>
        <p className="mt-1 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
