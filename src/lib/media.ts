/**
 * Converts a media ID or URL to a proper displayable URL.
 * 
 * - If the value is a cuid (starts with 'c' and is alphanumeric), treat it as a media ID
 *   and return `/api/media/{id}`.
 * - If the value is already a URL (starts with '/' or 'http'), return it as-is.
 * - Otherwise, return the default fallback image.
 */
export function getMediaUrl(value: string | undefined | null, fallback = '/assets/images/product/1000x1000.png'): string {
    if (!value || value === '' || value === '[]' || value === '{}') {
        return fallback;
    }

    // Try to parse if it looks like JSON
    let processedValue = value;
    try {
        if (value.startsWith('[') || value.startsWith('{') || value.startsWith('"')) {
            const parsed = JSON.parse(value);
            processedValue = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch {
        // Keep original if parse fails
    }

    if (!processedValue || processedValue === '') {
        return fallback;
    }

    // If it's already a URL, use it directly
    if (processedValue.startsWith('/') || processedValue.startsWith('http')) {
        return processedValue;
    }

    // If it looks like a cuid (media ID), convert to API URL
    // cuids are 25 characters starting with 'c' followed by alphanumeric
    if (/^c[a-z0-9]{20,}$/i.test(processedValue)) {
        return `/api/media/${processedValue}`;
    }

    // Fallback: assume it's a media ID anyway
    return `/api/media/${processedValue}`;
}

/**
 * Processes an array of media IDs/URLs and returns proper displayable URLs.
 */
export function getMediaUrls(value: string | undefined | null): string[] {
    if (!value || value === '' || value === '[]') {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.map(item => getMediaUrl(item)).filter(url => url !== '/assets/images/product/1000x1000.png');
        }
        return [getMediaUrl(value)];
    } catch {
        return [getMediaUrl(value)];
    }
}
