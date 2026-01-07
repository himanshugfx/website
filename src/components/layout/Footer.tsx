import Link from 'next/link'

export default function Footer() {
    return (
        <footer id="footer" className="footer md:py-20 py-10 bg-white px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <div className="footer-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 sm:pb-10 border-b border-line">
                    {/* Top Left - Company Info */}
                    <div className="footer-item">
                        <Link href="/" className="logo text-3xl font-black block mb-6 tracking-tighter hover:text-purple-600 transition-colors">ANOSE</Link>
                        <div className="caption1 text-zinc-500 text-sm sm:text-base leading-relaxed mb-6 max-w-xs">
                            Anose is a premium cosmetic manufacturer and hotel amenities supplier, dedicated to providing high-quality products.
                        </div>
                        <div className="list-social flex items-center gap-5">
                            <Link href="https://www.facebook.com/61561850642387/about/" target="_blank" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </Link>
                            <Link href="https://www.instagram.com/anosebeauty_india/" target="_blank" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </Link>
                            <Link href="https://www.youtube.com/@AnoseBeauty" target="_blank" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all duration-300">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Top Right - Information */}
                    <div className="footer-item">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium mb-4 sm:mb-5">INFORMATION</div>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">About Us</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Contact Us</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Blog</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Bottom Left - Customer Care */}
                    <div className="footer-item">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium mb-4 sm:mb-5">CUSTOMER CARE</div>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/faqs" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">FAQs</Link>
                            </li>
                            <li>
                                <Link href="/shipping-policy" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Shipping Policy</Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Refund Policy</Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="/data-deletion-guide" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Data Deletion Guide</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Bottom Right - Newsletter */}
                    <div className="footer-item">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium mb-4 sm:mb-5">NEWSLETTER</div>
                        <div className="caption1 text-secondary text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                            Subscribe to stay updated on our latest products and exclusive offers.
                        </div>
                        <div className="form-input relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="h-11 sm:h-12 w-full border-b border-line pb-1 outline-none caption1 text-sm sm:text-base pr-20 sm:pr-24"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-button-uppercase hover:text-black duration-300 text-xs sm:text-sm whitespace-nowrap">SUBSCRIBE</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom py-4 sm:py-5 flex items-center justify-between gap-4 sm:gap-5 max-sm:flex-col max-sm:text-center">
                    <div className="caption1 text-secondary text-xs sm:text-sm order-2 sm:order-1">© 2025 Anose. All Rights Reserved.</div>
                    <div className="list-payment flex items-center justify-center gap-3 sm:gap-4 flex-wrap order-1 sm:order-2">
                        <img src="/assets/images/payment/Frame-0.png" alt="payment" className="h-5 sm:h-6 object-contain" />
                        <img src="/assets/images/payment/Frame-1.png" alt="payment" className="h-5 sm:h-6 object-contain" />
                        <img src="/assets/images/payment/Frame-2.png" alt="payment" className="h-5 sm:h-6 object-contain" />
                        <img src="/assets/images/payment/Frame-3.png" alt="payment" className="h-5 sm:h-6 object-contain" />
                    </div>
                </div>
            </div>
        </footer>
    )
}
