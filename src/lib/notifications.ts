import prisma from '@/lib/prisma';
import { messaging } from '@/lib/admin/firebase';

/**
 * Send push notification to all registered admin devices via Firebase Cloud Messaging (FCM).
 * This is a fire-and-forget utility — errors are logged but don't throw.
 */
export async function sendAdminPushNotification(
    title: string,
    body: string,
    data?: Record<string, any>
) {
    try {
        const adminTokens = await prisma.adminPushToken.findMany({
            select: { token: true },
        });

        console.log(`[Push] Found ${adminTokens.length} registered admin tokens`);

        if (!messaging) {
            console.log('[Push] Firebase Cloud Messaging not initialized, skipping notification');
            return;
        }

        if (adminTokens.length === 0) {
            console.log('[Push] No admin push tokens registered, skipping notification');
            return;
        }

        const tokens = adminTokens.map(({ token }) => token);

        // Send multicast message via Firebase Admin
        const response = await messaging.sendEachForMulticast({
            tokens,
            notification: {
                title,
                body,
            },
            data: data ? Object.entries(data).reduce((acc, [k, v]) => {
                acc[k] = String(v);
                return acc;
            }, {} as Record<string, string>) : {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'anose_admin_channel',
                },
            },
        });

        console.log(`[Push] Batch sent: ${response.successCount} successes, ${response.failureCount} failures`);
        
        // Cleanup expired tokens
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        tokensToRemove.push(tokens[idx]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                console.log(`[Push] Removing ${tokensToRemove.length} expired admin tokens`);
                await prisma.adminPushToken.deleteMany({
                    where: { token: { in: tokensToRemove } },
                });
            }
        }
    } catch (error) {
        console.error('[Push] Failed to send admin push notifications:', error);
    }
}
