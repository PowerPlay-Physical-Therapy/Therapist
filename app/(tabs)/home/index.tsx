import { Image, StyleSheet, TouchableOpacity, Platform, TextInput, SafeAreaView } from 'react-native';
import { useState } from 'react';
// import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { Collapsible } from '@/components/Collapsible';
import { useEffect } from 'react';
import { Link, useRouter } from "expo-router";
import * as React from 'react';
import { Text, View, FlatList } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';




export default function HomeScreen() {
    const { isSignedIn } = useAuth()
    const router = useRouter();
    const [therapistName, setTherapistName] = useState<string | null>(null);
    const [routines, setRoutines] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoaded } = useUser();
    const [therapistId, setTherapistId] = useState<string | null>(null);


    const [isTabVisible, setIsTabVisible] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomRoutines = async () => {
            if (!user || !isLoaded) {
                return;
            }
    
            // Display user id
            const therapistId = user?.id;
            console.log("userid:", user?.id);
            setTherapistId(therapistId);
            setTherapistName(user?.firstName || "Therapist");

            // Error message if no therapistID is available
            if (!therapistId) {
                setError('Therapist ID is not defined');
                return;
            }

            console.log("therapistid:", therapistId);

            try {
                // fetch custom routines
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/get_custom_routines/${therapistId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                // Throw an error if the response is not successful                
                if (!response.ok) {
                    throw new Error("Failed to fetch custom routines");
                }

                // Parse the response as JSON
                const data = await response.json();
                console.log("Fetched data:", data);
                setRoutines(data);

            } catch (err) {
                console.error("Error fetching routines:", err);
                setError("Failed to fetch routines");
            }
        };
        fetchCustomRoutines();
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
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Home Library" logo={true} />


            {/* Display each assigned routine */}
            <FlatList
                data={routines}
                keyExtractor={(item) => item._id["$oid"]}
                style={{ padding: 20, marginBottom: 80 }}
                renderItem={({ item: routine }) => (            
                    <View style={styles.routine}>
                        <Text style={styles.routineTitle}>{routine.name}</Text>
                    
                        {/* Exercises within routine */}
                        <View style={styles.exerciseList}>
                            <FlatList
                                data={routine.exercises}
                                keyExtractor={(exercise) => exercise._id["$oid"]}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                renderItem={({ item: exercise }) => (
                                    <View style={styles.exerciseItem}>
                                        <Image source={{ uri: exercise.thumbnail_url }} style={styles.exerciseThumbnail} />
                                        <View style={styles.exerciseInfo}>
                                            <Text style={styles.exerciseName}>{exercise.title}</Text>
                                            <Text>
                                                <Text style={styles.exerciseDetails}>Reps: </Text>
                                                {exercise.reps}
                                            </Text>
                                            <Text>
                                                <Text style={styles.exerciseDetails}>Sets: </Text>
                                                {exercise.sets}
                                            </Text>
                                        </View>

                                        <Image source={require('@/assets/images/chevron-right.png')} style={{width: 20, height: 20}} />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => {
                console.log("Navigating to Custom Routine screen");
                router.push(`./home/customRoutine`);
            }}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

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


    routine: {
        marginVertical: 10,
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
        marginLeft: 4,
    },


    exerciseItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
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

    // addButton: {
    //     position: "absolute",
    //     bottom: Platform.OS === 'ios' ? 100 : 90,
    //     right: 20,
    //     width: 50,
    //     height: 50,
    //     borderRadius: 30,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     shadowColor: "black",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 2,
    //     zIndex: 1000,
    //     elevation: 5,
    //     backgroundColor: 'red',
    // },

    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 90, // Adjust for iOS and Android
        left: '50%',
        transform: [{ translateX: -30 }],
        width: 60,
        height: 60,
        marginTop: 10,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'black',
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 1000,
    },
    

    addButtonText: {
        color: "black",
        fontSize: 24,
        fontWeight: "bold",
    },

    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 5,
    },
});
