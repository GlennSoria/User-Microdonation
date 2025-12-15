import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../api/api';

// --- Types ---
type Donation = {
  amount: number;
  project_title: string;
  created_at: string;
};

export default function Donations() {
  const { userId } = useLocalSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${API}/donationHistory.php?user_id=${userId}`);
        const text = await res.text();
        const data = JSON.parse(text);
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
            setDonations(data);
        } else {
            console.warn('API returned non-array data:', data);
            setDonations([]);
        }
      } catch (error) {
        console.error('Error fetching donation history:', error);
        Alert.alert('Error', 'Could not load donation history.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
        fetchDonations();
    }
  }, [userId]);

  const renderItem = ({ item }: { item: Donation }) => {
    // Safely format date and amount
    const displayDate = new Date(item.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const amount = Number(item.amount || 0);

    return (
      <View style={styles.donationCard}>
        {/* Left Side: Project and Date */}
        <View style={styles.detailsContainer}>
          <Text style={styles.projectTitle}>{item.project_title || 'Unknown Project'}</Text>
          <Text style={styles.donationDate}>on {displayDate}</Text>
        </View>

        {/* Right Side: Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Donated</Text>
          <Text style={styles.amountText}>₱{amount.toFixed(2)}</Text>
        </View>
      </View>
    );
  };
    
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donation History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conditional Rendering for Loading/Empty/List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={styles.accent.color} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No donation records found.</Text>
        </View>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Colors (Consistent with Dashboard) ---
  background: { backgroundColor: '#F7F7F7' },
  cardBackground: { backgroundColor: '#FFFFFF' },
  accent: { color: '#FF4500' }, // Vibrant Orange/Red
  
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Light gray background
  },

  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF', // White header background
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
  
  // --- List & States ---
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10, 
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },

  // --- Donation Card Style ---
  donationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsContainer: {
    flex: 2,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 13,
    color: '#888',
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500', // Accent color for the amount
  },
});