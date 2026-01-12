'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users, MapPin } from 'lucide-react';

interface CityData {
    city: string;
    users: number;
}

// Major Indian cities with approximate SVG coordinates (percentage based)
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
    'Mumbai': { x: 23, y: 65 },
    'Delhi': { x: 38, y: 25 },
    'New Delhi': { x: 38, y: 25 },
    'Bangalore': { x: 37, y: 82 },
    'Bengaluru': { x: 37, y: 82 },
    'Hyderabad': { x: 40, y: 68 },
    'Ahmedabad': { x: 18, y: 48 },
    'Chennai': { x: 48, y: 82 },
    'Kolkata': { x: 78, y: 52 },
    'Surat': { x: 20, y: 58 },
    'Pune': { x: 25, y: 68 },
    'Jaipur': { x: 30, y: 35 },
    'Lucknow': { x: 50, y: 35 },
    'Kanpur': { x: 48, y: 38 },
    'Nagpur': { x: 45, y: 55 },
    'Indore': { x: 35, y: 52 },
    'Thane': { x: 23, y: 64 },
    'Bhopal': { x: 40, y: 50 },
    'Visakhapatnam': { x: 55, y: 65 },
    'Pimpri-Chinchwad': { x: 24, y: 67 },
    'Patna': { x: 68, y: 38 },
    'Vadodara': { x: 20, y: 52 },
    'Ludhiana': { x: 35, y: 18 },
    'Agra': { x: 42, y: 32 },
    'Nashik': { x: 23, y: 60 },
    'Faridabad': { x: 40, y: 28 },
    'Meerut': { x: 42, y: 25 },
    'Rajkot': { x: 12, y: 50 },
    'Kalyan-Dombivli': { x: 24, y: 65 },
    'Vasai-Virar': { x: 22, y: 63 },
    'Varanasi': { x: 60, y: 40 },
    'Srinagar': { x: 35, y: 8 },
    'Aurangabad': { x: 28, y: 60 },
    'Dhanbad': { x: 75, y: 45 },
    'Amritsar': { x: 32, y: 15 },
    'Navi Mumbai': { x: 24, y: 66 },
    'Allahabad': { x: 55, y: 42 },
    'Ranchi': { x: 72, y: 48 },
    'Howrah': { x: 78, y: 53 },
    'Coimbatore': { x: 38, y: 88 },
    'Jabalpur': { x: 50, y: 52 },
    'Gwalior': { x: 40, y: 38 },
    'Vijayawada': { x: 48, y: 68 },
    'Jodhpur': { x: 20, y: 35 },
    'Madurai': { x: 42, y: 92 },
    'Raipur': { x: 58, y: 55 },
    'Kota': { x: 32, y: 40 },
    'Guwahati': { x: 92, y: 35 },
    'Chandigarh': { x: 38, y: 18 },
};

export default function IndiaMap() {
    const [cities, setCities] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics/active-cities');
            const data = await res.json();
            if (data.success) {
                setCities(data.cities);
            } else {
                setError(data.error || 'Failed to fetch city data');
            }
        } catch (err) {
            setError('Error connecting to analytics API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Fallback coordinates for cities not in our mapping
    const getCoordinates = (cityName: string) => {
        return CITY_COORDINATES[cityName] || { x: 50, y: 50 }; // Center as fallback
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Live Active Users (India)
                    </h3>
                    <p className="text-sm text-gray-500">Real-time user locations from Google Analytics</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Map Container */}
                <div className="lg:col-span-2 relative aspect-[4/5] bg-gray-50 rounded-2xl border border-gray-100 p-4">
                    {/* India SVG Path (Simplified) */}
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-gray-200 fill-current"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path d="M38,5 L40,8 L45,7 L48,10 L45,15 L48,18 L42,22 L38,20 L32,25 L28,22 L25,25 L20,28 L15,35 L12,45 L10,50 L12,55 L15,62 L18,65 L22,75 L28,82 L35,88 L38,95 L42,98 L45,95 L48,88 L52,82 L55,75 L58,68 L65,65 L72,62 L78,55 L82,50 L85,45 L92,38 L98,35 L95,25 L92,20 L88,18 L82,22 L78,25 L72,18 L65,15 L58,12 L52,10 L45,5 Z" />
                        {/* Note: This is a placeholder simplified polygon. In a real app, use a proper GeoJSON/SVG path. */}
                        {/* For visual excellence, we'll use a cleaner SVG path pattern if possible but staying within limits. */}
                    </svg>

                    {/* City Dots */}
                    {!loading && cities.map((city, index) => {
                        const coords = getCoordinates(city.city);
                        const size = Math.min(10, 4 + city.users * 2);

                        return (
                            <div
                                key={index}
                                className="absolute pointer-events-auto group"
                                style={{
                                    left: `${coords.x}%`,
                                    top: `${coords.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div
                                    className="bg-purple-600 rounded-full animate-pulse shadow-lg shadow-purple-200"
                                    style={{ width: `${size}px`, height: `${size}px` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    {city.city}: {city.users} active
                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                    )}
                </div>

                {/* City List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Active Cities</h4>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {cities.length === 0 && !loading && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500">No active users in India right now</p>
                            </div>
                        )}
                        {cities.map((city, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{city.city}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                                    {city.users}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
