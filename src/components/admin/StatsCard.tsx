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
        bg: 'bg-gradient-to-br from-purple-500 to-purple-700',
        light: 'bg-purple-50',
        text: 'text-purple-600',
    },
    green: {
        bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
    },
    blue: {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-600',
    },
    orange: {
        bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        light: 'bg-orange-50',
        text: 'text-orange-600',
    },
};

export default function StatsCard({ title, value, icon: Icon, trend, color = 'purple' }: StatsCardProps) {
    const colors = colorClasses[color];

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`mt-2 text-sm font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span className="inline-flex items-center gap-1">
                                {trend.positive ? '↑' : '↓'} {trend.value}
                                <span className="text-gray-400 font-normal">vs last month</span>
                            </span>
                        </p>
                    )}
                </div>
                <div className={`${colors.bg} p-4 rounded-2xl shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
