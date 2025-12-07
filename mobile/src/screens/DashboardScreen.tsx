import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DashboardScreen = () => {
  const { signOut, userProfile } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e1e1e' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Dashboard</Text>
        <Text style={{ color: '#ccc', marginBottom: 16 }}>
          Welcome back! Balance: ${userProfile?.account_balance?.toLocaleString() || 0}
        </Text>

        <TouchableOpacity
          onPress={signOut}
          style={{ backgroundColor: '#dc2626', padding: 12, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
