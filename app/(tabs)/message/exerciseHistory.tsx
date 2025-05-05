import { RefreshControl, Image, StyleSheet, Platform, TextInput, SafeAreaView, TouchableOpacity, Touchable } from 'react-native';
import { useState } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { useEffect } from 'react';
import { Link, useRouter } from "expo-router";
import * as React from 'react';
import { Text, View, FlatList, Dimensions, ScrollView, Modal } from 'react-native';
import capitalizeWords from '@/utils/capitalizeWords';
import LoadingSpinner from "@/components/LoadingSpinner";

const { height, width } = Dimensions.get("window");

export default function ExerciseHistory() {
    const { isSignedIn } = useAuth()
    const router = useRouter();
    const [patientName, setPatientName] = useState<string | null>(null);
    const [routines, setRoutines] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoaded } = useUser();
    const [patientId, setPatientId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTabVisible, setIsTabVisible] = useState(true);
    const [activeTab, setActiveTab] = useState(0);


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
            setRoutines(data);

        } catch (err) {
            setError("Fetching data unsuccessful");
            console.error("Error fetching assigned routines:", err);
        }
    };
    
    useEffect(() => {
        fetchAssignedRoutines();
    }, [isLoaded, user]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchAssignedRoutines();
        setIsRefreshing(false);
    }


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
            style={{ flex: 1, paddingTop: Platform.OS == "ios" ? 50 : 0 }}
            colors={[AppColors.OffWhite, AppColors.LightBlue]}
        >

            {!routines && (
                <ScrollView style={{ flex: 1}}>  
                    <ThemedText style={{ alignSelf: 'center', color : 'black', paddingTop: 80}}>Loading Routines...</ThemedText>
                </ScrollView>
            )}

            {routines && routines.length === 0 && (
                <ScrollView style={{ flex: 1}}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ThemedText style={{ alignSelf: 'center', color : 'black', paddingTop: 80}}>No Routines Added</ThemedText>
                    </View>
                </ScrollView>)}

            {routines && routines.length > 0 && (
                    
            <FlatList
            data={routines}
            keyExtractor={(item, index) => item._id["$oid"] || index.toString()}
            style={{ padding: 8, marginBottom: 80 }}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            renderItem={({ item: routine }) => (
                
                <View style={styles.routine}>
                    {}
                    <Text style={styles.routineTitle}>{capitalizeWords(routine.name)}</Text>

                    {/* Exercises within routine */}
                    <View style={styles.exerciseList}>
                        <FlatList
                            data={routine.exercises}
                            keyExtractor={(exercise, index) => exercise._id["$oid"] || index.toString()}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            renderItem={({ item: exercise }) => (
                                
                                <Link href={`/message/routineDetails?routineId=${routine._id["$oid"]}`}>
                                    
                                    <View style={styles.exerciseItem}>

                                        <Image source={exercise.thumbnail_url? { uri: exercise.thumbnail_url } : require(`@/assets/images/default-thumbnail.png`)} style={styles.exerciseThumbnail} />
                                        <View style={styles.exerciseInfo}>
                                            <ThemedText style={styles.exerciseName}>{capitalizeWords(exercise.title)}</ThemedText>
                                            <ThemedText>
                                                <Text style={styles.exerciseDetails}>Reps: </Text> 
                                                {exercise.reps}
                                            </ThemedText>
                                            <ThemedText>
                                                <Text style={styles.exerciseDetails}>Sets: </Text>
                                                {exercise.sets}
                                            </ThemedText>
                                        </View>
                                        <Link href={`/home/editRoutine?routineId=${routine._id}`}>
                                            <Image source={require('@/assets/images/chevron-right.png')} style={{width: 20, height: 20}}/>
                                        </Link>                                    
                                    </View>
                                
                                </Link>

                                
                                
                            )}
                        />
                    </View>
                </View>
                
            )}
        />
        )}
            <Modal 
                transparent={true}
                visible={isRefreshing}
            >
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>

                    <View style={styles.modalView}>
                        <ThemedText style={{fontSize: 16}}>Updating...</ThemedText>
                        <LoadingSpinner color={AppColors.Blue} durationMs={1000}/>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
  );
      
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
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
        marginVertical: 0,
        padding: 15,
        borderRadius: 10,
    },

    routineTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    routineList: {
        flexDirection: "row",
        alignItems: "center",
    },

    exerciseInfo: {
        flex: 1,
    },

    exerciseList: {
        marginTop: 10,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },

    exerciseThumbnail: {
        width: 82,
        height: 76,
        borderRadius: 5,
        marginRight: 10,
    },

    exerciseName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,

    },

    exerciseDetails: {
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
    },

    exerciseItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },

    separator: {
        height: 1,
        backgroundColor: "#9BB4D6",
        marginVertical: 5,
        width: "100%",
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

    modalView: {
        margin: 20,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
    },
});




