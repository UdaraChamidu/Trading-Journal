import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { View, ActivityIndicator } from 'react-native';

const MainNavigator = () => {
    const { session, loading } = useAuth();
  
    if (loading) {  
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }
  
    return session ? <DashboardScreen /> : <AuthScreen />;
  };

export default function App() {
  return (
    <SafeAreaProvider>
        <AuthProvider>
            <NavigationContainer>
                <MainNavigator />
                <StatusBar style="light" />
            </NavigationContainer>
        </AuthProvider>
    </SafeAreaProvider>
  );
}
