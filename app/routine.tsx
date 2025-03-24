import { useEffect, useState } from 'react';
import { Link, useRouter } from "expo-router";
import * as React from 'react';
import { Text, Button, View, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
// import { FlatList } from 'react-native-gesture-handler';
// import { exRoutine } from '@/components/exRoutine';
import { useUser } from '@clerk/clerk-expo';


const API_BASE_URL = "http://127.0.0.1:8000";
// const GET_ASSIGNED_ROUTINES_URL = (patient_id: string) => `${API_BASE_URL}/patient/get_assigned_routines/${patient_id}`;


export default function Routine() {
  const router = useRouter();
  const [patientData, setPatientData] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const [patientId, setPatientId] = useState<string | null>(null);
 

  useEffect(() => {
    const fetchAssignedRoutines = async () => {
      // Make sure user or user data is loaded
      if (!user || !isLoaded) {
        return;
      }

      // Display user id
      const patientId = user?.id;
      console.log("userid:", user?.id);
      setPatientId(patientId);
      setPatientName(user?.firstName || "Patient");

      // Error message if no patientId is available
      if (!patientId) {
        setError('Patient ID is not defined');
        return;
      }

      try {
        // Fetch assigned routines
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/get_assigned_routines/${patientId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
            
        // Throw an error if the response is not successful
        if (!response.ok) {
          throw new Error(`Failed to fetch assigned routines. Status: ${response.status}`);
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log("Fetched data:", data);
        // setPatientData(data);
        setRoutines(data);

      } catch (err) {
        setError("Fetching data unsuccessful");
        console.error("Error fetching assigned routines:", err);
      } 
    };
    fetchAssignedRoutines();
}, [isLoaded, user]);


// Display the error message
if (error) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

return (
  <LinearGradient
    colors={[AppColors.LightBlue, AppColors.White]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    {/* Welcome Message */}
    <ThemedView style={styles.welcomeText}>
        <View style={{ marginBottom: 20 }}>
            <ThemedText style={styles.text}>
              Welcome, {patientName}!
            </ThemedText>
        </View>

      {/* Display each assigned routine */}
        <FlatList
          data={routines}
          keyExtractor={(item) => item._id["$oid"]}
          renderItem={({ item: routine }) => (
            <View style={styles.routine}>
              <Text style={styles.routineTitle}>{routine.name}</Text>
            
            {/* Exercises within routine */}
              <FlatList
                data={routine.exercises}
                keyExtractor={(exercise) => exercise._id["$oid"]}
                renderItem={({ item: exercise }) => (
                  <View style={styles.exerciseItem}>

                    <Image source={{ uri: exercise.thumbnail_url }} style={styles.exerciseThumbnail} />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.title}</Text>
                      <Text>Reps: {exercise.reps}</Text>
                      <Text>Sets: {exercise.sets}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        />
    </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  buttonInner: {
    padding: 12,
    alignItems: "center",
    borderRadius: 20,
  },

  buttonText: {
    fontWeight: "bold",
  },

  text: {
  fontSize: 24, 
  fontWeight: "bold",
  },

  welcomeText: {
    flex: 1, 
    padding: 20, 
    backgroundColor: "#ffffff",
  },

  routine: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
  },

  routineTitle: {
    fontSize: 18, 
    fontWeight: "bold",
  },

  routineList: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },

  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },

  exerciseThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },

  exerciseInfo: {
    marginLeft: 10,
  },

  exerciseName: {
    fontSize: 15,
    fontWeight: "bold",
  },

  exerciseDetails: {
    fontSize: 14,
    color: "black",
  },

  bottomView: {
    backgroundColor: "white",
    alignSelf: "center",
  },


  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 15,
    marginTop: 5,
  },
});

