import prisma from '@/lib/prisma';

/**
 * Send push notification to all registered admin devices via Expo Push API.
 * This is a fire-and-forget utility — errors are logged but don't throw.
 */
export async function sendAdminPushNotification(
    title: string,
    body: string,
    data?: Record<string, any>
) {
    try {
        const tokens = await prisma.adminPushToken.findMany({
            select: { token: true },
        });

        if (tokens.length === 0) {
            console.log('[Push] No admin push tokens registered, skipping notification');
            return;
        }

        const messages = tokens.map(({ token }) => ({
            to: token,
            sound: 'default' as const,
            title,
            body,
            data: data || {},
        }));

        // Expo Push API accepts batches of up to 100
        const chunks: typeof messages[] = [];
        for (let i = 0; i < messages.length; i += 100) {
            chunks.push(messages.slice(i, i + 100));
        }

        for (const chunk of chunks) {
            const res = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });

            if (!res.ok) {
                console.error('[Push] Expo push API error:', await res.text());
            } else {
                const result = await res.json();
                console.log(`[Push] Sent ${chunk.length} notifications:`, JSON.stringify(result.data?.map((d: any) => d.status)));
            }
        }
    } catch (error) {
        console.error('[Push] Failed to send admin push notifications:', error);
    }
}
