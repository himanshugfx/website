import Link from 'next/link';
import { Clock, RefreshCw } from 'lucide-react';

export default function CheckoutPendingPage({
    searchParams,
}: {
    searchParams: { orderId?: string };
}) {
    const orderId = searchParams.orderId;

    return (
        <div className="checkout-pending min-h-screen bg-gradient-to-br from-amber-50 to-white">
            <div className="container mx-auto py-20 px-4">
                <div className="max-w-lg mx-auto text-center">
                    {/* Pending Icon */}
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Clock className="w-14 h-14 text-amber-500" />
                    </div>

                    {/* Pending Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Payment Pending
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your payment is being processed. This may take a few moments.
                    </p>

                    {/* Order Details */}
                    {orderId && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                            <div className="text-sm text-gray-500 mb-2">Order ID</div>
                            <div className="font-mono text-lg font-bold text-gray-900 bg-gray-50 py-2 px-4 rounded-lg">
                                #{orderId.slice(0, 12)}...
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-left border border-amber-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-amber-600" />
                            What should I do?
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Do not refresh or close this page.</li>
                            <li>• Wait for the payment confirmation from your bank.</li>
                            <li>• If the payment fails, you can try again from your account.</li>
                            <li>• Contact support if the issue persists.</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/my-account"
                            className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold"
                        >
                            Check Order Status
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Go to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
