'use client';

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MobileCardProps {
    title: string;
    subtitle?: string;
    badge?: {
        text: string;
        color: 'green' | 'yellow' | 'blue' | 'red' | 'purple' | 'gray';
    };
    value?: string | number;
    href?: string;
    icon?: ReactNode;
    children?: ReactNode;
    onClick?: () => void;
}

const badgeColors = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100',
};

export default function MobileCard({
    title,
    subtitle,
    badge,
    value,
    href,
    icon,
    children,
    onClick
}: MobileCardProps) {
    const className = "block w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm active:bg-gray-50 transition-colors text-left";

    const content = (
        <div className="flex items-center gap-3">
            {/* Icon */}
            {icon && (
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
                    {badge && (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[badge.color]}`}>
                            {badge.text}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                )}
                {children && <div className="mt-2">{children}</div>}
            </div>

            {/* Value & Arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {value !== undefined && (
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                )}
                {href && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {content}
        </button>
    );
}
