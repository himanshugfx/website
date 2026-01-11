import React from 'react';
import { RefreshCcw, ChevronRight, ShieldCheck } from 'lucide-react';

const RazorpayTrustBadge = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-xl border border-blue-200 relative p-4 my-4 max-w-md w-full shadow-[0_2px_8px_rgba(37,99,235,0.1)] group cursor-pointer hover:border-blue-300 transition-colors">
            {/* Top Right Badge */}
            <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-sm z-10">
                On prepaid orders
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500"></div>
                    {/* Rupee Symbol approximation using generic text if Icon not perfect, but ShieldCheck is good generically too. Let's use a custom SVG for the rupee-shield look or just text */}
                    <span className="text-white font-bold text-xl relative z-10">₹</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-baseline gap-1">
                        <span className="font-extrabold italic text-zinc-900 text-sm tracking-tight">Razorpay</span>
                    </div>
                    <div className="font-bold text-zinc-800 text-base leading-tight">Money Back Promise</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Content */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 border-t border-blue-100 pt-2.5">
                <div className="p-1 bg-blue-100 rounded-full">
                    <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="leading-tight">
                    <span className="text-[#2563eb] font-bold">Get 100% refund</span> on non-delivery or defects
                </p>
            </div>
        </div>
    );
};

export default RazorpayTrustBadge;
