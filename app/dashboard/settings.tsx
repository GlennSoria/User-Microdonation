import {
  View,
  Text, // <--- Crucial: This must be imported
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          {/* Ensure only the Ionicons component is here, no surrounding text */}
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        {/* All strings must be inside <Text> */}
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} /> 
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {/* Settings Card for Logout */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => router.replace('/')}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer info */}
        <Text style={styles.footerText}>
            App Version 1.0.0
        </Text>
        
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // ... (Styles remain the same)
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
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
  content: {
    padding: 20,
    flex: 1,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
  }
});