import Link from 'next/link'

export default function TopNav() {
    return (
        <div id="top-nav" className="top-nav md:h-[44px] h-[30px] border-b border-line bg-white">
            <div className="container mx-auto h-full">
                <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                    <div className="left-content flex items-center">
                        <ul className="flex items-center gap-5">
                            <li>
                                <Link href="/about" className="caption2 hover:underline"> About </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="caption2 hover:underline"> Contact </Link>
                            </li>
                            <li>
                                <Link href="/store-list" className="caption2 hover:underline"> Store Location </Link>
                            </li>
                            <li>
                                <Link href="/faqs" className="caption2 hover:underline"> Help </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="right-content flex items-center gap-5 max-md:hidden">
                        <div className="choose-type choose-language flex items-center gap-1.5">
                            <div className="select relative group">
                                <p className="selected caption2 cursor-pointer transition-all duration-300">English</p>
                                <i className="ph ph-caret-down text-xs"></i>
                                <ul className="list-option bg-white absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto border border-line p-2 rounded-md shadow-md z-10 w-24">
                                    <li data-item="English" className="caption2 active cursor-pointer hover:text-black">English</li>
                                    <li data-item="Espana" className="caption2 cursor-pointer hover:text-black">Espana</li>
                                    <li data-item="France" className="caption2 cursor-pointer hover:text-black">France</li>
                                </ul>
                            </div>
                        </div>
                        <div className="choose-type choose-currency flex items-center gap-1.5">
                            <div className="select relative group">
                                <p className="selected caption2 cursor-pointer">INR</p>
                                <i className="ph ph-caret-down text-xs"></i>
                                <ul className="list-option bg-white absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto border border-line p-2 rounded-md shadow-md z-10 w-24">
                                    <li data-item="INR" className="caption2 active cursor-pointer hover:text-black">INR</li>
                                    <li data-item="EUR" className="caption2 cursor-pointer hover:text-black">EUR</li>
                                    <li data-item="GBP" className="caption2 cursor-pointer hover:text-black">GBP</li>
                                </ul>
                            </div>
                        </div>
                        <Link href="https://www.facebook.com/" target="_blank">
                            <i className="icon-facebook"></i>
                        </Link>
                        <Link href="https://www.instagram.com/" target="_blank">
                            <i className="icon-instagram"></i>
                        </Link>
                        <Link href="https://www.youtube.com/" target="_blank">
                            <i className="icon-youtube"></i>
                        </Link>
                        <Link href="https://twitter.com/" target="_blank">
                            <i className="icon-twitter"></i>
                        </Link>
                        <Link href="https://pinterest.com/" target="_blank">
                            <i className="icon-pinterest"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
