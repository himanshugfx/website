import Link from 'next/link'

export default function Footer() {
    return (
        <footer id="footer" className="footer md:pt-20 pt-10 bg-white">
            <div className="container mx-auto">
                <div className="footer-main flex justify-between gap-y-10 flex-wrap pb-10 border-b border-line">
                    <div className="footer-item basis-1/4 max-lg:basis-1/2 max-sm:basis-full pr-10">
                        <Link href="/" className="logo text-3xl font-semibold">Anose</Link>
                        <div className="caption1 text-secondary mt-5">
                            Anose is a premium cosmetic manufacturer and hotel amenities supplier, dedicated to providing high-quality products.
                        </div>
                        <div className="list-social flex items-center gap-4 mt-5">
                            <Link href="https://www.facebook.com/" target="_blank">
                                <i className="icon-facebook text-xl hover:text-black duration-300"></i>
                            </Link>
                            <Link href="https://www.instagram.com/" target="_blank">
                                <i className="icon-instagram text-xl hover:text-black duration-300"></i>
                            </Link>
                            <Link href="https://www.youtube.com/" target="_blank">
                                <i className="icon-youtube text-xl hover:text-black duration-300"></i>
                            </Link>
                        </div>
                    </div>
                    <div className="footer-item basis-1/6 max-lg:basis-1/3 max-sm:basis-1/2">
                        <div className="text-button-uppercase text-black">Information</div>
                        <ul className="mt-5">
                            <li className="mt-2">
                                <Link href="/about" className="caption1 text-secondary hover:text-black duration-300">About Us</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/contact" className="caption1 text-secondary hover:text-black duration-300">Contact Us</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/blog" className="caption1 text-secondary hover:text-black duration-300">Blog</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-item basis-1/6 max-lg:basis-1/3 max-sm:basis-1/2">
                        <div className="text-button-uppercase text-black">Customer Care</div>
                        <ul className="mt-5">
                            <li className="mt-2">
                                <Link href="/faqs" className="caption1 text-secondary hover:text-black duration-300">FAQs</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/shipping-returns" className="caption1 text-secondary hover:text-black duration-300">Shipping & Return Policy</Link>
                            </li>
                            <li className="mt-2">
                                <Link href="/privacy-policy" className="caption1 text-secondary hover:text-black duration-300">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-item basis-1/4 max-lg:basis-1/2 max-sm:basis-full">
                        <div className="text-button-uppercase text-black">Newsletter</div>
                        <div className="caption1 text-secondary mt-5">
                            Subscribe to stay updated on our latest products and exclusive offers.
                        </div>
                        <div className="form-input relative mt-5">
                            <input type="email" placeholder="Email Address" className="h-12 w-full border-b border-line pb-1 outline-none caption1" />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-button-uppercase hover:text-black duration-300">Subscribe</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom py-5 flex items-center justify-between gap-5 max-sm:flex-col">
                    <div className="caption1 text-secondary">© 2025 Anose. All Rights Reserved.</div>
                    <div className="list-payment flex items-center gap-4">
                        <img src="/assets/images/payment/Frame-0.png" alt="payment" className="h-6" />
                        <img src="/assets/images/payment/Frame-1.png" alt="payment" className="h-6" />
                        <img src="/assets/images/payment/Frame-2.png" alt="payment" className="h-6" />
                        <img src="/assets/images/payment/Frame-3.png" alt="payment" className="h-6" />
                    </div>
                </div>
            </div>
        </footer>
    )
}
