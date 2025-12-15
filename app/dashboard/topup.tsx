import {
  View,
  Text,
  TextInput,
  Alert, // Still using native Alert, but with better messages
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../api/api';

// --- Types ---
type PaymentMethod = 'bank' | 'gcash';

// --- Component ---
export default function TopUp() {
  const { userId } = useLocalSearchParams();
  const [amount, setAmount] = useState<string>(''); // user input
  const [method, setMethod] = useState<PaymentMethod>('bank');

  const topup = async (selectedMethod: PaymentMethod) => {
    const numAmount = parseFloat(amount);
    
    // --- Enhanced Input Validation Alert ---
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        '🛑 Invalid Amount',
        'Please enter a valid amount greater than ₱0. Only numbers are allowed.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    // Set the method right before the API call
    setMethod(selectedMethod); 
    const methodDisplayName = selectedMethod === 'gcash' ? 'GCash' : 'Bank Transfer';

    try {
      const res = await fetch(`${API}/topup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount: numAmount, method: selectedMethod })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // --- Enhanced Server Error Alert ---
        Alert.alert(
          '⚠️ Server Error',
          `We received an unexpected response from the server: ${text}`,
          [{ text: 'Dismiss' }]
        );
        return;
      }
      
      if (data.success) {
        // --- Enhanced Success Alert ---
        Alert.alert(
          '✅ Top-Up Successful!', 
          `₱${numAmount.toFixed(2)} has been successfully added to your wallet via ${methodDisplayName}.`,
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      } else {
        // --- Enhanced Failure Alert ---
        Alert.alert(
          '❌ Top-Up Failed', 
          data.message || 'An unknown error prevented the top-up. Please try again.',
          [{ text: 'Try Again' }]
        );
      }

    } catch (error) {
      // --- Enhanced Network Error Alert ---
      Alert.alert(
        '🌐 Network Error', 
        'Could not connect to the service. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top-Up Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Enter Amount to Top-Up</Text>

        <TextInput
          placeholder="Amount (₱)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={styles.amountInput}
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Select Payment Method</Text>

        {/* Bank Transfer Button */}
        <TouchableOpacity
          style={styles.methodButton}
          onPress={() => topup('bank')}
        >
          <Ionicons name="business-outline" size={28} color={styles.primaryText.color} />
          <Text style={styles.methodText}>Bank Transfer</Text>
          <Ionicons name="chevron-forward" size={24} color="#aaa" style={styles.arrow} />
        </TouchableOpacity>

        {/* GCash Button */}
        <TouchableOpacity
          style={[styles.methodButton, styles.gcashButton]}
          onPress={() => topup('gcash')}
        >
          {/* Using a recognizable wallet icon for GCash */}
          <Ionicons name="wallet-outline" size={28} color="#0000FF" /> 
          <Text style={[styles.methodText, { color: '#0000FF' }]}>GCash</Text>
          <Ionicons name="chevron-forward" size={24} color="#aaa" style={styles.arrow} />
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
            Note: Top-up transactions are processed immediately.
        </Text>

      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Colors (Consistent with Dashboard) ---
  background: { backgroundColor: '#F7F7F7' },
  cardBackground: { backgroundColor: '#FFFFFF' },
  accent: { color: '#FF4500' }, // Vibrant Orange/Red
  primaryText: { color: '#333' },

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  // --- Header Styles (Copied from Donations.js) ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 38,
  },

  // --- Content Styles ---
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  // --- Method Buttons ---
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  gcashButton: {
    // Styling for GCash can be refined here
  },
  methodText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    marginLeft: 'auto',
  },

  footerNote: {
    marginTop: 20,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  }
});