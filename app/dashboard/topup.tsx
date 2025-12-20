import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { API } from '../api/api';

type LinkStatus = 'none' | 'pending' | 'approved';

export default function TopUp() {
  const params = useLocalSearchParams();
  const userId = params.userId || params.id;

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankStatus, setBankStatus] = useState<LinkStatus>('none');
  const [gcashStatus, setGcashStatus] = useState<LinkStatus>('none');
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'gcash' | null>(null);

  // Fetch linked accounts status
  const fetchLinks = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is missing.');
      return;
    }

    try {
      const res = await fetch(`${API}/get_user_links.php?user_id=${userId}`);
      const data: { provider: string; status: LinkStatus }[] = await res.json();

      let approvedExists = false;

      data.forEach((item) => {
        if (item.provider === 'bank') setBankStatus(item.status);
        if (item.provider === 'gcash') setGcashStatus(item.status);

        if (item.status === 'approved') approvedExists = true;
      });

      if (!approvedExists) {
        Alert.alert(
          'No Approved Account',
          'Please link and get approval for Bank or GCash first.',
          [
            {
              text: 'Link Account',
              onPress: () => router.push('/dashboard/settings'),
            },
          ]
        );
      }
    } catch (err) {
      console.log('Fetch error:', err);
      Alert.alert('Network Error', 'Unable to fetch linked accounts.');
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Select Method', 'Please choose Bank or GCash.');
      return;
    }

    // Check if selected method is approved
    const status =
      selectedMethod === 'bank' ? bankStatus : selectedMethod === 'gcash' ? gcashStatus : 'none';

    if (status !== 'approved') {
      Alert.alert('Pending', `${selectedMethod === 'bank' ? 'Bank' : 'GCash'} is still pending approval.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/topup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(userId),
          amount: Number(amount),
          method: selectedMethod,
        }),
      });

      const data = await res.json();
      console.log('TopUp response:', data);

      if (data.success) {
        Alert.alert('Success', `₱${amount} added to your wallet.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      console.log('Network error:', err);
      Alert.alert('Network Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Top-Up Wallet</Text>
      <Text style={styles.subHeader}>Choose a method and enter the amount</Text>

      {/* Method Selection */}
      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'bank' && styles.methodSelected,
            bankStatus === 'pending' && styles.methodPending,
          ]}
          onPress={() => setSelectedMethod('bank')}
          disabled={bankStatus === 'none'}
        >
          <Text style={styles.methodText}>
            Bank {bankStatus === 'pending' ? '(Pending)' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 'gcash' && styles.methodSelected,
            gcashStatus === 'pending' && styles.methodPending,
          ]}
          onPress={() => setSelectedMethod('gcash')}
          disabled={gcashStatus === 'none'}
        >
          <Text style={styles.methodText}>
            GCash {gcashStatus === 'pending' ? '(Pending)' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Enter Amount (₱)"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleTopUp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Top-Up</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  subHeader: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#FF5722', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  methodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  methodButton: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  methodSelected: { borderColor: '#FF5722', backgroundColor: '#FFEDE5' },
  methodPending: { opacity: 0.5 },
  methodText: { fontSize: 16, fontWeight: '600' },
});
