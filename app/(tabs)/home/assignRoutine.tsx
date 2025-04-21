import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@clerk/clerk-expo';

export default function AssignRoutineScreen() {
    const params = useLocalSearchParams();
    const routineId = params.routineId as string;
    const therapistId = params.therapistId as string;
    const [patients, setPatients] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchConnections = async() => {
            try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_connections/${therapistId}/therapist`, {
                method: 'GET',
            headers: {
                'Content-Type': 'application/json',}})
            
            if (!response.ok) {
                throw new Error('Failed to fetch connections');
            }

            const data = await response.json();
            setPatients(data.connections);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    }
    fetchConnections();
}, []);

    const assignRoutine = async (patientId: string) => {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/update_assigned_routines/${patientId}/${routineId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) {
            throw new Error('Failed to assign routine');
        }
        console.log('Routine assigned successfully!');
        Alert.alert('Routine assigned successfully!');
    }


    return (
        <LinearGradient colors={[AppColors.OffWhite, AppColors.LightBlue]} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                      {patients.map((patient, index) => (
                        <View key={index} style={styles.patientItem}>
                          <View style={styles.patientInfo}>
                            <Image source={patient.imageUrl} style={styles.patientImage} />
                            <ThemedText style={styles.patientName}>{patient.firstname} {patient.lastname}</ThemedText>
                          </View>
                            <LinearGradient colors={[AppColors.Purple, AppColors.Blue]} style={styles.removeButtonGradient}>
                              <TouchableOpacity style={styles.button} onPress={() => assignRoutine(patient._id)}>
                                <ThemedText style={styles.buttonText}>Assign</ThemedText>
                              </TouchableOpacity>
                            </LinearGradient>
                        </View>
                      ))}
                    </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
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
      button: {
        borderRadius: 25,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
      },
})