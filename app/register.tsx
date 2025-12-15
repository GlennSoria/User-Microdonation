import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { API } from './api/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      const res = await fetch(`${API}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert('Success', 'Account created! Please log in.');
        router.replace('/'); // Navigate to the Login screen
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Server error or invalid response');
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Create Account
      </Text>
      <Text style={styles.subHeader}>
        Join MicroDonation today
      </Text>

      {/* Name Input */}
      <TextInput
        placeholder="Full Name"
        autoCapitalize="words"
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholderTextColor="#B0B0B0"
      />
      
      {/* Email Input */}
      <TextInput
        placeholder="Email Address"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholderTextColor="#B0B0B0"
      />
      
      {/* Password Input */}
      <TextInput
        placeholder="Password (min 6 characters)"
        secureTextEntry
        style={[styles.input, { marginBottom: 30 }]}
        onChangeText={setPassword}
        value={password}
        placeholderTextColor="#B0B0B0"
      />
      
      {/* Register Button (Custom TouchableOpacity) */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={register}
        activeOpacity={0.8}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity
        onPress={() => router.replace('/')} // Navigate back to the root/login screen
        style={styles.loginLinkContainer}
      >
        <Text style={styles.loginLinkText}>
          Already have an account? <Text style={styles.accentText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Styles based on the visual design reference ---
const ACCENT_COLOR = '#FF5722'; // Orange/Red
const TEXT_COLOR_PRIMARY = '#222';
const TEXT_COLOR_SECONDARY = '#757575';
const BORDER_COLOR = '#E0E0E0';
const BACKGROUND_COLOR = '#fff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT_COLOR_PRIMARY,
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: TEXT_COLOR_SECONDARY,
    textAlign: 'center',
    marginBottom: 50,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12, // Rounded corners
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_COLOR_PRIMARY,
    backgroundColor: '#FAFAFA',
  },
  registerButton: {
    backgroundColor: ACCENT_COLOR,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    // Shadow for depth (matching the login button)
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLinkContainer: {
    marginTop: 40,
  },
  loginLinkText: {
    textAlign: 'center',
    color: TEXT_COLOR_SECONDARY,
    fontSize: 15,
  },
  accentText: {
    color: ACCENT_COLOR,
    fontWeight: '700',
  }
});