import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Under Maintenance',
  description: 'Anose is currently undergoing scheduled maintenance. We will be back shortly.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-[var(--surface)]">
      <Image
        src="/assets/images/anose-logo.webp"
        alt="Anose"
        width={160}
        height={60}
        priority
        className="h-auto w-36 mb-10"
      />
      <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest">
        Scheduled Maintenance
      </span>
      <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-5 tracking-tight">
        We&rsquo;ll be back soon
      </h1>
      <p className="text-zinc-500 max-w-md mx-auto mb-10 leading-relaxed">
        Our website is currently undergoing maintenance to serve you better.
        Thank you for your patience &mdash; please check back shortly.
      </p>
      <div className="text-sm text-zinc-600 space-y-1">
        <p>Need help in the meantime?</p>
        <p>
          <a href="mailto:wecare@anosebeauty.com" className="font-semibold text-zinc-900 hover:text-purple-600">
            wecare@anosebeauty.com
          </a>
          {' · '}
          <a href="tel:+919110134408" className="font-semibold text-zinc-900 hover:text-purple-600">
            +91 91101 34408
          </a>
        </p>
      </div>
    </main>
  );
}
