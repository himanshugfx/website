import type { Metadata } from 'next';
import AmenitiesClient from './AmenitiesClient';

export const metadata: Metadata = {
    title: "Premium Hotel Amenities & Hospitality Solutions",
    description: "Anose provides high-quality, customizable cosmetic and hygiene solutions for luxury hotels and resorts. Bulk supply with custom branding available.",
    keywords: ["hotel amenities", "luxury hotel supplies", "toiletries manufacturer", "bulk shampoo supplier", "custom hotel branding"],
};

export default function AmenitiesPage() {
    return <AmenitiesClient />;
}
