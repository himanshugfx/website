import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
    };
    color?: 'purple' | 'green' | 'blue' | 'orange';
}

const colorClasses = {
    purple: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
    },
    green: {
        bg: 'bg-black',
        light: 'bg-gray-50',
        text: 'text-black',
    },
    blue: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
    },
    orange: {
        bg: 'bg-black',
        light: 'bg-gray-50',
        text: 'text-black',
    },
};

export default function StatsCard({ title, value, icon: Icon, trend, color = 'purple' }: StatsCardProps) {
    const colors = colorClasses[color];

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 truncate" title={title}>{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate" title={String(value)}>{value}</p>
                    {trend && (
                        <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                            <span className={`flex items-center justify-center w-5 h-5 rounded-full ${trend.positive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                {trend.positive ? '↑' : '↓'}
                            </span>
                            <span>{trend.value}</span>
                            <span className="text-gray-400 font-normal ml-1">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`flex-shrink-0 p-3.5 rounded-xl ${colors.light} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
