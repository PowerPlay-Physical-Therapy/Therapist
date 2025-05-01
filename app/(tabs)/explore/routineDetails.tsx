import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { AppColors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/base";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useGlobalSearchParams, useLocalSearchParams, useRouter, Link } from "expo-router";
import React, { useEffect, useState } from "react"
import { ScrollView, View, Text, Platform, Dimensions, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Notification from "@/components/Notification";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
// import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window")

export default function RoutineDetails() {

    const { user, isLoaded } = useUser();
    const router = useRouter();

    const local = useLocalSearchParams();
    console.log("local params:", local); 
    const parsedId = JSON.parse(local.exerciseId);
    const routineId = local.routineId?.toString(); 
    const exercise_id = parsedId.$oid;
    
    const [error, setError] = useState<string | null>(null);
    const [routine, setRoutine] = useState<any[]>([]);
    const [therapistName, setTherapistName] = useState<string | null>(null);
    const [therapistId, setTherapistId] = useState<string | null>(null);

    const [notification, setNotification] = useState(null);
    const [isLiked, setIsLiked] = useState(false);

    const showNotification = () => {
        setNotification({ message: "Adding New Routine!!", type: "info" });

        // Auto-hide after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    };


    // const routine = require('@/assets/Exercises.json');

    //TODO:Only for single exercise routine, need to change for multiple exercises
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!isLoaded) {
                    return;
                }

                try {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_exercise/${exercise_id}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    const data = await response.json();
                    setRoutine([data]);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            fetchData();
        }, [isLoaded])
    );

    const handleAddRoutine = async () => {
        showNotification();
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

        try {
            let newRoutineId = routineId;

            // If no routineId was passed, create one
            if (!routineId) {
                const newRoutine = {
                    title: routine[0]?.title || "Untitled Routine",
                    exercises: [{ _id: exercise_id }]
                };

                const createRoutineResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/create_routine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRoutine)
                });

                if (!createRoutineResponse.ok) throw new Error("Failed to create routine");

                const routineData = await createRoutineResponse.json();
                newRoutineId = routineData.routine_id;
            }

            const updateResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/add_custom_routines/${therapistId}/${newRoutineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            const updateData = await updateResponse.json();
            
            if (!updateResponse.ok) {
                console.error('Failed to update therapist with routine:', updateData);
            } else {
                console.log('Routine linked to therapist successfully:', updateData);
            }
            
            router.push('/');

        } catch (err) {
            console.error("Error adding routines:", err);
            setError("Failed to adding routines");
        }
    }


    const handleAssignPress = () => {
        // TODO: Implement assign functionality
        console.log("Assign button pressed");
        router.push(`/home/assignRoutine?routineId=${routineId}&therapistId=${user?.id}`);
    };

    return (
        <LinearGradient style={{ flex: 1, height: height, justifyContent: 'center', alignItems: 'center' }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            {notification && (
                <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}
            <View style={{width: width, justifyContent: 'center', alignItems: 'center' }}>
                <ScrollView
                    horizontal={true}
                    decelerationRate={0}
                    snapToInterval={width * 0.9} //your element width
                    snapToAlignment={"center"}>
                    {routine.map((exercise) => (
                        <View key={exercise._id} style={{ maxHeight: height * 0.9 }}>
                            <Card containerStyle={{ width: width * 0.9, borderRadius: 15, shadowOffset: { height: 0.2, width: 0.2 }, shadowRadius: 3, shadowOpacity: 0.7 }}>
                                <Card.Title style={{ fontSize: 20 }}>{exercise.title}</Card.Title>
                                <Card.Divider />
                                <Card.Image source={{ uri: exercise.thumbnail_url }} style={{ borderRadius: 15 }} containerStyle={{ borderRadius: 15, shadowOffset: { height: 0.5, width: 0.5 }, shadowRadius: 3, shadowOpacity: 0.7 }} />
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', }}>
                                    <View style={{}}>
                                        <Text style={{ fontSize: 20 }}><Text style={{ fontWeight: "bold" }}>Reps : </Text>{exercise.reps}</Text>
                                        <Text style={{ fontSize: 20 }}><Text style={{ fontWeight: "bold" }}>Hold : </Text>{exercise.hold} sec</Text>
                                    </View>
                                    <View style={{}}>
                                        <Text style={{ fontSize: 20 }}><Text style={{ fontWeight: "bold" }}>Sets: </Text>{exercise.sets}</Text>
                                        <Text style={{ fontSize: 20 }}><Text style={{ fontWeight: "bold" }}>Frequency : </Text>{exercise.frequency} / week</Text>
                                    </View>
                                </View>
                                <Text style={{ fontWeight: "bold", fontSize: 20 }}>Description : </Text>
                                <ScrollView style={{ maxHeight: height * 0.2 }}>
                                    <Text style={{ fontSize: 18 }} >
                                        {exercise.description}
                                    </Text>
                                </ScrollView>
                                <View style={{ alignItems: "center", marginTop: 5 }}>
                                    <LinearGradient
                                        colors={[AppColors.Purple, AppColors.Blue]}
                                        style={styles.button}
                                    >
                                        <TouchableOpacity
                                            style={styles.buttonInner}
                                            onPress={() => { console.log("VideoPlay") }}
                                        >
                                            <ThemedText style={styles.buttonText}>Watch Video</ThemedText>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>

                                <View style={{ position: 'absolute', bottom: 10, right: 10 }}>
                                    <Link href={`/explore/editRoutine?exerciseId=${exercise._id}`} asChild>
                                        <TouchableOpacity>
                                            <Image
                                                source={require('@/assets/images/settings.png')}
                                                style={{ height: 30, width: 30 }}
                                            />
                                        </TouchableOpacity>
                                    </Link>
                                </View>



                            </Card>
                        </View>
                    ))}
                </ScrollView>

                <View style={{ paddingBottom: 100, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 20 }}>

                    <TouchableOpacity onPress={handleAssignPress} style={{ marginHorizontal: 20, width: '40%' }}>
                        <LinearGradient
                            colors={[AppColors.Purple, AppColors.Blue]}
                            style={[styles.button, { margin: 0, width: '100%' }]}
                        >
                            <View style={styles.buttonInner}>
                                <ThemedText style={styles.buttonText}>Assign</ThemedText>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleAddRoutine} style={{ marginHorizontal: 20, width: '40%' }}>
                        <LinearGradient
                            colors={[AppColors.Purple, AppColors.Blue]}
                            style={[styles.button, { margin: 0, width: '100%' }]}
                        >
                            <View style={styles.buttonInner}>
                                <ThemedText style={styles.buttonText}>Add to Library</ThemedText>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    buttonInner: {
        padding: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        borderRadius: 25,
        width: '50%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});