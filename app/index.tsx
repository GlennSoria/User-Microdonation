import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { API } from './api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      // API call logic remains the same
      const res = await fetch(`${API}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Login failed', data.message);
        return;
      }

      router.replace({
        pathname: '/dashboard',
        params: { user: JSON.stringify(data.user) }
      });
    } catch (e) {
      Alert.alert('Error', 'Server error or invalid response');
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        MicroDonation
      </Text>
      <Text style={styles.subHeader}>
        Sign In to Continue
      </Text>

      {/* Email Input */}
      <TextInput
        placeholder="Email Address"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholderTextColor="#B0B0B0" // Lighter gray for placeholder
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={[styles.input, { marginBottom: 30 }]} // Increased margin before button
        onChangeText={setPassword}
        value={password}
        placeholderTextColor="#B0B0B0"
      />

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={login}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={styles.registerLinkContainer}
      >
        <Text style={styles.registerLinkText}>
          Don’t have an account? <Text style={styles.accentText}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Color Palette based on design reference
const ACCENT_COLOR = '#FF5722'; // Orange/Red from the reservation dates
const TEXT_COLOR_PRIMARY = '#222';
const TEXT_COLOR_SECONDARY = '#757575';
const BORDER_COLOR = '#E0E0E0';
const BACKGROUND_COLOR = '#fff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28, // Slightly more padding to match clean aesthetic
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32, 
    fontWeight: '800', // Extra bold for a stronger title
    color: TEXT_COLOR_PRIMARY,
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500', // Medium weight for subheading
    color: TEXT_COLOR_SECONDARY,
    textAlign: 'center',
    marginBottom: 50, // Large gap after headers
  },
  input: {
    height: 55, 
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12, // More rounded corners
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_COLOR_PRIMARY,
    backgroundColor: '#FAFAFA', // Very slight off-white background
  },
  loginButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    // Optional subtle shadow for pop
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700', // Bold text inside the button
  },
  registerLinkContainer: {
    marginTop: 40, 
  },
  registerLinkText: {
    textAlign: 'center',
    color: TEXT_COLOR_SECONDARY,
    fontSize: 15,
  },
  accentText: {
    color: ACCENT_COLOR,
    fontWeight: '700',
  }
});