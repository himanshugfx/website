import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="light" backgroundColor={Colors.statusBar} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="login" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen
                    name="order/[id]"
                    options={{
                        headerShown: true,
                        headerTitle: 'Order Details',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="product/[id]"
                    options={{
                        headerShown: true,
                        headerTitle: 'Product Details',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="reviews"
                    options={{
                        headerShown: true,
                        headerTitle: 'Reviews',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="inquiries"
                    options={{
                        headerShown: true,
                        headerTitle: 'Inquiries',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="subscribers"
                    options={{
                        headerShown: true,
                        headerTitle: 'Subscribers',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="promocodes"
                    options={{
                        headerShown: true,
                        headerTitle: 'Promo Codes',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="users"
                    options={{
                        headerShown: true,
                        headerTitle: 'Users',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="leads"
                    options={{
                        headerShown: true,
                        headerTitle: 'Sales Funnel',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
                <Stack.Screen
                    name="abandoned"
                    options={{
                        headerShown: true,
                        headerTitle: 'Abandoned Carts',
                        headerStyle: { backgroundColor: Colors.surface },
                        headerTintColor: Colors.text,
                        headerTitleStyle: { fontWeight: '700' },
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
