import Link from 'next/link'

export default function Footer() {
    return (
        <footer id="footer" className="footer md:pt-20 pt-10 bg-white px-4 sm:px-6">
            <div className="container mx-auto">
                <div className="footer-main flex justify-between gap-y-8 sm:gap-y-10 flex-wrap pb-8 sm:pb-10 border-b border-line">
                    <div className="footer-item basis-1/4 max-lg:basis-1/2 max-sm:basis-full pr-0 sm:pr-10 mb-6 sm:mb-0">
                        <Link href="/" className="logo text-2xl sm:text-3xl font-semibold block">Anose</Link>
                        <div className="caption1 text-secondary mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed">
                            Anose is a premium cosmetic manufacturer and hotel amenities supplier, dedicated to providing high-quality products.
                        </div>
                        <div className="list-social flex items-center gap-4 sm:gap-4 mt-4 sm:mt-5">
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
                    <div className="footer-item basis-1/6 max-lg:basis-1/3 max-sm:basis-1/2 mb-6 sm:mb-0">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium">Information</div>
                        <ul className="mt-4 sm:mt-5 space-y-2 sm:space-y-0">
                            <li className="mt-2">
                                <Link href="/about" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">About Us</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/contact" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Contact Us</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/blog" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Blog</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-item basis-1/6 max-lg:basis-1/3 max-sm:basis-1/2 mb-6 sm:mb-0">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium">Customer Care</div>
                        <ul className="mt-4 sm:mt-5 space-y-2 sm:space-y-0">
                            <li className="mt-2">
                                <Link href="/faqs" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">FAQs</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/shipping-returns" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Shipping & Return Policy</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/privacy-policy" className="caption1 text-secondary hover:text-black duration-300 text-sm sm:text-base block py-1">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-item basis-1/4 max-lg:basis-1/2 max-sm:basis-full">
                        <div className="text-button-uppercase text-black text-sm sm:text-base font-medium">Newsletter</div>
                        <div className="caption1 text-secondary mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed">
                            Subscribe to stay updated on our latest products and exclusive offers.
                        </div>
                        <div className="form-input relative mt-4 sm:mt-5">
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="h-11 sm:h-12 w-full border-b border-line pb-1 outline-none caption1 text-sm sm:text-base pr-20 sm:pr-24" 
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-button-uppercase hover:text-black duration-300 text-xs sm:text-sm whitespace-nowrap">Subscribe</button>
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
