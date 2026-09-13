export interface SizeOption {
    size: string;
    price: number;
    originPrice?: number;
}

/**
 * Parses the product.sizes string into structured SizeOption objects.
 * Supports:
 * - JSON array: '[{"size":"50ml","price":99,"originPrice":149},{"size":"100ml","price":149,"originPrice":199}]'
 * - Colon syntax: '50ml:99:149, 100ml:149:199' or '50ml:99, 100ml:149'
 * - Legacy comma-separated: '50ml, 100ml' (falls back to defaultPrice/defaultOriginPrice)
 */
export function parseSizes(
    sizesString?: string | null,
    defaultPrice: number = 0,
    defaultOriginPrice: number = 0
): SizeOption[] {
    if (!sizesString || typeof sizesString !== 'string') return [];
    const trimmed = sizesString.trim();
    if (!trimmed) return [];

    // Try parsing as JSON
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item: any) => {
                        if (typeof item === 'string') {
                            const sizeStr = item.trim();
                            return sizeStr ? { size: sizeStr, price: defaultPrice, originPrice: defaultOriginPrice } : null;
                        }
                        if (item && typeof item === 'object') {
                            const size = String(item.size || item.name || '').trim();
                            if (!size) return null;
                            const price = item.price !== undefined && !isNaN(Number(item.price))
                                ? Number(item.price)
                                : defaultPrice;
                            const originPrice = item.originPrice !== undefined && !isNaN(Number(item.originPrice))
                                ? Number(item.originPrice)
                                : (defaultOriginPrice || price);
                            return { size, price, originPrice };
                        }
                        return null;
                    })
                    .filter(Boolean) as SizeOption[];
            }
        } catch {
            // Fall through to text parser
        }
    }

    // Split by comma
    return trimmed
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            // Check for colon syntax (size:price:originPrice)
            if (part.includes(':')) {
                const pieces = part.split(':').map(p => p.trim());
                const size = pieces[0];
                const price = pieces[1] && !isNaN(Number(pieces[1])) ? Number(pieces[1]) : defaultPrice;
                const originPrice = pieces[2] && !isNaN(Number(pieces[2])) ? Number(pieces[2]) : (defaultOriginPrice || price);
                return { size, price, originPrice };
            }
            // Plain size name
            return {
                size: part,
                price: defaultPrice,
                originPrice: defaultOriginPrice
            };
        });
}

/**
 * Resolves the unit price and originPrice for a specific selected size.
 */
export function getProductSizePrice(
    product: { price: number; originPrice?: number; sizes?: string | null },
    selectedSize?: string | null
): { price: number; originPrice: number } {
    const basePrice = Number(product.price) || 0;
    const baseOriginPrice = Number(product.originPrice) || basePrice;

    if (!selectedSize || !product.sizes) {
        return { price: basePrice, originPrice: baseOriginPrice };
    }

    const options = parseSizes(product.sizes, basePrice, baseOriginPrice);
    if (options.length === 0) {
        return { price: basePrice, originPrice: baseOriginPrice };
    }

    const cleanSelected = selectedSize.toLowerCase().trim();
    const match = options.find(opt => opt.size.toLowerCase().trim() === cleanSelected);

    if (match) {
        return {
            price: match.price,
            originPrice: match.originPrice || match.price
        };
    }

    return { price: basePrice, originPrice: baseOriginPrice };
}

/**
 * Serializes an array of size options into a JSON string for DB storage.
 */
export function serializeSizes(options: SizeOption[]): string {
    if (!options || options.length === 0) return '';
    const clean = options
        .map(opt => ({
            size: opt.size.trim(),
            price: Number(opt.price) || 0,
            originPrice: opt.originPrice ? Number(opt.originPrice) : undefined
        }))
        .filter(opt => opt.size.length > 0);

    return JSON.stringify(clean);
}
