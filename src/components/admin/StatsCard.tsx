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
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
                    <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
                    {trend && (
                        <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span className="inline-flex items-center gap-1">
                                {trend.positive ? '↑' : '↓'} {trend.value}
                                <span className="text-gray-400 font-normal hidden sm:inline">vs last month</span>
                            </span>
                        </p>
                    )}
                </div>
                <div className={`${colors.bg} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
