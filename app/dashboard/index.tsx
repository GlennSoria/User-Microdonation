import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { API } from '../api/api';
import { Ionicons } from '@expo/vector-icons';

// --- Constants for Animation ---
const HEADER_HEIGHT_MAX = 70; // REDUCED MAX HEIGHT from 150 to 120
const HEADER_HEIGHT_MIN = 70;
const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT_MAX - HEADER_HEIGHT_MIN;

// --- Types ---
type User = {
  id: number;
  name: string;
  wallet: number;
};

type Project = {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
};

// --- Component ---
export default function Dashboard() {
  const params = useLocalSearchParams();
  // Ensure user is safely parsed
  const user: User = JSON.parse(params.user as string);

  // FIX 1 (Wallet): Ensure initial state is always a number (defaults to 0 if not valid)
  const [wallet, setWallet] = useState<number>(Number(user.wallet || 0));
  const [projects, setProjects] = useState<Project[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<number, string>>(
    {}
  );

  // --- Animation Setup ---
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_HEIGHT_MAX, HEADER_HEIGHT_MIN],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  // --- End Animation Setup ---

  // Fetch latest wallet balance
  const fetchWallet = async () => {
    const res = await fetch(`${API}/getUser.php?id=${user.id}`);
    const data = await res.json();
    // Ensure data returned is treated as a number
    setWallet(Number(data.wallet || 0));
  };

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [])
  );

  // Load projects
  const fetchProjects = async () => {
    const res = await fetch(`${API}/getProjects.php`);
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Donate function
  const donate = async (projectId: number, amount: number) => {
    if (amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to donate.');
      return;
    }

    if (!isFinite(wallet) || wallet < amount) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds in your wallet.');
      return;
    }

    const res = await fetch(`${API}/donate.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        project_id: projectId,
        amount,
      }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      Alert.alert('Server Error', 'An unexpected error occurred: ' + text);
      return;
    }

    if (data.success) {
      fetchWallet();
      fetchProjects();
      Alert.alert('Donation Successful', `You have successfully donated ₱${amount}.`);
      setCustomAmounts((prev) => ({
        ...prev,
        [projectId]: '', // Clear the custom amount input
      }));
    } else {
      Alert.alert('Donation Failed', data.message);
    }
  };

  // --- Custom Render Items ---
  const renderProjectItem = ({ item }: { item: Project }) => {
    // FIX 2: Safely convert string amounts from API to numbers (default to 0 if invalid)
    const currentAmount = Number(item.current_amount || 0);
    const targetAmount = Number(item.target_amount || 0);
    
    // Calculation (using parsed amounts)
    const progress = (currentAmount / targetAmount) * 100;
    const progressPercent = isFinite(progress) ? Math.min(100, progress) : 0; 

    return (
      <View style={styles.projectCard}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDescription}>{item.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Display (using parsed amounts) */}
        <Text style={styles.projectProgressText}>
          Raised: ₱{currentAmount.toFixed(2)} / ₱{targetAmount.toFixed(2)}
        </Text>

        {/* QUICK DONATE BUTTONS */}
        <View style={styles.quickDonateContainer}>
          {[1, 5, 10, 20].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.quickDonateButton}
              onPress={() => donate(item.id, amt)}
            >
              <Text style={styles.quickDonateText}>₱{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CUSTOM AMOUNT */}
        <View style={styles.customAmountContainer}>
          <TextInput
            placeholder="Enter custom amount"
            keyboardType="numeric"
            value={customAmounts[item.id] || ''}
            onChangeText={(value) => {
              const cleanedValue = value.replace(/[^0-9.]/g, ''); // Allow only numbers and dot
              setCustomAmounts((prev) => ({
                ...prev,
                [item.id]: cleanedValue,
              }));
            }}
            style={styles.customAmountInput}
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.donateButton}
            onPress={() =>
              donate(item.id, Number(customAmounts[item.id] || 0))
            }
          >
            <Text style={styles.donateButtonText}>Donate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- Header Component (for FlatList ListHeaderComponent) ---
  const renderHeader = () => (
    <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Your Balance</Text>
          {/* FIX 1 (Display): Safely call toFixed(2) using isFinite() */}
          <Text style={styles.walletAmount}>
            ₱{isFinite(wallet) ? wallet.toFixed(2) : '0.00'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.topUpButton}
          onPress={() =>
            router.push({
              pathname: '/dashboard/topup',
              params: { userId: user.id },
            })
          }
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.topUpButtonText}>Top-up</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Links (only Donation History remains) */}
      <View style={styles.navigationLinks}>
        <TouchableOpacity
          style={styles.navLink}
          onPress={() =>
            router.push({
              pathname: '/dashboard/donations',
              params: { userId: user.id },
            })
          }
        >
          <Ionicons name="receipt-outline" size={24} color={styles.accent.color} />
          <Text style={styles.navLinkText}>History</Text>
        </TouchableOpacity>
        {/* REMOVED: Favorites link was here */}
      </View>

      <Text style={styles.projectsHeader}>Ongoing Projects</Text>
    </Animated.View>
  );

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Collapsing Header (always visible) */}
      <Animated.View style={[styles.collapsingHeader, { height: headerHeight }]}>
        <View style={styles.titleBar}>
          <Text style={styles.greetingText}>
            Hello, {user.name.split(' ')[0]}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/dashboard/settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* PROJECT LIST */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProjectItem}
        ListHeaderComponent={renderHeader}
        // Key animation props
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          // Adjust padding to match the reduced HEADER_HEIGHT_MAX
          paddingTop: HEADER_HEIGHT_MAX, 
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Colors ---
  primary: { color: '#000000' },
  secondary: { color: '#555555' },
  background: { backgroundColor: '#F7F7F7' },
  cardBackground: { backgroundColor: '#FFFFFF' },
  accent: { color: '#FF4500' }, // Vibrant Orange/Red
  accentLight: { color: '#FFDAB9' },

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  // --- Collapsing Header Styles ---
  collapsingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // White header background
    zIndex: 10,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Reduced padding slightly to tighten the title bar
    paddingTop: 5, 
    paddingBottom: 5,
  },
  greetingText: {
    fontSize: 22, // Slightly reduced font size from 24
    fontWeight: '700',
    color: '#000',
  },
  settingsButton: {
    padding: 5,
  },

  // --- Header Content (Collapsing Part) ---
  headerContent: {
    paddingTop: 0,
    paddingBottom: 10, // Reduced padding here too
  },

  // --- Wallet Card ---
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333333', // Dark background for contrast
    borderRadius: 15,
    padding: 15,
    marginTop: 5, // Reduced margin
    marginBottom: 10, // Reduced margin
  },
  walletLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 2,
  },
  walletAmount: {
    color: '#FFD700', // Gold color for money
    fontSize: 28,
    fontWeight: 'bold',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500', // Accent color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  topUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },

  // --- Navigation Links ---
  navigationLinks: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    marginBottom: 15, // Reduced margin
  },
  navLink: {
    alignItems: 'center',
    padding: 10,
  },
  navLinkText: {
    color: '#333',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  // --- Projects List Styles ---
  projectsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  projectProgressText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    fontWeight: '500',
  },

  // --- Progress Bar ---
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF4500', // Accent color for progress
    borderRadius: 4,
  },

  // --- Donate Section ---
  quickDonateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  quickDonateButton: {
    backgroundColor: '#FFDAB9', // Light accent background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  quickDonateText: {
    color: '#FF4500',
    fontWeight: '600',
    fontSize: 14,
  },

  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  customAmountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  donateButton: {
    backgroundColor: '#FF4500', // Accent color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});