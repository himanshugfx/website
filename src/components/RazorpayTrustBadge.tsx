import React from 'react';
import { RefreshCcw, ChevronRight } from 'lucide-react';

const RazorpayTrustBadge = () => {
    return (
        <a 
            href="https://razorpay.com/docs/payments/widgets/buyer-protection/money-back-promise/?utm_source=google&utm_medium=PMax&utm_campaign=RPHQL-RPPerf-Google-Pmax-Prospect-AllDevices-Competitor_keyeword-261225&utm_adgroup=&utm_content=&utm_term=&utm_gclid=&utm_campaignID=&utm_adgroupID=&utm_adID=&utm_network=&utm_device=&gad_source=1&gad_campaignid=23400237524&gbraid=0AAAAADdXWPpLjpbtb2oxCIq4CfK889Bvx&gclid=CjwKCAjw8arQBhB9EiwAfIKdQs7HG1jzna6DBOw_8x1yWgrJGW1nMTVClsidzdIqq_vyHAay4I81wRoCBa0QAvD_BwE"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-xl border border-blue-200 relative p-3 sm:p-4 my-3 sm:my-4 max-w-full sm:max-w-md w-full shadow-[0_2px_8px_rgba(37,99,235,0.08)] group cursor-pointer hover:border-blue-300 transition-colors block text-zinc-950 no-underline"
        >
            {/* Top Right Badge */}
            <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-[9px] sm:text-[10px] uppercase font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg rounded-tr-xl shadow-sm z-10">
                On prepaid orders
            </div>

            {/* Header */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3 pr-24 sm:pr-20">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2563eb] flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500"></div>
                    <span className="text-white font-bold text-lg sm:text-xl relative z-10">₹</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-baseline gap-1">
                        <span className="font-extrabold italic text-zinc-900 text-xs sm:text-sm tracking-tight">Razorpay</span>
                    </div>
                    <div className="font-bold text-zinc-800 text-sm sm:text-base leading-tight truncate">Money Back Promise</div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            </div>

            {/* Content */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs md:text-sm text-gray-600 border-t border-blue-100 pt-2 sm:pt-2.5">
                <div className="p-1 bg-blue-100 rounded-full flex-shrink-0">
                    <RefreshCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                </div>
                <p className="leading-tight">
                    <span className="text-[#2563eb] font-bold">Get 100% refund</span> on non-delivery or defects
                </p>
            </div>
        </a>
    );
};

export default RazorpayTrustBadge;
