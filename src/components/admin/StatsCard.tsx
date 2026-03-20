import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
    };
    sparkline?: number[]; // Added sparkline data
    color?: 'purple' | 'green' | 'blue' | 'orange';
}

const colorClasses = {
    purple: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        stroke: '#9333ea'
    },
    green: {
        bg: 'bg-black',
        light: 'bg-gray-50',
        text: 'text-black',
        stroke: '#000000'
    },
    blue: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        stroke: '#9333ea'
    },
    orange: {
        bg: 'bg-black',
        light: 'bg-gray-50',
        text: 'text-black',
        stroke: '#000000'
    },
};

export default function StatsCard({ title, value, icon: Icon, trend, sparkline, color = 'purple' }: StatsCardProps) {
    const colors = colorClasses[color];

    // Simple Sparkline Implementation
    const renderSparkline = () => {
        if (!sparkline || sparkline.length < 2) return null;
        
        const width = 80;
        const height = 30;
        const max = Math.max(...sparkline);
        const min = Math.min(...sparkline);
        const range = max - min || 1;
        
        const dots = sparkline.map((val, i) => {
            const x = (i / (sparkline.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width={width} height={height} className="overflow-visible">
                <path
                    d={`M ${dots}`}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-40"
                />
            </svg>
        );
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden">
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className={`p-2 rounded-xl inline-flex items-center justify-center ${colors.light} ${colors.text} ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] pt-1" title={title}>{title}</p>
                    </div>

                    {/* Sparkline Area */}
                    <div className="hidden sm:block opacity-60 group-hover:opacity-100 transition-opacity">
                        {renderSparkline()}
                    </div>
                </div>
                
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter truncate" title={String(value)}>{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black border ${
                            trend.positive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Background Accent */}
            <div className={`absolute bottom-0 left-0 h-1.5 w-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-full group-hover:translate-y-0 ${colors.bg}`} />
        </div>
    );
}
