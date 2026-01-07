import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/checkout/',
                '/my-account/',
                '/login',
                '/register',
            ],
        },
        sitemap: 'https://anose.in/sitemap.xml',
    };
}
