import { StyleSheet, View, Image, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import ScreenHeader from '@/components/ScreenHeader';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import { useUser } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type Patient = {
  id: string;
  name: string;
  imageUrl?: any;
  status: string;
};

export default function ManagePatients() {
  const router = useRouter();
  const { user } = useUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');

  const toggleModal = () => setModalVisible(!isModalVisible);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get_connections/${user?.id}/therapist`);
      const data = await response.json();
      if (data.connections) {
        const formatted = data.connections.map((patient: any) => ({
          id: patient._id,
          name: patient.firstname + ' ' + (patient.lastname || ''),
          imageUrl: patient.imageUrl ? { uri: patient.imageUrl } : require('@/assets/images/profile.png'),
          status: patient.status || 'accepted',
        }));
        setPatients(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      Alert.alert('Error', 'Failed to fetch patients');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/disconnect_patient_therapist/${id}/${user?.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Patient removed successfully');
        fetchPatients();
      } else {
        throw new Error(result.message || 'Failed to remove patient');
      }
    } catch (error: any) {
      console.error('Failed to remove patient:', error);
      Alert.alert('Error', error.message || 'Failed to remove patient');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/accept_connection/${id}/${user?.id}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Connection accepted');
        fetchPatients();
      } else {
        throw new Error(result.message || 'Failed to accept connection');
      }
    } catch (error: any) {
      console.error('Failed to accept connection:', error);
      Alert.alert('Error', error.message || 'Failed to accept connection');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/reject_connection/${id}/${user?.id}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Connection rejected');
        fetchPatients();
      } else {
        throw new Error(result.message || 'Failed to reject connection');
      }
    } catch (error: any) {
      console.error('Failed to reject connection:', error);
      Alert.alert('Error', error.message || 'Failed to reject connection');
    }
  };

  const connectPatient = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/patient/get_patient_by_email/?email=${email}`);
      if (!res.ok) throw new Error('Patient not found');
      const patient = await res.json();
      const response = await fetch(`${BACKEND_URL}/connect_patient_therapist/${patient._id}/${user?.id}`, {
        method: 'POST',
        headers: { 'X-User-Role': 'therapist' }
      });
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', result.message);
        toggleModal();
        fetchPatients();
      } else {
        throw new Error(result.message || 'Failed to connect patient');
      }
    } catch (error: any) {
      console.error('Failed to connect patient:', error);
      Alert.alert('Error', error.message || 'Failed to connect patient');
    }
  };

  useEffect(() => {
    if (user?.id) fetchPatients();
  }, [user?.id]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
        <ScreenHeader
          title="Manage Your Patients"
          leftButton={
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Image source={require('@/assets/images/chevron-left.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </TouchableOpacity>
          }
          rightButton={
            <TouchableOpacity onPress={toggleModal}>
              <Image source={require('@/assets/images/user-add-icon.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </TouchableOpacity>
          }
        />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {filteredPatients.map((patient) => (
            <View key={patient.id} style={styles.patientItem}>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/profile/patient_info',
                  params: {
                    patientId: patient.id,
                    therapistId: user?.id,
                    name: patient.name,
                    imageUrl: patient.imageUrl?.uri ?? ''
                  }
                })}
                style={styles.patientInfo}
              >
                <Image source={patient.imageUrl} style={styles.patientImage} />
                <ThemedText style={styles.patientName}>{patient.name}</ThemedText>
              </TouchableOpacity>
              {patient.status === 'pending' ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <LinearGradient colors={["#B39DDB", "#81D4FA"]} style={styles.removeButtonGradient}>
                    <TouchableOpacity style={styles.removeButton} onPress={() => handleAccept(patient.id)}>
                      <ThemedText style={styles.removeButtonText}>Accept</ThemedText>
                    </TouchableOpacity>
                  </LinearGradient>
                  <LinearGradient colors={["#E91313", "#EB9BD0"]} style={styles.removeButtonGradient}>
                    <TouchableOpacity style={styles.removeButton} onPress={() => handleReject(patient.id)}>
                      <ThemedText style={styles.removeButtonText}>Reject</ThemedText>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ) : (
                <LinearGradient colors={["#E91313", "#EB9BD0"]} style={styles.removeButtonGradient}>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(patient.id)}>
                    <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          ))}
        </ScrollView>

        <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>Add By Email</ThemedText>
            <ThemedText style={styles.modalSubtitle}>Who is your patient?</ThemedText>

            <LinearGradient colors={['#E0F7FA', '#F1F8E9']} style={styles.modalInputGradient}>
              <TextInput
                placeholder="Enter email:"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                style={styles.modalInput}
              />
            </LinearGradient>

            <TouchableOpacity style={styles.modalButton} onPress={connectPatient}>
              <LinearGradient
                colors={['#B39DDB', '#81D4FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.modalButtonGradient}
              >
                <ThemedText style={styles.modalButtonText}>Send Patient Request</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: AppColors.OffWhite,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black'
  },
  removeButtonGradient: {
    borderRadius: 25,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  removeButton: {
    borderRadius: 25,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  modalInputGradient: {
    width: '100%',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalInput: {
    fontSize: 16,
    color: 'black',
  },
  modalButton: {
    width: '100%',
  },
  modalButtonGradient: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});