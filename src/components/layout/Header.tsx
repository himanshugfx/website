'use client';

import Link from 'next/link'
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div id="header" className="relative w-full">
            <div className="header-menu style-one relative bg-white w-full md:h-[74px] h-[56px] border-b border-line">
                <div className="container mx-auto h-full px-4">
                    <div className="header-main flex items-center justify-between h-full">
                        {/* Mobile Menu Icon */}
                        <div className="menu-mobile-icon lg:hidden flex items-center cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <i className={`ph ${mobileMenuOpen ? 'ph-x' : 'ph-list'} text-2xl`}></i>
                        </div>

                        {/* Logo - Mobile Center */}
                        <Link href="/" className="flex items-center lg:hidden absolute left-1/2 -translate-x-1/2">
                            <div> <img height={60} width={60} src="/assets/images/anose-logo.png" alt="" /></div>
                        </Link>

                        {/* Logo - Desktop Left */}
                        <Link href="/" className="hidden lg:flex items-center">
                            <div> <img height={80} width={80} src="/assets/images/anose-logo.png" alt="" /></div>
                        </Link>

                        {/* Desktop Navigation Menu */}
                        <div className="menu-main h-full max-lg:hidden">
                            <ul className="flex items-center justify-center gap-8 h-full">
                                <li className="h-full">
                                    <Link href="/" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-black">
                                        Home
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/shop" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-black">
                                        Shop
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/blog" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-black">
                                        Blog
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/contact" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-black">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Right Side Icons */}
                        <div className="right flex gap-4 z-[1]">
                            <div className="list-action flex items-center gap-4">
                                {/* User Icon with Dropdown */}
                                <div className="user-icon flex items-center justify-center cursor-pointer relative group">
                                    <Link href="/my-account" className="flex items-center justify-center">
                                        <i className="ph-bold ph-user text-2xl"></i>
                                    </Link>
                                    <div className="login-popup absolute top-[50px] right-0 w-[320px] p-7 rounded-xl bg-white shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                                        {session ? (
                                            <>
                                                <div className="heading6 mb-4">Hello, {session.user?.name || 'User'}</div>
                                                <Link href="/my-account" className="button-main w-full text-center block bg-purple-600 text-white py-2 rounded-lg mb-3 hover:bg-purple-700">Dashboard</Link>
                                                <button onClick={() => signOut()} className="button-main bg-white text-purple-600 border border-purple-600 w-full text-center block py-2 rounded-lg hover:bg-purple-50">Logout</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/login" className="button-main w-full text-center block bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">Login</Link>
                                                <div className="text-secondary text-center mt-3 pb-4">
                                                    Don&apos;t have an account?
                                                    <Link href="/register" className="text-black pl-1 hover:underline">Register</Link>
                                                </div>
                                            </>
                                        )}
                                        <div className="bottom mt-4 pt-4 border-t border-line"></div>
                                        <Link href="/contact" className="body1 hover:underline">Support</Link>
                                    </div>
                                </div>

                                {/* Wishlist Icon */}
                                <Link href="/wishlist" className="max-md:hidden wishlist-icon flex items-center relative cursor-pointer">
                                    <i className="ph-bold ph-heart text-2xl"></i>
                                    <span className="quantity wishlist-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-purple-600 w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>
                                </Link>

                                {/* Cart Icon */}
                                <Link href="/cart" className="max-md:hidden cart-icon flex items-center relative cursor-pointer">
                                    <i className="ph-bold ph-handbag text-2xl"></i>
                                    <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-purple-600 w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`mobile-menu lg:hidden bg-white border-t border-line transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="container mx-auto py-4">
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Contact
                                </Link>
                            </li>
                            <li className="border-t border-line pt-4">
                                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Wishlist ({wishlistCount})
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Cart ({cartCount})
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
