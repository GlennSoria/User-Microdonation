import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../api/api';

type Provider = 'bank' | 'gcash';
type LinkStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface LinkInfo {
  provider: Provider;
  status: LinkStatus;
}

export default function Settings() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [links, setLinks] = useState<Record<Provider, LinkStatus>>({
    bank: 'none',
    gcash: 'none',
  });

  // Fetch link status from API
  const fetchLinkStatus = async () => {
    try {
      if (!userId) return;
      const res = await fetch(`${API}/get_user_links.php?user_id=${userId}`);
      const data: LinkInfo[] = await res.json();

      const updated: Record<Provider, LinkStatus> = { bank: 'none', gcash: 'none' };
      data.forEach((item) => {
        updated[item.provider] = item.status as LinkStatus;
      });
      setLinks(updated);
    } catch {
      Alert.alert('Error', 'Unable to load linked accounts');
    }
  };

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchLinkStatus();
    }, [])
  );

  const handleLinkPress = (provider: Provider) => {
    const status = links[provider];

    if (status === 'pending') {
      Alert.alert(
        '⏳ Pending Approval',
        `Your ${provider === 'gcash' ? 'GCash' : 'Bank'} account is still pending admin approval.`
      );
      return;
    }

    if (status === 'approved') {
      Alert.alert(
        '✅ Already Linked',
        `Your ${provider === 'gcash' ? 'GCash' : 'Bank'} account is already approved.`
      );
      return;
    }

    if (status === 'rejected') {
      Alert.alert(
        '❌ Account Rejected',
        `Your ${provider === 'gcash' ? 'GCash' : 'Bank'} account was rejected. Please resubmit your account information.`,
        [
          {
            text: 'Resubmit',
            onPress: () => {
              router.push(
                provider === 'gcash'
                  ? `/dashboard/link-gcash?userId=${userId}`
                  : `/dashboard/link-bank?userId=${userId}`
              );
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // If none, allow linking
    router.push(
      provider === 'gcash'
        ? `/dashboard/link-gcash?userId=${userId}`
        : `/dashboard/link-bank?userId=${userId}`
    );
  };

  const renderStatus = (status: LinkStatus) => {
    switch (status) {
      case 'approved':
        return <Text style={styles.approved}>Approved</Text>;
      case 'pending':
        return <Text style={styles.pending}>Pending</Text>;
      case 'rejected':
        return <Text style={styles.rejected}>Rejected</Text>;
      default:
        return <Text style={styles.notLinked}>Not Linked</Text>;
    }
  };

  const handleLogout = () => {
    // Clear user data if stored, then redirect
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Linked Accounts */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Linked Accounts</Text>

        <TouchableOpacity style={styles.linkRow} onPress={() => handleLinkPress('gcash')}>
          <Ionicons name="wallet-outline" size={22} color="#0057FF" />
          <Text style={styles.linkText}>GCash</Text>
          {renderStatus(links.gcash)}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={() => handleLinkPress('bank')}>
          <Ionicons name="business-outline" size={22} color="#333" />
          <Text style={styles.linkText}>Bank Account</Text>
          {renderStatus(links.bank)}
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>App Version 1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
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
  backButton: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  placeholder: { width: 38 },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    margin: 20,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  linkText: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#333' },
  approved: { color: '#2E8B57', fontWeight: '700' },
  pending: { color: '#FF9800', fontWeight: '700' },
  rejected: { color: '#DC3545', fontWeight: '700' },
  notLinked: { color: '#DC3545', fontWeight: '700' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  footerText: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 20 },
});
