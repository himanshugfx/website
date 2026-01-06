'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// SVG Icon Components for reliability
const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
    </svg>
);

const WarningCircleIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z" />
    </svg>
);

const MinusIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" />
    </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
    </svg>
);

const DropIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75Z" />
    </svg>
);

const SparkleIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94l-51.65,19-19,51.65a15.92,15.92,0,0,1-29.88,0L78,177.94l-51.65-19a15.92,15.92,0,0,1,0-29.88l51.65-19,19-51.65a15.92,15.92,0,0,1,29.88,0l19,51.65,51.65,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
    </svg>
);

const SoapIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M104,52a28,28,0,1,1,28,28A28,28,0,0,1,104,52Zm126,92a22,22,0,1,0-22,22A22,22,0,0,0,230,144ZM60,120a22,22,0,1,0-22-22A22,22,0,0,0,60,120Zm160,32H140a12,12,0,0,0,0,24h28v52a12,12,0,0,0,12,12h40a12,12,0,0,0,12-12V164A12,12,0,0,0,220,152Z" />
    </svg>
);

const BagIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm0,120a48.05,48.05,0,0,1-48-48,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0A48.05,48.05,0,0,1,128,152Z" />
    </svg>
);

const GiftIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,72H180.92c.39-.33.79-.65,1.17-1A29.53,29.53,0,0,0,192,49.57,32.62,32.62,0,0,0,158.44,16,29.53,29.53,0,0,0,137,25.91a54.94,54.94,0,0,0-9,14.48,54.94,54.94,0,0,0-9-14.48A29.53,29.53,0,0,0,97.56,16,32.62,32.62,0,0,0,64,49.57,29.53,29.53,0,0,0,73.91,71c.38.33.78.65,1.17,1H40A16,16,0,0,0,24,88v32a16,16,0,0,0,16,16v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM149.27,37.27A13.66,13.66,0,0,1,159.4,32,16.71,16.71,0,0,1,176,49.45a13.66,13.66,0,0,1-5.27,10.13c-6.71,5.54-17.17,9.82-27.66,12.08C145.23,60.29,143.27,44.38,149.27,37.27ZM80,49.45A16.71,16.71,0,0,1,96.6,32a13.66,13.66,0,0,1,10.13,5.27c6,7.11,4,23,1.87,34.39-10.49-2.26-21-6.54-27.66-12.08A13.66,13.66,0,0,1,80,49.45ZM40,88H216v32H136V88H120v32H40ZM56,200V136h64v64Zm144,0H136V136h64Z" />
    </svg>
);

const CircleWavyCheckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
    </svg>
);

const PaintBrushIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M232,32a8,8,0,0,0-8-8c-44.08,0-89.31,49.71-114.43,82.63A60,60,0,0,0,32,164c0,30.88-19.54,44.73-20.47,45.37A8,8,0,0,0,16,224H92a60,60,0,0,0,57.37-77.57C182.29,121.31,232,76.08,232,32ZM92,208H34.63C41.38,198.41,48,183.92,48,164a44,44,0,1,1,44,44Z" />
    </svg>
);

const CoinsIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139.78,184,124V102.79C213.36,108.11,232,119.77,232,132ZM96,52c41.21,0,72,14.78,72,32s-30.79,32-72,32S24,101.22,24,84,54.79,52,96,52ZM24,124V109.93c10.42,7.26,24.71,12.69,41.92,15.65A61.43,61.43,0,0,0,60,140c0,2.09.08,4.14.24,6.16C39.57,142.06,24,132.86,24,124Zm72,48v-4.17a182.54,182.54,0,0,0,7.92.17H160c3.73,0,7.43-.13,11.08-.37C149.51,175.77,136,187.76,136,204v6.17C114.56,207.37,96,196.31,96,172Zm56,56c-41.21,0-72-14.78-72-32v-14.07c10.42,7.26,24.71,12.69,41.92,15.65A61.43,61.43,0,0,0,128,212c0,2.09.08,4.14.24,6.16C114.43,225.53,101.74,228,152,228Zm32,0c-10.68,0-21-1-30.37-2.84C178.57,214.38,192,203.31,192,188V170.79c29.36,5.32,48,17,48,29.21C240,213.22,209.21,228,168,228Z" />
    </svg>
);

const TruckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M255.43,117.61,232.57,69.31A16.05,16.05,0,0,0,218.1,60H184V48a8,8,0,0,0-8-8H24A16,16,0,0,0,8,56V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,255.43,117.61ZM184,76h34.1l17.07,36H184Zm-96,32H24V76H88Zm-16,92a16,16,0,1,1,16-16A16,16,0,0,1,72,200Zm112,0a16,16,0,1,1,16-16A16,16,0,0,1,184,200Z" />
    </svg>
);

const CalendarCheckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48ZM208,208H48V96H208V208Zm-38.34-85.66a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L116,164.69l42.34-42.35A8,8,0,0,1,169.66,122.34Z" />
    </svg>
);

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z" />
    </svg>
);

const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69l-58.35-58.34a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
    </svg>
);

export default function AmenitiesPage() {
    const [formData, setFormData] = useState({
        name: '',
        hotelName: '',
        email: '',
        phone: '',
        quantity: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: 'AMENITIES'
                })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting amenities form:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const productCategories = [
        { title: 'Shampoo & Conditioner', Icon: DropIcon, color: 'bg-blue-100', hoverColor: 'group-hover:bg-blue-600' },
        { title: 'Body Wash & Lotion', Icon: SparkleIcon, color: 'bg-purple-100', hoverColor: 'group-hover:bg-purple-600' },
        { title: 'Premium Soaps', Icon: SoapIcon, color: 'bg-teal-100', hoverColor: 'group-hover:bg-teal-600' },
        { title: 'Vanity Kits', Icon: BagIcon, color: 'bg-amber-100', hoverColor: 'group-hover:bg-amber-600' },
        { title: 'Tailored Sets', Icon: GiftIcon, color: 'bg-rose-100', hoverColor: 'group-hover:bg-rose-600' }
    ];

    const differenceItems = [
        { title: 'Consistent Quality', desc: 'Every batch is tested to meet international standards.', Icon: CircleWavyCheckIcon },
        { title: 'Custom Branding', desc: 'Bespoke designs that echo your hotel\'s luxury.', Icon: PaintBrushIcon },
        { title: 'Bulk Pricing', desc: 'Unbeatable direct rates for scale partners.', Icon: CoinsIcon },
        { title: 'Reliable Supply', desc: 'Never worry about running low on essentials.', Icon: TruckIcon }
    ];

    return (
        <div className="amenities-page bg-white min-h-screen overflow-x-hidden">
            {/* 1. Hero Section - Enhanced */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/hotel_amenities_banner.png"
                        alt="Premium Hotel Amenities"
                        className="w-full h-full object-cover scale-110"
                    />
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-purple-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Animated decorative elements */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="container mx-auto px-6 relative z-10 text-white py-20">
                    <div className="max-w-3xl">
                        <span className="inline-block px-5 py-2 rounded-full bg-purple-600/90 backdrop-blur-sm text-sm font-bold tracking-wider mb-8 shadow-lg shadow-purple-500/25">
                            Hospitality Solutions
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-8 text-white font-extrabold leading-tight">
                            Elevate Guest Experience With{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Premium Amenities
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl mb-10 text-zinc-200 max-w-2xl leading-relaxed">
                            Reliable, customizable beauty & supply solutions for hotels that care about quality, consistency, and brand image.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#quote-form" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-purple-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40">
                                Request a Free Quote
                                <ArrowRightIcon className="w-5 h-5" />
                            </a>
                            <a href="#products" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                                Get Samples
                            </a>
                        </div>
                        <div className="mt-12 flex flex-wrap gap-8 items-center text-sm font-medium">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-purple-300" />
                                </div>
                                <span className="text-zinc-200">Trusted by hotels & resorts</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-purple-300" />
                                </div>
                                <span className="text-zinc-200">Custom branding available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Problem → Solution Section - Fixed overflow */}
            <section className="py-20 md:py-28 bg-zinc-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 italic uppercase tracking-tight">Why Switch to Anose Beauty?</h2>
                            <div className="w-20 h-1 bg-purple-600 mx-auto rounded-full mb-6" />
                            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Stop settling for generic, low-quality amenities that blend into the background. Your brand deserves better.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* Typical Suppliers Card */}
                            <div className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-200 shadow-sm transition-transform hover:scale-[1.02] duration-500">
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-red-600">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <WarningCircleIcon className="w-6 h-6" />
                                    </div>
                                    <span>Typical Suppliers</span>
                                </h3>
                                <ul className="space-y-5">
                                    {[
                                        'Inconsistent product quality across batches',
                                        'Generic products that dilute your hotel branding',
                                        'Delayed deliveries causing guest dissatisfaction',
                                        'Standard formulations with harsh chemicals'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-zinc-600">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-red-50 flex-shrink-0 flex items-center justify-center">
                                                <MinusIcon className="w-3 h-3 text-red-400" />
                                            </div>
                                            <span className="text-base leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Anose Beauty Card */}
                            <div className="bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden transition-transform hover:scale-[1.02] duration-500">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/20 blur-3xl rounded-full" />
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-white relative z-10">
                                    <div className="w-10 h-10 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <CheckCircleIcon className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <span>Anose Beauty</span>
                                </h3>
                                <ul className="space-y-5 relative z-10">
                                    {[
                                        'Uncompromising beauty & hygiene standards',
                                        'Full custom branding tailored to your aesthetic',
                                        'Reliable, on-time delivery guaranteed',
                                        'Premium, hospitality-grade formulations'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-4 text-zinc-300">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center">
                                                <CheckIcon className="w-3 h-3 text-purple-400" />
                                            </div>
                                            <span className="text-base leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Product & Service Overview - Fixed icons */}
            <section id="products" className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 uppercase tracking-tight">Our Hospitality Range</h2>
                        <div className="w-16 h-1 bg-purple-600 mx-auto rounded-full mb-6" />
                        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                            Available in standard, luxury, and eco-friendly options to match your hotel's aesthetic and values.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {productCategories.map((item, i) => (
                            <div key={i} className="group p-6 md:p-8 bg-zinc-50 rounded-2xl text-center hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-zinc-100">
                                <div className={`w-16 h-16 ${item.color} ${item.hoverColor} rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110`}>
                                    <item.Icon className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="text-base md:text-lg font-bold text-zinc-900 leading-tight">{item.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Why Choose Anose Beauty - Fixed icons and layout */}
            <section className="py-20 md:py-28 bg-zinc-900 text-white mx-4 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black mb-12 uppercase tracking-tight">
                            The Anose <span className="text-purple-400">Difference</span>
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            {differenceItems.map((item, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
                                        <item.Icon className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h4 className="text-xl font-bold">{item.title}</h4>
                                    <p className="text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 flex flex-wrap gap-8 pt-10 border-t border-white/10">
                            <div>
                                <div className="text-3xl font-bold text-purple-400 mb-1">50+</div>
                                <p className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Hotels Served</p>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-400 mb-1">98%</div>
                                <p className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Repeat Clients</p>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-400 mb-1">10+</div>
                                <p className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Years Experience</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <p className="text-xl font-medium italic mb-8 text-zinc-300 leading-relaxed">
                                "The guest feedback has been incredible since we switched. Our guests consistently compliment the amenities' quality and luxury feel."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">HM</div>
                                <div>
                                    <div className="text-lg font-bold">Hotel Manager</div>
                                    <div className="text-zinc-500 italic text-sm">Luxury Boutique Resort</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Simple Process Section */}
            <section className="py-20 md:py-28 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 uppercase tracking-tight">How It Works</h2>
                            <div className="w-16 h-1 bg-purple-600 mx-auto rounded-full mb-6" />
                            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Simple, streamlined, and stress-free supply management tailored for busy hotel operations.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
                            <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-zinc-200 z-0" />
                            {[
                                { step: '1', title: 'Contact Us', desc: 'Fill out the quick quote form below.' },
                                { step: '2', title: 'Choose Sets', desc: 'Select from our luxury ranges.' },
                                { step: '3', title: 'Get Samples', desc: 'Verify our premium quality.' },
                                { step: '4', title: 'Production', desc: 'Express bulk delivery to your site.' }
                            ].map((item, i) => (
                                <div key={i} className="relative z-10 text-center">
                                    <div className="w-14 h-14 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-6 font-bold text-xl shadow-lg transition-transform hover:rotate-6">
                                        {item.step}
                                    </div>
                                    <h4 className="text-lg font-bold mb-2 text-zinc-900">{item.title}</h4>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Final CTA & Form Section */}
            <section id="quote-form" className="py-20 md:py-28 bg-zinc-50 relative overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-zinc-900">
                                Upgrade Your Hotel Amenities <span className="text-purple-600">Today</span>
                            </h2>
                            <p className="text-lg text-zinc-600 mb-10 leading-relaxed max-w-xl">
                                Join dozens of hospitality partners who trust Anose Beauty for their guest experience needs.
                                We respond to all inquiries within 24 hours. No obligation.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <CalendarCheckIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-zinc-900">Fast Turnaround</div>
                                        <p className="text-zinc-500 text-sm">Quick response to customized needs.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                        <WarningCircleIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-zinc-900">Limited Custom Slots</div>
                                        <p className="text-zinc-500 text-sm">Availability for bespoke branding.</p>
                                    </div>
                                </div>
                                <a href="https://wa.me/919110134408" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-5 bg-purple-600 rounded-2xl shadow-xl transform hover:scale-[1.02] transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:bg-white/30 transition-colors flex-shrink-0">
                                        <WhatsAppIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-white text-left">
                                        <div className="text-lg font-bold">Chat on WhatsApp</div>
                                        <p className="text-white/70 text-sm">Instant connection with our team.</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-zinc-100 relative z-10">
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                                placeholder="Enter Your Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Hotel Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="hotelName"
                                                value={formData.hotelName}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                                placeholder="Enter Hotel Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                            placeholder="Enter Your Email"
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white"
                                                placeholder="Enter Your Phone Number"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Qty Estimate</label>
                                            <select
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-zinc-200 focus:border-purple-600 outline-none transition-all bg-zinc-50 focus:bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Select quantity</option>
                                                <option value="Small (under 500)">Under 500 units</option>
                                                <option value="Medium (500-2000)">500 - 2,000 units</option>
                                                <option value="Large (2000+)">2,000+ units</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-zinc-900 hover:bg-black text-white py-5 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-98 flex items-center justify-center gap-3 group"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Get My Free Quote
                                                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-sm text-zinc-400 font-medium">
                                        Secure & Confidential. <span className="text-zinc-900 font-bold">24h response time.</span>
                                    </p>
                                </form>
                            ) : (
                                <div className="text-center py-16 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                        <CheckIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-zinc-900">Request Sent!</h3>
                                    <p className="text-zinc-500 mb-8 text-base leading-relaxed max-w-sm mx-auto">
                                        An expert from our hospitality team will contact you within 24 hours to discuss your custom kit.
                                    </p>
                                    <button onClick={() => setSubmitted(false)} className="text-purple-600 font-bold text-base hover:underline transition-all">
                                        Send another request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
