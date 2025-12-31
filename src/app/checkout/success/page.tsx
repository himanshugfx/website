import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { orderId?: string };
}) {
    const orderId = searchParams.orderId;

    return (
        <div className="checkout-success min-h-screen bg-gradient-to-br from-purple-50 to-white">
            <div className="container mx-auto py-20 px-4">
                <div className="max-w-lg mx-auto text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-14 h-14 text-green-500" />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    {/* Order Details */}
                    {orderId && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Package className="w-6 h-6 text-purple-600" />
                                <span className="font-semibold text-gray-900">Order Details</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">Order ID</div>
                            <div className="font-mono text-lg font-bold text-gray-900 bg-gray-50 py-2 px-4 rounded-lg">
                                #{orderId.slice(0, 12)}...
                            </div>
                        </div>
                    )}

                    {/* What's Next */}
                    <div className="bg-purple-50 rounded-2xl p-6 mb-8 text-left">
                        <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                <span>You'll receive an order confirmation email shortly.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                <span>We'll process your order and prepare it for shipping.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                <span>You'll receive tracking information once your order ships.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/my-account"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                        >
                            Track Your Order
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
