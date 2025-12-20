import {
  View,
  Text,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { API } from '../api/api';
import { Ionicons } from '@expo/vector-icons';

const HEADER_HEIGHT_MAX = 70;
const HEADER_HEIGHT_MIN = 70;
const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT_MAX - HEADER_HEIGHT_MIN;

type User = { id: number; name: string; wallet: number; };
type Project = { id: number; title: string; description: string; target_amount: number; current_amount: number; status: string; created_at: string; image: string; };

export default function Dashboard() {
  const params = useLocalSearchParams();
  const user: User = params.user ? JSON.parse(params.user as string) : { id: 0, name: 'Guest', wallet: 0 };

  const [wallet, setWallet] = useState<number>(Number(user.wallet || 0));
  const [projects, setProjects] = useState<Project[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<number, string>>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({ inputRange: [0, HEADER_SCROLL_DISTANCE], outputRange: [HEADER_HEIGHT_MAX, HEADER_HEIGHT_MIN], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE], outputRange: [1, 0.5, 0], extrapolate: 'clamp' });

  const fetchWallet = async () => {
    if (!user.id) return;
    try {
      const res = await fetch(`${API}/getUser.php?id=${user.id}`);
      const data = await res.json();
      setWallet(Number(data.wallet || 0));
    } catch (err) { console.log(err); }
  };

  useFocusEffect(useCallback(() => { fetchWallet(); }, []));

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API}/getProjects.php`);
      const data = await res.json();
      setProjects(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const donate = async (projectId: number, amount: number) => {
    if (amount <= 0) { Alert.alert('Invalid amount', 'Please enter a valid amount.'); return; }
    if (wallet < amount) { Alert.alert('Insufficient Balance', 'Not enough wallet balance.'); return; }
    try {
      const res = await fetch(`${API}/donate.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, project_id: projectId, amount }) });
      const data = JSON.parse(await res.text());
      if (data.success) { fetchWallet(); fetchProjects(); Alert.alert('Success', `Donated ₱${amount}`); setCustomAmounts((p) => ({ ...p, [projectId]: '' })); }
      else { Alert.alert('Error', data.message); }
    } catch { Alert.alert('Server Error', 'Please try again.'); }
  };

  const renderProjectItem = ({ item }: { item: Project }) => {
    const progress = (Number(item.current_amount) / Number(item.target_amount)) * 100;
    return (
      <TouchableOpacity style={styles.projectCard} activeOpacity={0.9} onPress={() => { setSelectedProject(item); setModalVisible(true); }}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, progress || 0)}%` }]} />
        </View>
        <Text style={styles.projectProgressText}>₱{item.current_amount} / ₱{item.target_amount}</Text>
        <View style={styles.quickDonateContainer}>
          {[1,5,10,20].map((amt)=>(<TouchableOpacity key={amt} style={styles.quickDonateButton} onPress={()=>donate(item.id, amt)}><Text style={styles.quickDonateText}>₱{amt}</Text></TouchableOpacity>))}
        </View>
        <View style={styles.customAmountContainer}>
          <TextInput placeholder="Custom amount" keyboardType="numeric" value={customAmounts[item.id]||''} onChangeText={(val)=>setCustomAmounts((p)=>({...p,[item.id]:val}))} style={styles.customAmountInput} />
          <TouchableOpacity style={styles.donateButton} onPress={()=>donate(item.id, Number(customAmounts[item.id]||0))}><Text style={styles.donateButtonText}>Donate</Text></TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContent,{opacity:headerOpacity}]}>
      <View style={styles.walletCard}>
        <View><Text style={styles.walletLabel}>Your Balance</Text><Text style={styles.walletAmount}>₱{wallet.toFixed(2)}</Text></View>
        <TouchableOpacity style={styles.topUpButton} onPress={()=>router.push({pathname:'/dashboard/topup',params:{userId:user.id}})}><Ionicons name="add-circle" size={22} color="#FFF" /><Text style={styles.topUpButtonText}>Top-up</Text></TouchableOpacity>
      </View>
      <View style={styles.navigationLinks}>
        <TouchableOpacity style={styles.navLink} onPress={()=>router.push({pathname:'/dashboard/donations',params:{userId:user.id}})}><Ionicons name="receipt-outline" size={24} color="#FF4500" /><Text style={styles.navLinkText}>History</Text></TouchableOpacity>
      </View>
      <Text style={styles.projectsHeader}>Ongoing Projects</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.collapsingHeader,{height:headerHeight}]}>
        <View style={styles.titleBar}>
          <Text style={styles.greetingText}>Hello, {user.name.split(' ')[0]}</Text>
          <TouchableOpacity onPress={()=>router.push({pathname:'/dashboard/settings',params:{userId:user.id}})}><Ionicons name="settings-outline" size={26} /></TouchableOpacity>
        </View>
      </Animated.View>

      <FlatList data={projects} keyExtractor={item=>item.id.toString()} renderItem={renderProjectItem} ListHeaderComponent={renderHeader} onScroll={Animated.event([{nativeEvent:{contentOffset:{y:scrollY}}}],{useNativeDriver:false})} contentContainerStyle={{paddingTop:HEADER_HEIGHT_MAX+10,paddingHorizontal:20,paddingBottom:20}} showsVerticalScrollIndicator={false}/>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={()=>setModalVisible(false)}><Ionicons name="close" size={26} /></TouchableOpacity>
            {selectedProject && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{uri:selectedProject.image}} style={styles.modalImage}/>
                <Text style={styles.modalTitle}>{selectedProject.title}</Text>
                <Text style={styles.modalDescription}>{selectedProject.description}</Text>
                <Text style={styles.modalStats}>Raised: ₱{selectedProject.current_amount}</Text>
                <Text style={styles.modalStats}>Target: ₱{selectedProject.target_amount}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles (unchanged for brevity) ---
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F7F7F7'},
  collapsingHeader:{position:'absolute',top:0,left:0,right:0,backgroundColor:'#fff',zIndex:10,paddingHorizontal:20,paddingTop:15,paddingBottom:10,borderBottomLeftRadius:25,borderBottomRightRadius:25,elevation:3,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:3},
  titleBar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  greetingText:{fontSize:22,fontWeight:'700'},
  headerContent:{marginBottom:10},
  walletCard:{backgroundColor:'#333',padding:15,borderRadius:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  walletLabel:{color:'#CCC',fontSize:14},
  walletAmount:{color:'#FFD700',fontSize:28,fontWeight:'bold'},
  topUpButton:{flexDirection:'row',alignItems:'center',backgroundColor:'#FF4500',paddingVertical:8,paddingHorizontal:12,borderRadius:10},
  topUpButtonText:{color:'#FFF',fontSize:16,fontWeight:'600',marginLeft:5},
  navigationLinks:{flexDirection:'row',marginBottom:10},
  navLink:{alignItems:'center',padding:10},
  navLinkText:{color:'#333',fontSize:12,marginTop:4,fontWeight:'600'},
  projectsHeader:{fontSize:20,fontWeight:'bold',marginBottom:15},
  projectCard:{backgroundColor:'#FFF',borderRadius:15,padding:15,marginBottom:15,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.08,shadowRadius:2,elevation:2},
  projectTitle:{fontSize:18,fontWeight:'bold',color:'#333',marginBottom:6},
  projectDescription:{fontSize:14,color:'#666',marginBottom:10},
  progressBarContainer:{height:8,backgroundColor:'#E0E0E0',borderRadius:4,overflow:'hidden',marginTop:5},
  progressBarFill:{height:'100%',backgroundColor:'#FF4500',borderRadius:4},
  projectProgressText:{fontSize:14,color:'#333',fontWeight:'500',marginTop:5},
  quickDonateContainer:{flexDirection:'row',gap:8,marginVertical:12},
  quickDonateButton:{backgroundColor:'#FFDAB9',paddingVertical:8,paddingHorizontal:15,borderRadius:8},
  quickDonateText:{color:'#FF4500',fontWeight:'600',fontSize:14},
  customAmountContainer:{flexDirection:'row',alignItems:'center',marginTop:5,gap:10},
  customAmountInput:{flex:1,borderWidth:1,borderColor:'#CCC',borderRadius:10,paddingVertical:10,paddingHorizontal:15,fontSize:16,backgroundColor:'#F9F9F9'},
  donateButton:{backgroundColor:'#FF4500',paddingVertical:12,paddingHorizontal:20,borderRadius:10},
  donateButtonText:{color:'#FFF',fontWeight:'bold',fontSize:14},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',padding:20},
  modalContent:{backgroundColor:'#FFF',borderRadius:20,padding:20,maxHeight:'85%'},
  modalClose:{position:'absolute',top:15,right:15,zIndex:10},
  modalImage:{width:'100%',height:200,borderRadius:15,marginBottom:15},
  modalTitle:{fontSize:22,fontWeight:'bold',marginBottom:10},
  modalDescription:{fontSize:15,color:'#666',marginBottom:15,lineHeight:22},
  modalStats:{fontSize:16,fontWeight:'600',marginBottom:5,color:'#333'}
});
