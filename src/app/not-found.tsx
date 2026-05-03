import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl md:text-8xl font-black text-purple-600 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">Page Not Found</h2>
      <p className="text-zinc-500 mb-8 max-w-md mx-auto">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      <Link 
        href="/" 
        className="bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1"
      >
        Return to Home
      </Link>
    </div>
  );
}
