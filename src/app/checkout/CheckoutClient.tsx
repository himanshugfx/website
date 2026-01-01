'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { CreditCard, Truck, Smartphone, Loader2, CheckCircle } from 'lucide-react';

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: Record<string, unknown>;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
    }
}

export default function CheckoutClient() {
    const { cart, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Promo Code State
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        discountAmount: number;
        type: string;
    } | null>(null);
    const [applyingPromo, setApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'India',
        city: '',
        postalCode: '',
        address: '',
        notes: '',
    });

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-block md:py-20 py-12">
                <div className="container mx-auto text-center">
                    <div className="heading3">Your cart is empty</div>
                    <p className="body1 text-secondary mt-4">You cannot checkout with an empty cart.</p>
                    <Link href="/shop" className="button-main bg-purple-600 text-white px-10 py-3 rounded-full inline-block mt-8 hover:bg-purple-700 duration-300">
                        Go To Shop
                    </Link>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email ||
            !shippingInfo.phone || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.address) {
            setError('Please fill in all required fields');
            return false;
        }
        return true;
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return;
        setApplyingPromo(true);
        setPromoError('');

        try {
            const res = await fetch('/api/users/apply-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCodeInput,
                    cartTotal,
                    userId: session?.user?.email
                }),
            });

            const data = await res.json();

            if (data.success) {
                setAppliedPromo({
                    code: data.code,
                    discountAmount: data.discountAmount,
                    type: data.type
                });
                setPromoError('');
            } else {
                setPromoError(data.error || 'Failed to apply code');
                setAppliedPromo(null);
            }
        } catch (err) {
            console.error(err);
            setPromoError('Something went wrong. Please try again.');
        } finally {
            setApplyingPromo(false);
        }
    };

    const handlePlaceOrder = async () => {
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (paymentMethod === 'razorpay') {
                const res = await loadRazorpay();

                if (!res) {
                    setError('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                // Initiate Razorpay payment order
                const response = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cart: cart.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingInfo,
                        userId: session?.user?.id || null,
                        total: appliedPromo ? cartTotal - appliedPromo.discountAmount : cartTotal,
                        promoCode: appliedPromo?.code || null,
                        discountAmount: appliedPromo?.discountAmount || 0,
                        paymentMethod: 'razorpay'
                    }),
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.error || 'Failed to initiate payment');
                    setLoading(false);
                    return;
                }

                // If mock payment (no keys configured)
                if (data.key === 'mock_key') {
                    // Simulate success for mock
                    clearCart();
                    window.location.href = `/checkout/success?orderId=${data.orderId}&orderNumber=${data.orderNumber}`;
                    return;
                }

                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Anose",
                    description: "Order Payment",
                    // image: "/logo.png", // Add your logo here
                    order_id: data.razorpayOrderId,
                    handler: async function (response: RazorpayResponse) {
                        // Validate payment on server
                        try {
                            const verifyRes = await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.orderId
                                }),
                            });

                            const verifyData = await verifyRes.json();

                            if (verifyData.success) {
                                clearCart();
                                window.location.href = `/checkout/success?orderId=${data.orderId}&orderNumber=${data.orderNumber}`;
                            } else {
                                setError('Payment verification failed');
                                setLoading(false);
                            }
                        } catch (err) {
                            console.error(err);
                            setError('Payment verification error');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                        email: shippingInfo.email,
                        contact: shippingInfo.phone,
                    },
                    notes: {
                        address: shippingInfo.address,
                    },
                    theme: {
                        color: "#9333ea", // Purple-600
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

                // Handle modal close by user if needed? Razorpay handles this mostly.
                paymentObject.on('payment.failed', function (response: RazorpayErrorResponse) {
                    setError(response.error.description || "Payment failed");
                    setLoading(false);
                });


            } else if (paymentMethod === 'phonepe') {
                // Initiate PhonePe payment
                const response = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cart: cart.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingInfo,
                        userId: session?.user?.id || null,
                        total: appliedPromo ? cartTotal - appliedPromo.discountAmount : cartTotal,
                        promoCode: appliedPromo?.code || null,
                        discountAmount: appliedPromo?.discountAmount || 0,
                        paymentMethod: 'phonepe'
                    }),
                });

                const data = await response.json();

                if (data.success && data.redirectUrl) {
                    // Redirect to PhonePe payment page
                    window.location.href = data.redirectUrl;
                } else {
                    setError(data.error || 'Failed to initiate payment');
                    setLoading(false);
                }

            } else if (paymentMethod === 'cod') {
                // Handle Cash on Delivery
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cart: cart.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingInfo,
                        userId: session?.user?.id || null,
                        total: appliedPromo ? cartTotal - appliedPromo.discountAmount : cartTotal,
                        paymentMethod: 'COD',
                        promoCode: appliedPromo?.code || null,
                        discountAmount: appliedPromo?.discountAmount || 0,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    clearCart();
                    window.location.href = `/checkout/success?orderId=${data.orderId}&orderNumber=${data.orderNumber}`;
                } else {
                    setError(data.error || 'Failed to place order');
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="checkout-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="flex max-lg:flex-col-reverse gap-y-10 justify-between">
                    <div className="lg:w-1/2 w-full lg:pr-10">
                        {!session && (
                            <div className="login bg-purple-50 py-4 px-6 flex justify-between rounded-xl mb-8 border border-purple-100">
                                <div className="left flex items-center gap-2">
                                    <span className="text-secondary">Already have an account?</span>
                                    <Link href="/login" className="font-bold text-purple-600 hover:underline">Login</Link>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="information">
                            <div className="heading5 border-b border-line pb-4 mb-6">Shipping Information</div>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="col-span-1">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="text"
                                        name="firstName"
                                        value={shippingInfo.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name *"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="text"
                                        name="lastName"
                                        value={shippingInfo.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name *"
                                        required
                                    />
                                </div>
                                <div className="col-span-full">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        placeholder="Email Address *"
                                        required
                                    />
                                </div>
                                <div className="col-span-full">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="tel"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number *"
                                        required
                                    />
                                </div>
                                <div className="col-span-full">
                                    <select
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 appearance-none bg-white"
                                        name="country"
                                        value={shippingInfo.country}
                                        onChange={handleInputChange}
                                    >
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                        <option value="UK">UK</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        placeholder="Town/City *"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <input
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                        type="text"
                                        name="postalCode"
                                        value={shippingInfo.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="Postal Code *"
                                        required
                                    />
                                </div>
                                <div className="col-span-full">
                                    <textarea
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 h-32"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        placeholder="Street Address, Apartment, etc. *"
                                        required
                                    ></textarea>
                                </div>
                                <div className="col-span-full">
                                    <textarea
                                        className="border border-line px-5 py-3 w-full rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 h-24"
                                        name="notes"
                                        value={shippingInfo.notes}
                                        onChange={handleInputChange}
                                        placeholder="Order Note (Optional)"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="payment-block mt-12">
                            <div className="heading5 border-b border-line pb-4 mb-6">Payment Method</div>
                            <div className="list-payment flex flex-col gap-4">
                                {/* Razorpay Option */}
                                <div
                                    className={`item border rounded-2xl p-5 cursor-pointer duration-300 ${paymentMethod === 'razorpay' ? 'border-purple-500 bg-purple-50' : 'border-line hover:border-purple-300'}`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-purple-500' : 'border-line'}`}>
                                            {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                            <span className="font-bold">Razorpay / UPI / Cards</span>
                                        </div>
                                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Recommended</span>
                                    </div>
                                    {paymentMethod === 'razorpay' && (
                                        <p className="mt-3 text-secondary text-sm pl-8">
                                            Pay securely using Razorpay, UPI, Credit/Debit Cards, or Net Banking.
                                        </p>
                                    )}
                                </div>

                                {/* PhonePe Option */}
                                <div
                                    className={`item border rounded-2xl p-5 cursor-pointer duration-300 ${paymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-line hover:border-purple-300'}`}
                                    onClick={() => setPaymentMethod('phonepe')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'border-purple-500' : 'border-line'}`}>
                                            {paymentMethod === 'phonepe' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-5 h-5 text-purple-600" />
                                            <span className="font-bold">PhonePe / UPI</span>
                                        </div>
                                    </div>
                                    {paymentMethod === 'phonepe' && (
                                        <p className="mt-3 text-secondary text-sm pl-8">
                                            Pay securely using PhonePe, UPI, Credit/Debit Cards, or Net Banking.
                                        </p>
                                    )}
                                </div>

                                {/* COD Option */}
                                <div
                                    className={`item border rounded-2xl p-5 cursor-pointer duration-300 ${paymentMethod === 'cod' ? 'border-purple-500 bg-purple-50' : 'border-line hover:border-purple-300'}`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-purple-500' : 'border-line'}`}>
                                            {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-gray-600" />
                                            <span className="font-bold">Cash on Delivery</span>
                                        </div>
                                    </div>
                                    {paymentMethod === 'cod' && (
                                        <p className="mt-3 text-secondary text-sm pl-8">Pay with cash when your order is delivered to your doorstep.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="button-main w-full bg-purple-600 text-white py-4 rounded-xl mt-10 hover:bg-purple-700 duration-300 font-bold uppercase disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                paymentMethod === 'razorpay' ? 'Pay with Razorpay' :
                                    paymentMethod === 'phonepe' ? 'Pay with PhonePe' :
                                        paymentMethod === 'cod' ? 'Place Order (COD)' :
                                            'Place Order'
                            )}
                        </button>
                    </div>

                    <div className="lg:w-1/3 w-full">
                        <div className="order-summary bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl sticky top-24 border border-purple-100">
                            <div className="heading5 border-b border-purple-100 pb-4 mb-6">Your Order</div>
                            <div className="list-product flex flex-col gap-5">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="item flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold line-clamp-1">{item.name}</div>
                                                <div className="text-secondary text-xs mt-1">
                                                    Qty: {item.quantity} {item.selectedSize && `| Size: ${item.selectedSize}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold whitespace-nowrap">₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Section */}
                            <div className="mb-6">
                                <div className="heading6 mb-3">Promo Code</div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value)}
                                        placeholder="Enter promo code"
                                        className="flex-1 border border-line px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 uppercase"
                                        disabled={!!appliedPromo}
                                    />
                                    {appliedPromo ? (
                                        <button
                                            onClick={() => {
                                                setAppliedPromo(null);
                                                setPromoCodeInput('');
                                                setError('');
                                            }}
                                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={applyingPromo || !promoCodeInput}
                                            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                                {appliedPromo && (
                                    <div className="mt-2 text-green-600 text-sm flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Code <strong>{appliedPromo.code}</strong> applied successfully!
                                    </div>
                                )}
                            </div>

                            <div className="summary-details border-t border-purple-100 mt-2 pt-6 flex flex-col gap-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary">Subtotal</span>
                                    <span className="font-bold">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary">Shipping</span>
                                    <span className="font-bold text-green-600">Free</span>
                                </div>

                                {appliedPromo && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="font-medium">Discount ({appliedPromo.code})</span>
                                        <span className="font-bold">-₹{appliedPromo.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between border-t border-purple-100 mt-4 pt-4">
                                    <span className="heading5">Total</span>
                                    <span className="heading5 text-purple-600">
                                        ₹{(appliedPromo ? cartTotal - appliedPromo.discountAmount : cartTotal).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Security badges */}
                            <div className="mt-6 pt-6 border-t border-purple-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Secure checkout powered by Razorpay
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
