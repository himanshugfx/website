import Link from 'next/link'

export default function Footer() {
    return (
        <footer id="footer" className="footer md:py-20 py-10 bg-white px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <div className="footer-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 sm:pb-10 border-b border-line">
                    {/* Top Left - Company Info */}
                    <div className="footer-item">
                        <Link href="/" className="logo text-2xl sm:text-3xl font-semibold block mb-4 sm:mb-5">Anose</Link>
                        <div className="caption1 text-secondary text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                            Anose is a premium cosmetic manufacturer and hotel amenities supplier, dedicated to providing high-quality products.
                        </div>
                        <div className="list-social flex items-center gap-4">
                            <Link href="https://www.facebook.com/" target="_blank" className="hover:opacity-70 transition-opacity">
                                <i className="icon-facebook text-lg sm:text-xl hover:text-black duration-300"></i>
                            </Link>
                            <Link href="https://www.instagram.com/" target="_blank" className="hover:opacity-70 transition-opacity">
                                <i className="icon-instagram text-lg sm:text-xl hover:text-black duration-300"></i>
                            </Link>
                            <Link href="https://www.youtube.com/" target="_blank" className="hover:opacity-70 transition-opacity">
                                <i className="icon-youtube text-lg sm:text-xl hover:text-black duration-300"></i>
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
