'use client';

import { 
    Users, Calendar, Clock, RotateCcw, Award 
} from 'lucide-react';

export default function RetentionAnalytics() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Repeat Purchase Rate</p>
                            <p className="text-2xl font-black text-gray-900">42%</p>
                        </div>
                    </div>
                    <p className="text-xs text-purple-600 font-bold bg-purple-50 inline-block px-2 py-1 rounded-md">Very High Loyalty</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Replenishment</p>
                            <p className="text-2xl font-black text-gray-900">45 Days</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Time between purchases</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Award className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Lifetime Value</p>
                            <p className="text-2xl font-black text-gray-900">₹8,400</p>
                        </div>
                    </div>
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 inline-block px-2 py-1 rounded-md">Growth: +12%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Visual Cohort Analysis Placeholder */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Cohort Retention Heatmap</h3>
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 tracking-widest">SIMULATED</span>
                    </div>
                    
                    <div className="w-full inline-block overflow-x-auto custom-scrollbar">
                        <div className="min-w-[700px]">
                            {/* Fake Header */}
                            <div className="flex text-[9px] font-black text-gray-400 mb-2 uppercase">
                                <div className="w-24 text-left">Cohort</div>
                                <div className="w-20">Size</div>
                                <div className="flex-1 flex justify-between">
                                    <span>Month 1</span>
                                    <span>Month 2</span>
                                    <span>Month 3</span>
                                    <span>Month 4</span>
                                    <span>Month 5</span>
                                    <span>Month 6</span>
                                </div>
                            </div>
                            
                            {/* Fake Rows */}
                            {[
                                { m: 'Oct', s: 450, r: [100, 45, 30, 25, 20, 15] },
                                { m: 'Nov', s: 520, r: [100, 48, 35, 28, 22, 0] },
                                { m: 'Dec', s: 800, r: [100, 35, 20, 15, 0, 0] },
                                { m: 'Jan', s: 610, r: [100, 50, 40, 0, 0, 0] },
                                { m: 'Feb', s: 580, r: [100, 55, 0, 0, 0, 0] },
                            ].map((row, i) => (
                                <div key={i} className="flex text-xs font-bold text-gray-700 mb-1">
                                    <div className="w-24 text-left pt-1 px-2">{row.m} 2025</div>
                                    <div className="w-20 pt-1 text-gray-400">{row.s}</div>
                                    <div className="flex-1 flex gap-1">
                                        {row.r.map((val, j) => {
                                            if (val === 0) return <div key={j} className="flex-1 bg-gray-50 rounded" />;
                                            const opacity = val / 100;
                                            return (
                                                <div 
                                                    key={j} 
                                                    className="flex-1 flex items-center justify-center text-[10px] text-white rounded"
                                                    style={{ backgroundColor: `rgba(147, 51, 234, ${opacity + 0.1})` }}
                                                >
                                                    {val === 100 ? '' : `${val}%`}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 mt-6 italic">Visualizing what percentage of a monthly cohort returned to purchase again in subsequent months.</p>
                </div>
            </div>
        </div>
    );
}
