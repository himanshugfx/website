import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Privacy Policy</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">Privacy Policy</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 lg:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Introduction</h2>
                            <p className="text-zinc-700 mb-8">
                                At Anose, we are committed to protecting your privacy and ensuring the security of your personal information.
                                This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or
                                purchase our products.
                            </p>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Information We Collect</h3>
                                <p className="text-zinc-700 mb-4">
                                    We collect various types of information to provide and improve our services to you:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-3">
                                    <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
                                    <li><strong>Payment Information:</strong> We process payments through secure third-party providers. We do not store your complete credit card details on our servers.</li>
                                    <li><strong>Usage Data:</strong> Information about how you use our website, including your IP address, browser type, and pages visited.</li>
                                    <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and remember your preferences.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">How We Use Your Information</h3>
                                <p className="text-zinc-700 mb-4">
                                    Your information is used for the following purposes:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-3">
                                    <li>To process and deliver your orders.</li>
                                    <li>To communicate with you about your orders, products, and promotions.</li>
                                    <li>To improve our website functionality and customer service.</li>
                                    <li>To protect against fraud and ensure the security of our website.</li>
                                    <li>To comply with legal obligations.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Data Protection & Security</h3>
                                <p className="text-zinc-700 mb-4">
                                    We implement a variety of security measures to maintain the safety of your personal information.
                                    All sensitive information you supply is transmitted via Secure Socket Layer (SSL) technology and
                                    then encrypted into our payment gateway providers' database.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Third-Party Sharing</h3>
                                <p className="text-zinc-700 mb-4">
                                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties
                                    except for trusted third parties who assist us in operating our website, conducting our business, or
                                    servicing you, so long as those parties agree to keep this information confidential.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Your Rights</h3>
                                <p className="text-zinc-700 mb-4">
                                    You have the right to:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-3">
                                    <li>Access and request a copy of your personal data.</li>
                                    <li>Request correction of any inaccuracies in your personal data.</li>
                                    <li>Request deletion of your personal data, subject to legal requirements.</li>
                                    <li>Opt-out of marketing communications at any time.</li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Changes to This Policy</h3>
                                <p className="text-zinc-700 mb-4">
                                    We may update our Privacy Policy from time to time. Any changes will be posted on this page with
                                    an updated revision date. We encourage you to review this policy periodically.
                                </p>
                            </section>

                            <section className="mb-10 border-t border-zinc-100 pt-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Contact Us</h3>
                                <p className="text-zinc-700">
                                    If you have any questions regarding this Privacy Policy, you may contact our data protection team via{' '}
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
