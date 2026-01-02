import Link from 'next/link';

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">Shipping Policy</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">Shipping Policy</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 lg:p-12">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Shipping Information</h2>
                            
                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Delivery Time</h3>
                                <p className="text-zinc-700 mb-4">
                                    We aim to process and ship all orders within 2-3 business days. Once your order is shipped, 
                                    delivery typically takes 5-7 business days for standard shipping, depending on your location.
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Standard Shipping: 5-7 business days</li>
                                    <li>Express Shipping: 2-3 business days (additional charges apply)</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Shipping Charges</h3>
                                <p className="text-zinc-700 mb-4">
                                    Shipping charges are calculated based on the weight of your order and delivery location:
                                </p>
                                <ul className="list-disc list-inside text-zinc-700 space-y-2">
                                    <li>Orders above ₹199: Free shipping</li>
                                    <li>Orders below ₹199: ₹49 shipping charges</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Order Tracking</h3>
                                <p className="text-zinc-700 mb-4">
                                    Once your order is shipped, you will receive a tracking number via email. You can use this 
                                    tracking number to monitor your shipment&apos;s progress on our website or the courier&apos;s website.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Delivery Areas</h3>
                                <p className="text-zinc-700 mb-4">
                                    We currently ship to all major cities and towns across India. For remote locations, 
                                    delivery may take additional time. Please contact us if you have any questions about 
                                    delivery to your area.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Failed Delivery</h3>
                                <p className="text-zinc-700 mb-4">
                                    If delivery fails due to incorrect address, recipient not available, or other reasons, 
                                    the package will be returned to us. A re-delivery fee may apply for reshipping the order.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-zinc-900 mb-4">Contact Us</h3>
                                <p className="text-zinc-700">
                                    If you have any questions about our shipping policy, please contact us at{' '}
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

