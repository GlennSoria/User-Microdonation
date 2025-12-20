import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { API } from '../api/api';

export default function LinkBank() {
  const params = useLocalSearchParams();
  const userId = params.userId || params.id;

  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [number, setNumber] = useState('');

  const submit = async () => {
    if (!name || !bank || !number) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${API}/link_bank.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(userId), account_name: name, account_number: number, bank_name: bank })
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', data.message, [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Link Bank Account</Text>
      <TextInput placeholder="Account Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Bank Name" style={styles.input} value={bank} onChangeText={setBank} />
      <TextInput placeholder="Account Number" style={styles.input} value={number} keyboardType="numeric" onChangeText={setNumber} />
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#fff', justifyContent:'center' },
  header: { fontSize:24, fontWeight:'700', marginBottom:20 },
  input: { borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:10, marginBottom:15 },
  button: { backgroundColor:'#FF5722', padding:15, borderRadius:10, alignItems:'center' },
  buttonText: { color:'#fff', fontWeight:'700', fontSize:16 }
});
