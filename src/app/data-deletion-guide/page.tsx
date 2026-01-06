import Link from 'next/link';

export default function DataDeletionGuidePage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Data Deletion Guide</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">Data Deletion Guide</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 lg:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">How to Request Data Deletion</h2>
                            <p className="text-zinc-700 mb-8">
                                At Anose, we respect your right to privacy and give you full control over your personal data.
                                If you wish to delete your account and all associated data, please follow the instructions below.
                            </p>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Option 1: Request via Your Profile (Recommended)</h3>
                                <p className="text-zinc-700 mb-4">
                                    The fastest way to request data deletion is directly through your account dashboard:
                                </p>
                                <ol className="list-decimal list-inside text-zinc-700 space-y-3">
                                    <li>Log in to your Anose account.</li>
                                    <li>Click on <strong>&quot;My Account&quot;</strong> in the navigation menu.</li>
                                    <li>Scroll down to the <strong>&quot;Privacy & Security&quot;</strong> section.</li>
                                    <li>Click on the <strong>&quot;Request Data Deletion&quot;</strong> button.</li>
                                    <li>Confirm your request in the popup modal.</li>
                                </ol>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Option 2: Contact Support</h3>
                                <p className="text-zinc-700 mb-4">
                                    If you cannot access your account, you can send a deletion request to our support team:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-3">
                                    <li>Go to our <Link href="/contact" className="text-purple-600 hover:underline">Contact Page</Link>.</li>
                                    <li>Select &quot;Data Privacy Request&quot; from the subject menu.</li>
                                    <li>Provide the email address associated with your account.</li>
                                    <li>Our team will process your request within 5-7 business days.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">What Data is Deleted?</h3>
                                <p className="text-zinc-700 mb-4">
                                    When your deletion request is processed, the following information will be permanently removed:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Your profile information (name, email, phone number)</li>
                                    <li>Your shipping and billing addresses</li>
                                    <li>Your order history (anonymized for tax/legal records)</li>
                                    <li>Your wishlist and saved preferences</li>
                                </ul>
                                <p className="text-amber-600 text-sm mt-4 font-medium italic">
                                    Note: We are legally required to retain certain transaction records for tax and accounting purposes.
                                </p>
                            </section>

                            <section className="mb-10 border-t border-zinc-100 pt-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Questions?</h3>
                                <p className="text-zinc-700">
                                    If you have any questions about our data retention policies, please reach out via{' '}
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
