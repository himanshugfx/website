import Link from 'next/link';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Terms of Service</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">Terms of Service</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 lg:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Agreement to Terms</h2>
                            <p className="text-zinc-700 mb-8">
                                By accessing or using the Anose website, you agree to be bound by these Terms of Service and all applicable
                                laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                                accessing this site.
                            </p>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">1. Use License</h3>
                                <p className="text-zinc-700 mb-4">
                                    Permission is granted to temporarily download one copy of the materials (information or software) on
                                    Anose's website for personal, non-commercial transitory viewing only.
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-3">
                                    <li>Modify or copy the materials.</li>
                                    <li>Use the materials for any commercial purpose, or for any public display.</li>
                                    <li>Attempt to decompile or reverse engineer any software contained on Anose's website.</li>
                                    <li>Remove any copyright or other proprietary notations from the materials.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">2. Product Descriptions & Pricing</h3>
                                <p className="text-zinc-700 mb-4">
                                    We strive to provide accurate information regarding our products, including descriptions and pricing.
                                    However, we do not warrant that product descriptions or other content are accurate, complete, reliable,
                                    current, or error-free. We reserve the right to correct any errors, inaccuracies, or omissions and to
                                    change or update information at any time without prior notice.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">3. User Accounts</h3>
                                <p className="text-zinc-700 mb-4">
                                    If you create an account on our website, you are responsible for maintaining the confidentiality of
                                    your account and password and for restricting access to your computer. You agree to accept
                                    responsibility for all activities that occur under your account or password.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">4. Limitations</h3>
                                <p className="text-zinc-700 mb-4">
                                    In no event shall Anose or its suppliers be liable for any damages (including, without limitation,
                                    damages for loss of data or profit, or due to business interruption) arising out of the use or
                                    inability to use the materials on Anose's website.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">5. Governing Law</h3>
                                <p className="text-zinc-700 mb-4">
                                    These terms and conditions are governed by and construed in accordance with the laws of India and
                                    you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                                </p>
                            </section>

                            <section className="mb-10 border-t border-zinc-100 pt-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Contact Us</h3>
                                <p className="text-zinc-700">
                                    If you have any questions about these Terms of Service, please contact us at{' '}
                                    <Link href="/contact" className="text-purple-600 hover:underline">our contact page</Link>.
                                </p>
                                <p className="text-zinc-500 text-sm mt-6 italic">
                                    Last Updated: January 6, 2026
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
