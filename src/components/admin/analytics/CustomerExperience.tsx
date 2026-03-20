'use client';

import { 
    Heart, MessageCircle, Star, Search, 
    ThumbsUp, HelpCircle 
} from 'lucide-react';

export default function CustomerExperience() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Heart className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">Net Promoter Score (NPS)</span>
                            <div className="px-2 py-0.5 bg-purple-500 rounded text-[9px] font-bold">SIMULATED</div>
                        </div>
                        <div className="text-5xl font-black tracking-tighter mb-2">72</div>
                        <p className="text-xs font-bold text-purple-200">World-class brand loyalty</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Review Sentiment</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <div className="text-4xl font-black tracking-tighter text-gray-900">4.8</div>
                        <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current opacity-50" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">Highly Positive (92%)</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Deflection</span>
                    </div>
                    <div className="text-4xl font-black tracking-tighter text-gray-900 mb-2">85%</div>
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">Solves without contacting support</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Queries */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Search className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Top On-Site Search Queries</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { term: "sunscreen for oily skin", count: 145 },
                            { term: "vitamin c serum", count: 112 },
                            { term: "acne treatment", count: 98 },
                            { term: "gift card", count: 45 },
                            { term: "lip balm", count: 32, noResults: true },
                        ].map((q, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${q.noResults ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-gray-50'}`}>
                                <Search className={`w-3 h-3 ${q.noResults ? 'text-rose-400' : 'text-gray-400'}`} />
                                <span className={`text-xs font-bold ${q.noResults ? 'text-rose-700' : 'text-gray-700'}`}>{q.term}</span>
                                <span className={`text-[10px] font-black ${q.noResults ? 'text-rose-400' : 'text-gray-400'}`}>×{q.count}</span>
                                {q.noResults && <span className="text-[8px] bg-rose-600 text-white px-1.5 rounded ml-1">0 Results</span>}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 mt-6 italic">Tracking what users type in the store search bar.</p>
                </div>

                {/* Feedback Stream */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Recent Feedback Stream</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <div className="flex gap-1 text-amber-400 mb-2">
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">"Absolutely love the new packing. The pump works perfectly now!"</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase">Product: Vitamin C Serum</p>
                        </div>
                        
                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                            <div className="flex gap-1 text-amber-400 mb-2">
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current" />
                                <Star className="w-3 h-3 fill-current opacity-30" />
                                <Star className="w-3 h-3 fill-current opacity-30" />
                                <Star className="w-3 h-3 fill-current opacity-30" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">"Delivery took a bit longer than expected, but product is good."</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase">Logistics Issue</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
