import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { API } from '../api/api';

export default function LinkGCash() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    console.log('userId from route:', userId);
    if (!userId) Alert.alert('Error', 'User ID missing.');
  }, [userId]);

  const submit = async () => {
    if (!name.trim() || !number.trim()) { Alert.alert('Missing Information', 'Please fill in all fields.'); return; }
    if (number.length !== 11) { Alert.alert('Invalid Number', 'GCash number must be 11 digits.'); return; }

    const payload = {
      user_id: Number(userId),
      account_name: name.trim(),
      account_number: number.trim(),
    };

    console.log('Submitting payload:', payload);

    try {
      const res = await fetch(`${API}/link_gcash.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) Alert.alert('Submitted', 'GCash account submitted for approval.', [{ text: 'OK', onPress: () => router.back() }]);
      else Alert.alert('Error', data.message || 'Submission failed.');
    } catch (err) {
      console.log('Network error:', err);
      Alert.alert('Network Error', 'Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Link GCash Account</Text>
      <TextInput placeholder="Account Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="GCash Number (11 digits)" keyboardType="numeric" maxLength={11} style={styles.input} value={number} onChangeText={text=>setNumber(text.replace(/[^0-9]/g,''))} />
      <TouchableOpacity style={styles.button} onPress={submit}><Text style={styles.buttonText}>Submit for Approval</Text></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 



  container: { flex: 1, padding: 20, backgroundColor: '#F7F7F7' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0057FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
