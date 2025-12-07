import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLocalLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e' }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Level Up Trading</Text>
        <Text style={{ color: '#ccc' }}>Master your trading psychology</Text>
      </View>

      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ color: '#ccc' }}>Email</Text>
          <TextInput
            style={{ backgroundColor: '#2e2e2e', color: '#fff', padding: 12, borderRadius: 8, borderColor: '#3b82f6', borderWidth: 1 }}
            placeholder="entry@leveluptrading.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text style={{ color: '#ccc' }}>Password</Text>
          <TextInput
            style={{ backgroundColor: '#2e2e2e', color: '#fff', padding: 12, borderRadius: 8, borderColor: '#3b82f6', borderWidth: 1 }}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || localLoading}
          style={{ backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16, opacity: loading || localLoading ? 0.7 : 1 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={{ alignItems: 'center', marginTop: 16 }}
        >
          <Text style={{ color: '#ccc' }}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
