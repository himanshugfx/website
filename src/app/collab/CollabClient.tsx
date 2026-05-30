'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const platforms = [
    { value: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
    { value: 'FACEBOOK', label: 'Facebook', icon: '👥', color: 'from-blue-500 to-blue-700' },
    { value: 'X', label: 'X (Twitter)', icon: '𝕏', color: 'from-gray-800 to-black' },
    { value: 'LINKEDIN', label: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-800' },
];

const benefits = [
    {
        icon: '💰',
        title: '10% Commission',
        description: 'Earn 10% on every single sale made using your exclusive promo code. No cap on earnings.',
    },
    {
        icon: '🎁',
        title: 'Free Products',
        description: 'Get our premium products shipped to you for just ₹49 — fully refundable after your first sale.',
    },
    {
        icon: '📊',
        title: 'Track Your Sales',
        description: 'We share transparent sales reports so you always know how your promo code is performing.',
    },
    {
        icon: '🚀',
        title: 'Grow Together',
        description: 'Get featured on our official pages and grow your audience alongside the Anose community.',
    },
];

const steps = [
    { step: '01', title: 'Apply', description: 'Fill out the form below with your details and preferred platform.' },
    { step: '02', title: 'Get Approved', description: 'Our team reviews your profile and sends you your unique promo code.' },
    { step: '03', title: 'Promote & Earn', description: 'Share your code, create content, and earn 10% on every sale.' },
];

export default function CollabClient() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        platform: '',
        profileId: '',
        wantsProducts: false,
        address: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            setSuccess(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (params.get('error')) {
            setError('Payment or application failed. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (formData.wantsProducts) {
                if (paymentMethod === 'razorpay') {
                    const loaded = await loadRazorpay();
                    if (!loaded) {
                        setError('Razorpay SDK failed to load. Are you online?');
                        setLoading(false);
                        return;
                    }
                }

                const initRes = await fetch('/api/collab/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, paymentMethod }),
                });

                const data = await initRes.json();
                if (!initRes.ok) {
                    setError(data.error || 'Payment initiation failed');
                    setLoading(false);
                    return;
                }

                if (paymentMethod === 'phonepe') {
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                        return;
                    }
                } else {
                    const options = {
                        key: data.key,
                        amount: data.amount,
                        currency: data.currency,
                        name: "Anose",
                        description: "Collab Product Shipping Fee",
                        order_id: data.razorpayOrderId,
                        handler: async function (response: any) {
                            try {
                                const verifyRes = await fetch('/api/collab/verify', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        collabData: formData,
                                        transactionId: data.transactionId
                                    }),
                                });
                                const verifyData = await verifyRes.json();
                                if (verifyData.success) {
                                    setSuccess(true);
                                    setFormData({ name: '', email: '', phone: '', platform: '', profileId: '', wantsProducts: false, address: '' });
                                    setLoading(false);
                                } else {
                                    setError('Payment verification failed');
                                    setLoading(false);
                                }
                            } catch (err) {
                                setError('Payment verification error');
                                setLoading(false);
                            }
                        },
                        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                        theme: { color: "#9333ea" },
                    };
                    const paymentObject = new (window as any).Razorpay(options);
                    paymentObject.open();
                    paymentObject.on('payment.failed', function (response: any) {
                        setError(response.error.description || "Payment failed");
                        setLoading(false);
                    });
                    return;
                }
            } else {
                const res = await fetch('/api/collab', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (res.ok) {
                    setSuccess(true);
                    setFormData({ name: '', email: '', phone: '', platform: '', profileId: '', wantsProducts: false, address: '' });
                } else {
                    setError(data.error || 'Failed to submit application');
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            if (!formData.wantsProducts) {
                setLoading(false);
            }
        }
    };

    const selectedPlatform = platforms.find(p => p.value === formData.platform);

    return (
        <div className="collab-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden bg-zinc-50 py-10">
                    <div className="container mx-auto relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content text-center">
                                <h2 className="heading2 font-bold text-4xl">Collaborate With Us</h2>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3 text-zinc-500">
                                    <Link href="/" className="hover:text-black">Homepage</Link>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="capitalize font-medium text-black">Collaborate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-bold mb-8 border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Now Accepting Applications
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
                            Become an <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Anose Ambassador</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
                            Partner with us and earn <span className="text-yellow-300 font-black">10% commission</span> on every sale through your unique promo code. Share the beauty, earn the rewards.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <a href="#apply" className="px-10 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:bg-yellow-300 hover:text-purple-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-lg">
                                Apply Now
                            </a>
                            <a href="#how-it-works" className="px-10 py-4 bg-white/10 backdrop-blur text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                                How It Works
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-purple-600 font-black text-sm uppercase tracking-[0.3em]">Why Partner With Us</span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">Benefits That <span className="text-purple-600">Actually Matter</span></h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">No empty promises. Real earnings, real products, real growth.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, i) => (
                            <div 
                                key={i} 
                                className="group bg-gray-50 hover:bg-purple-600 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 border border-gray-100 hover:border-purple-600"
                            >
                                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
                                <h3 className="text-xl font-black text-gray-900 group-hover:text-white transition-colors">{benefit.title}</h3>
                                <p className="text-gray-500 group-hover:text-white/80 mt-3 text-sm leading-relaxed transition-colors">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div id="how-it-works" className="py-20 md:py-28 bg-zinc-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-purple-600 font-black text-sm uppercase tracking-[0.3em]">Simple Process</span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">How It <span className="text-purple-600">Works</span></h2>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative text-center group">
                                <div className="w-20 h-20 bg-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl font-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-purple-500/20">
                                    {step.step}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-purple-200"></div>
                                )}
                                <h3 className="text-xl font-black text-gray-900">{step.title}</h3>
                                <p className="text-gray-500 mt-2 text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Commission Details */}
            <div className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto bg-gradient-to-br from-purple-600 to-purple-800 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tight">Commission Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                    <div className="text-4xl font-black text-yellow-300 mb-2">10%</div>
                                    <div className="text-white font-bold">Per Sale Commission</div>
                                    <p className="text-white/70 text-sm mt-2">Earn 10% on the total order value of every sale made through your unique promo code.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                    <div className="text-4xl font-black text-yellow-300 mb-2">∞</div>
                                    <div className="text-white font-bold">No Earnings Cap</div>
                                    <p className="text-white/70 text-sm mt-2">There's no limit to how much you can earn. The more you promote, the more you make.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                    <div className="text-4xl font-black text-yellow-300 mb-2">🎯</div>
                                    <div className="text-white font-bold">Exclusive Promo Code</div>
                                    <p className="text-white/70 text-sm mt-2">Get a personalised promo code that gives your audience an exclusive discount on their purchase.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Form */}
            <div id="apply" className="py-20 md:py-28 bg-zinc-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="text-purple-600 font-black text-sm uppercase tracking-[0.3em]">Join Us</span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">Apply to <span className="text-purple-600">Collaborate</span></h2>
                            <p className="text-gray-500 mt-4 text-lg">Fill in your details below and we'll get back to you within 48 hours.</p>
                        </div>

                        {success ? (
                            <div className="bg-white rounded-3xl shadow-xl shadow-purple-500/5 p-12 text-center border border-purple-100">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">Application Submitted! 🎉</h3>
                                <p className="text-gray-500 mt-3 max-w-md mx-auto">
                                    Thank you for your interest in collaborating with Anose Beauty. Our team will review your application and reach out within 48 hours.
                                </p>
                                <button 
                                    onClick={() => setSuccess(false)} 
                                    className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-purple-500/5 p-8 md:p-12 border border-gray-100">
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-semibold mb-6 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            disabled={loading}
                                            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 font-medium"
                                        />
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                disabled={loading}
                                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                disabled={loading}
                                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Platform Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Primary Promotion Platform <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {platforms.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, platform: p.value })}
                                                    disabled={loading}
                                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                        formData.platform === p.value
                                                            ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/10 scale-[1.02]'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    <span className="text-2xl">{p.icon}</span>
                                                    <span className={`text-xs font-bold ${formData.platform === p.value ? 'text-purple-700' : 'text-gray-600'}`}>
                                                        {p.label}
                                                    </span>
                                                    {formData.platform === p.value && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Profile ID */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {selectedPlatform ? `${selectedPlatform.label} Profile ID / Username` : 'Profile ID / Username'} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={selectedPlatform ? `Your ${selectedPlatform.label} username` : 'Select a platform first'}
                                            value={formData.profileId}
                                            onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                                            required
                                            disabled={loading || !formData.platform}
                                            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Want Products */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, wantsProducts: !formData.wantsProducts })}
                                                    disabled={loading}
                                                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                                        formData.wantsProducts 
                                                            ? 'bg-purple-600 border-purple-600' 
                                                            : 'border-gray-300 bg-white hover:border-purple-400'
                                                    }`}
                                                >
                                                    {formData.wantsProducts && (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-900">I want to receive Anose products 📦</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Get our products delivered to you for a nominal shipping fee of <span className="font-bold text-purple-600">₹49 only</span>.
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    💡 This shipping fee is <span className="font-bold text-green-600">fully refundable</span> after your first sale from your promo code.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address (Only visible if wantsProducts is true) */}
                                    {formData.wantsProducts && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-bold text-gray-700">Shipping Address <span className="text-red-500">*</span></label>
                                            <textarea
                                                placeholder="Enter your complete shipping address..."
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required={formData.wantsProducts}
                                                disabled={loading}
                                                rows={3}
                                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    )}

                                    {/* Payment Method Selection (Only visible if wantsProducts is true) */}
                                    {formData.wantsProducts && (
                                        <div className="space-y-4 pt-2">
                                            <label className="block text-sm font-bold text-gray-700">Payment Method <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div
                                                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'razorpay'
                                                            ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-500/10'
                                                            : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                                    onClick={() => setPaymentMethod('razorpay')}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-purple-600' : 'border-gray-300'}`}>
                                                        {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-800">Razorpay / UPI / Card</span>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                                        paymentMethod === 'phonepe'
                                                            ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-500/10'
                                                            : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                                    onClick={() => setPaymentMethod('phonepe')}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'border-purple-600' : 'border-gray-300'}`}>
                                                        {paymentMethod === 'phonepe' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-800">PhonePe</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.platform}
                                        className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/20 active:translate-y-0"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : formData.wantsProducts ? (
                                            `Pay ₹49 & Submit 🚀`
                                        ) : (
                                            'Submit Application 🚀'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* FAQ / Bottom Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">Still Have Questions?</h2>
                    <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                        Reach out to us and we'll be happy to help you understand the program better.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <a href="mailto:wecare@anosebeauty.com" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all hover:-translate-y-0.5">
                            Email Us
                        </a>
                        <a href="tel:+919110134408" className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all hover:-translate-y-0.5">
                            Call +91 9110134408
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
