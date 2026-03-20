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
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
                <div className={`flex-shrink-0 p-3 rounded-xl ${colors.light} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 truncate" title={title}>{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate" title={String(value)}>{value}</p>
                        {trend && (
                            <span className={`text-[10px] font-bold ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trend.positive ? '↑' : '↓'}{trend.value}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sparkline Area */}
                <div className="hidden sm:block">
                    {renderSparkline()}
                </div>
            </div>
            
            {/* Background Accent */}
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.bg}`} />
        </div>
    );
}
