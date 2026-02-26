import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';


export default function TabLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.tabBar,
                    borderTopColor: Colors.tabBarBorder,
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 20,
                    shadowColor: Colors.black,
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textDim,
                tabBarLabelStyle: {
                    fontSize: FontSize.xs,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'grid' : 'grid-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'receipt' : 'receipt-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'cube' : 'cube-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? 'apps' : 'apps-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
