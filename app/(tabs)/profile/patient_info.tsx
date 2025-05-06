import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Stack } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function PatientConnectionDetails() {
  const router = useRouter();
  const { patientId, therapistId, name, imageUrl } = useLocalSearchParams();

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchConnectionDetails = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/therapist/get_connection_details/${patientId}/${therapistId}`);
      const data = await res.json();
      setDiagnosis(data.diagnosis || '');
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to fetch connection details:', error);
      Alert.alert('Error', 'Failed to load patient data');
    }
  };

  const updateConnectionDetails = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/therapist/update_connection_details/${patientId}/${therapistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', data.message);
        setEditing(false);
      } else {
        throw new Error(data.detail);
      }
    } catch (error) {
      console.error('Failed to update connection details:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  useEffect(() => {
    if (patientId && therapistId) fetchConnectionDetails();
  }, [patientId, therapistId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('@/assets/images/chevron-left.png')} style={styles.icon} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>{name} Profile</ThemedText>
        </View>

        <View style={styles.card}>
          <Image source={imageUrl ? { uri: imageUrl } : require('@/assets/images/profile.png')} style={styles.avatar} />
          {editing ? (
            <TextInput
              style={styles.input}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Diagnosis"
            />
          ) : (
            <ThemedText>Diagnosis: {diagnosis}</ThemedText>
          )}

          {editing ? (
            <TextInput
              multiline
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
            />
          ) : (
            <ThemedText>Notes: {notes}</ThemedText>
          )}

          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Image source={require('@/assets/images/Magicpen.png')} style={styles.pen} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {editing && (
          <TouchableOpacity onPress={updateConnectionDetails} style={styles.saveButton}>
            <LinearGradient colors={[AppColors.Purple, AppColors.Blue]} style={styles.saveGradient}>
              <ThemedText style={{ color: 'white', fontWeight: '600' }}>Save Changes</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Placeholder buttons for future functionality */}
        <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/(tabs)/profile/exercise_history`)}
        >
          <ThemedText style={styles.actionButtonText}>Home Exercise History</ThemedText>
        </TouchableOpacity>
        <ThemedView style={styles.buttonRow}>
          <ThemedText style={styles.linkText}>Mute/Un-mute Patient</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.buttonRow, { backgroundColor: '#ffe6e6' }]}> 
          <ThemedText style={[styles.linkText, { color: 'red' }]}>DELETE Chat History</ThemedText>
        </ThemedView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  pen: {
    width: 24,
    height: 24,
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    color: 'black'
  },
  saveButton: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  saveGradient: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonRow: {
    margin: 10,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: AppColors.OffWhite,
    borderRadius: 15,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500'
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
