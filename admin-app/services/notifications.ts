import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and send the token to the server.
 * Call this after the user has logged in.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    try {
        // Check if running on a physical device
        if (Platform.OS === 'web') {
            console.log('[Notifications] Web platform, skipping push registration');
            return null;
        }

        // Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('[Notifications] Permission not granted');
            return null;
        }

        // Get Expo Push Token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        const token = tokenData.data;
        console.log('[Notifications] Expo Push Token:', token);

        // Register token with server
        try {
            await api.registerPushToken(token, Platform.OS);
            console.log('[Notifications] Token registered with server');
        } catch (err) {
            console.error('[Notifications] Failed to register token with server:', err);
        }

        // Set up Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Anose Admin',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#7C3AED',
                sound: 'default',
            });
        }

        return token;
    } catch (error) {
        console.error('[Notifications] Error registering for push notifications:', error);
        return null;
    }
}

/**
 * Remove push token from server (call on logout)
 */
export async function unregisterPushNotifications(): Promise<void> {
    try {
        if (Platform.OS === 'web') return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        await api.removePushToken(tokenData.data);
        console.log('[Notifications] Token removed from server');
    } catch (error) {
        console.error('[Notifications] Error unregistering push notifications:', error);
    }
}
