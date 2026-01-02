'use client';

import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="contact-page">
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden bg-zinc-50 py-10">
                    <div className="container mx-auto relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content text-center">
                                <h2 className="heading2 font-bold text-4xl">Contact Us</h2>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3 text-zinc-500">
                                    <Link href="/" className="hover:text-black">Homepage</Link>
                                    <i className="ph ph-caret-right text-sm"></i>
                                    <div className="capitalize">Contact Us</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contact-us md:py-20 py-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-between gap-y-10">
                        <div className="left lg:w-2/3 w-full lg:pr-10">
                            <h3 className="heading3 text-3xl font-bold">Drop Us A Line</h3>
                            <p className="body1 text-zinc-500 mt-3">Use the form below to get in touch with our support team</p>
                            <form className="md:mt-10 mt-6 space-y-5" onSubmit={handleSubmit}>
                                {success && (
                                    <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-semibold mb-6">
                                        Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-semibold mb-6">
                                        {error}
                                    </div>
                                )}
                                <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                                    <div className="name">
                                        <input
                                            className="border border-line px-4 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                            type="text"
                                            placeholder="Your Name *"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="email">
                                        <input
                                            className="border border-line px-4 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                            type="email"
                                            placeholder="Your Email *"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="phone sm:col-span-2">
                                        <input
                                            className="border border-line px-4 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="message sm:col-span-2">
                                        <textarea
                                            className="border border-line px-4 py-3 w-full rounded-xl focus:border-black outline-none transition-all"
                                            rows={5}
                                            placeholder="Your Message *"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            disabled={loading}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="block-button">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`button-main bg-purple-600 text-white px-10 py-4 rounded-xl font-bold uppercase ${loading ? 'cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Sending...' : 'Send message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right lg:w-1/4 w-full">
                            <div className="item">
                                <h4 className="heading4 font-bold text-xl uppercase">Our Office</h4>
                                <p className="mt-4 text-zinc-600">Anose Beauty, B-103, Sector 6, Noida, Uttar Pradesh, India (201301)</p>
                                <p className="mt-3 text-zinc-600">Phone: <span className="whitespace-nowrap font-bold text-black">+91 9110134408</span></p>
                                <p className="mt-1 text-zinc-600">Email: <span className="whitespace-nowrap font-bold text-black">wecare@anosebeauty.com</span></p>
                            </div>
                            <div className="item mt-12 pt-10 border-t border-line">
                                <h4 className="heading4 font-bold text-xl uppercase">Open Hours</h4>
                                <div className="mt-4 space-y-2">
                                    <p className="text-zinc-600 flex justify-between"><span>Mon - Sat:</span> <span className="font-semibold text-black text-right">10:30am - 6:30pm</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="map h-[500px] w-full mt-10 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden rounded-3xl container mx-auto mb-20">
                <iframe
                    className="w-full h-full border-0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3170.240597783484!2d77.31428137495531!3d28.59287918588118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a2cd82c419%3A0xbe5b9b558f7c8768!2sAnose%20Beauty%20Private%20Limited!5e1!3m2!1sen!2sin!4v1767169795088!5m2!1sen!2sin"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    );
}
