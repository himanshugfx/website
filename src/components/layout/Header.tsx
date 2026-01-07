'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSession, signOut } from 'next-auth/react';
import SearchModal from '@/components/SearchModal';
import CartDrawer from '@/components/CartDrawer';

export default function Header() {
    const { cartCount, isPopupOpen, closePopup } = useCart();
    const { wishlistCount } = useWishlist();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

    // Sync context popup state with drawer (optional but good for consistency)
    useEffect(() => {
        if (isPopupOpen) {
            setCartDrawerOpen(true);
            closePopup(); // Close the context popup state so it doesn't re-trigger
        }
    }, [isPopupOpen, closePopup]);

    return (
        <div id="header" className="relative w-full">
            <div className="header-menu style-one relative bg-white w-full md:h-[74px] h-[56px] border-b border-line">
                <div className="container mx-auto h-full px-4">
                    <div className="header-main flex items-center justify-between h-full">
                        {/* Mobile Menu Icon */}
                        <div className="menu-mobile-icon lg:hidden flex items-center cursor-pointer p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </div>

                        {/* Logo - Mobile Center */}
                        <Link href="/" className="flex items-center lg:hidden absolute left-1/2 -translate-x-1/2">
                            <div> <img height={60} width={60} src="/assets/images/anose-logo.png" alt="Anose" className="object-contain" /></div>
                        </Link>

                        {/* Logo - Desktop Left */}
                        <Link href="/" className="hidden lg:flex items-center">
                            <div> <img height={80} width={80} src="/assets/images/anose-logo.png" alt="Anose" className="object-contain" /></div>
                        </Link>

                        {/* Desktop Navigation Menu */}
                        <div className="menu-main h-full max-lg:hidden">
                            <ul className="flex items-center justify-center gap-8 h-full">
                                <li className="h-full">
                                    <Link href="/" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-purple-600">
                                        Home
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/amenities" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-purple-600">
                                        Amenities
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/shop" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-purple-600">
                                        Shop
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/blog" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-purple-600">
                                        Blog
                                    </Link>
                                </li>
                                <li className="h-full">
                                    <Link href="/contact" className="text-button-uppercase duration-300 h-full flex items-center justify-center hover:text-purple-600">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Right Side Icons */}
                        <div className="right flex items-center gap-4 z-[1]">
                            <div className="list-action flex items-center gap-4">
                                {/* Search Icon */}
                                <div
                                    className="search-icon flex items-center justify-center cursor-pointer p-1 hover:text-purple-600 transition-colors"
                                    onClick={() => setSearchOpen(true)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* User Icon with Dropdown */}
                                <div className="user-icon flex items-center justify-center cursor-pointer relative group p-1">
                                    <Link href="/my-account" className="flex items-center justify-center hover:text-purple-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                    <div className="login-popup absolute top-[50px] right-0 w-[320px] p-7 rounded-xl bg-white shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-[100] border border-zinc-100">
                                        {session ? (
                                            <>
                                                <div className="heading6 mb-4 text-purple-600 font-bold italic uppercase tracking-tighter">Hello, {session.user?.name || 'User'}!</div>
                                                <Link
                                                    href={session.user?.role === 'admin' ? "/admin" : "/my-account"}
                                                    className="button-main w-full text-center block bg-purple-600 text-white py-3 rounded-lg mb-3 shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all"
                                                >
                                                    Dashboard
                                                </Link>
                                                <button onClick={() => signOut()} className="button-main bg-zinc-900 text-white w-full text-center block py-3 rounded-lg hover:bg-black transition-all">Logout</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/login" className="button-main w-full text-center block bg-purple-600 text-white py-3 rounded-lg transition-colors shadow-lg shadow-purple-500/20 hover:bg-purple-700">Login</Link>
                                                <Link
                                                    href="/login?callbackUrl=/admin"
                                                    className="w-full text-center block bg-zinc-900 text-white py-3 rounded-lg mt-3 transition-colors font-bold text-sm uppercase hover:bg-black"
                                                >
                                                    Admin Login
                                                </Link>
                                                <div className="text-secondary text-center mt-4">
                                                    Don&apos;t have an account?
                                                    <Link href="/register" className="text-purple-600 pl-1 hover:underline font-bold">Register</Link>
                                                </div>
                                            </>
                                        )}
                                        <div className="bottom mt-4 pt-4 border-t border-line"></div>
                                        <Link href="/contact" className="body1 hover:text-purple-600 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Customer Support
                                        </Link>
                                    </div>
                                </div>

                                {/* Wishlist Icon */}
                                <Link href="/wishlist" className="max-md:hidden wishlist-icon flex items-center relative cursor-pointer p-1 hover:text-purple-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="quantity wishlist-quantity absolute -right-1 -top-1 text-[10px] text-white bg-purple-600 w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlistCount}</span>
                                </Link>

                                {/* Cart Icon */}
                                <div
                                    className="relative cursor-pointer p-1 hover:text-purple-600 transition-colors"
                                    onClick={() => setCartDrawerOpen(true)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span className="quantity cart-quantity absolute -right-1 -top-1 text-[10px] text-white bg-purple-600 w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>
                                </div>
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
                                <Link href="/amenities" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-4 hover:bg-zinc-50 rounded-lg font-semibold">
                                    Amenities
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
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
        </div>
    )
}
