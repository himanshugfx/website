'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackLead } from '@/lib/pixel';

export default function WelcomeOfferPopup() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimedCode, setClaimedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const isClaimed = localStorage.getItem('anose_welcome_claimed');
            const dismissedAt = localStorage.getItem('anose_welcome_dismissed_at');

            if (isClaimed === 'true') {
                return;
            }

            if (dismissedAt) {
                const elapsedDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
                if (elapsedDays < 7) {
                    return;
                }
            }

            // Show popup 2.5 seconds after entering the website
            const timer = setTimeout(() => {
                setIsOpen(true);
                // Trigger smooth CSS animation in next tick
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            }, 2500);

            return () => clearTimeout(timer);
        } catch (e) {
            // Silently ignore if localStorage is unavailable
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsOpen(false);
            try {
                localStorage.setItem('anose_welcome_dismissed_at', Date.now().toString());
            } catch (e) {}
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanName = name.trim();
        const cleanDigits = phone.replace(/\D/g, '').slice(-10);

        if (cleanName.length < 2) {
            setError('Please enter your full name.');
            return;
        }

        if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
            setError('Please enter a valid 10-digit Indian mobile number.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/leads/welcome-popup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: cleanName,
                    phone: cleanDigits,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || 'Unable to claim offer. Please try again.');
                setLoading(false);
                return;
            }

            const promoCode = data.promoCode || 'WELCOME10';
            setClaimedCode(promoCode);

            // Mark as claimed in localStorage and save promo code
            try {
                localStorage.setItem('anose_welcome_claimed', 'true');
                localStorage.setItem('anose_promo_code', promoCode);
            } catch (e) {}

            // Track Meta Pixel Lead event
            try {
                trackLead('Welcome 10% Popup', {
                    firstName: cleanName,
                    phone: `+91${cleanDigits}`,
                });
            } catch (pixelErr) {
                console.error('Lead pixel tracking error:', pixelErr);
            }
        } catch (err) {
            setError('Network error. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!claimedCode) return;
        try {
            await navigator.clipboard.writeText(claimedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleShopNow = () => {
        handleClose();
        router.push('/shop');
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                isVisible ? 'bg-black/70 backdrop-blur-sm opacity-100' : 'bg-transparent backdrop-blur-none opacity-0'
            }`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 transition-all duration-300 transform ${
                    isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
                }`}
            >
                {/* Decorative Luxury Top Header Banner */}
                <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 p-7 text-white text-center overflow-hidden">
                    {/* Background Pattern Overlays */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors cursor-pointer"
                        aria-label="Close popup"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-purple-100 text-[11px] font-bold tracking-wider uppercase mb-3">
                        <svg className="w-3.5 h-3.5 text-purple-200" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
                        </svg>
                        Exclusive Welcome Offer
                    </div>

                    <h2 id="welcome-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Unlock <span className="text-purple-200 underline decoration-purple-300/40 decoration-wavy">10% Extra Off</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-100/90 mt-2 max-w-sm mx-auto font-normal leading-relaxed">
                        Welcome to Anose. Enter your details to claim an instant 10% coupon code on your order.
                    </p>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8">
                    {!claimedCode ? (
                        /* Step 1: Form */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                                    Your Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                                    Mobile Number
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-semibold text-xs gap-1">
                                        <span>🇮🇳</span>
                                        <span>+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="98765 43210"
                                        className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all font-medium tracking-wide"
                                    />
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-1">
                                    Enter 10-digit Indian mobile number to get your discount.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Unlocking Your 10% Off...
                                    </>
                                ) : (
                                    <>
                                        <span>Claim My 10% Off Now</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                                <span className="inline-flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Zero spam • Instant delivery
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="hover:text-zinc-600 underline cursor-pointer"
                                >
                                    No thanks, I will pay full price
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Step 2: Success State (Claimed Code) */
                        <div className="text-center py-2 space-y-5">
                            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">
                                    🎉 Your 10% Discount Code is Ready!
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                                    Apply this code at checkout to enjoy 10% extra off on your order.
                                </p>
                            </div>

                            {/* Coupon Code Card */}
                            <div className="p-4 bg-purple-50/70 border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-between gap-3 max-w-sm mx-auto">
                                <div className="text-left">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
                                        Coupon Code
                                    </div>
                                    <div className="text-xl font-black tracking-wider text-purple-900 font-mono">
                                        {claimedCode}
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Copy Code</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={handleShopNow}
                                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Start Shopping with 10% Off</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
