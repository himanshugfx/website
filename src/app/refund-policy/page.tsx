import Link from 'next/link';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Refund Policy</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">Refund Policy</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 lg:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Refund & Return Policy</h2>
                            
                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Return Eligibility</h3>
                                <p className="text-zinc-700 mb-4">
                                    You can return products within 7 days of delivery for a full refund or exchange, 
                                    provided the items are:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Unused and in original condition</li>
                                    <li>In original packaging with all tags and labels attached</li>
                                    <li>Not damaged or altered in any way</li>
                                    <li>Accompanied by the original invoice</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Non-Returnable Items</h3>
                                <p className="text-zinc-700 mb-4">
                                    The following items cannot be returned:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Products that have been used or opened</li>
                                    <li>Personalized or customized items</li>
                                    <li>Items damaged due to misuse</li>
                                    <li>Products without original packaging</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Return Process</h3>
                                <ol className="list-decimal list-inside text-zinc-700 space-y-2">
                                    <li>Log in to your account and go to &quot;My Account&quot; → &quot;Order History&quot;</li>
                                    <li>Select the completed order you wish to return</li>
                                    <li>Click on &quot;Request Return&quot; and provide a reason</li>
                                    <li>Wait for approval from our team (usually within 24-48 hours)</li>
                                    <li>Once approved, you will receive return instructions</li>
                                    <li>Ship the product back to us using the provided return address</li>
                                </ol>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Refund Processing</h3>
                                <p className="text-zinc-700 mb-4">
                                    Once we receive and inspect the returned product:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Refunds will be processed within 5-7 business days</li>
                                    <li>Refunds will be issued to the original payment method</li>
                                    <li>For cash on delivery orders, refunds will be processed via bank transfer</li>
                                    <li>Shipping charges are non-refundable unless the product is defective or wrong item was shipped</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cancellation Policy</h3>
                                <p className="text-zinc-700 mb-4">
                                    You can cancel your order before it is shipped. For completed orders, you can request 
                                    cancellation through your account. Cancellation requests are subject to approval.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Defective or Wrong Items</h3>
                                <p className="text-zinc-700 mb-4">
                                    If you receive a defective product or wrong item, please contact us immediately. 
                                    We will arrange for a free return pickup and provide a full refund or replacement 
                                    at no additional cost.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Contact Us</h3>
                                <p className="text-zinc-700">
                                    For any questions about returns or refunds, please contact us at{' '}
                                    <Link href="/contact" className="text-purple-600 hover:underline">our contact page</Link>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

