import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { AppColors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/base";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react"
import { ScrollView, View, Text, Platform, Dimensions, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Notification from "@/components/Notification";
// import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window")

type RoutineParams = {
    routineId: string;
};

type Exercise = {
    title: string;
    thumbnail_url: string;
    reps: number;
    hold: number;
    sets: number;
    frequency: number;
    description: string;
};

export default function RoutineDetails() {
    const { user } = useUser();
    const { routineId } = useLocalSearchParams<RoutineParams>();
    const [routine, setRoutine] = useState<Exercise[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: string; onClose?: () => void } | null>(null);

    const showNotification = () => {
        setNotification({ 
            message: "Adding New Routine!!", 
            type: "info",
            onClose: () => setNotification(null)
        });
    };

    // const routine = require('@/assets/Exercises.json');

    // TODO:Only for single exercise routine, need to change for multiple exercises
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_routine/${routineId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log("Routine data:", data);
                setRoutine(data.exercises);
            } catch (error) {
                console.error("Error fetching routine:", error);
            }
        };
        fetchData();
    }, [routineId]);

    const handleAddRoutine = async () => {
        showNotification();
        // Toast.show({ text1: "Hello", type: "success" })
        console.log(1)
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/update_assigned_routines/${user?.id}/${routineId}`,
                { method: 'PUT' }
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            console.log("Routine added successfully");
            router.back();
        } catch (error) {
            console.error("Error adding routine:", error);
        }
    }

    return (
        <LinearGradient style={{ height: height, flex: 1, justifyContent: 'center', alignItems: 'center' }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>

            <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>

                <ScrollView
                    horizontal={true}
                    decelerationRate={0}
                    snapToInterval={width * 0.9} //your element width
                    snapToAlignment={"center"}>
                    {routine.map((exercise, index) => (
                        <View key={index} style={{ maxHeight: height * 0.9 }}>
                            <Card containerStyle={{ width: width * 0.9, borderRadius: 15, shadowOffset: { height: 0.2, width: 0.2 }, shadowRadius: 3, shadowOpacity: 0.7, backgroundColor: AppColors.OffWhite }}>
                                <Card.Title style={{ fontSize: 20, fontFamily: 'Montserrat' }}>{exercise.title}</Card.Title>
                                <Card.Divider />
                                <Card.Image source={{ uri: exercise.thumbnail_url }} style={{ borderRadius: 15 }} containerStyle={{ borderRadius: 15, shadowOffset: { height: 0.5, width: 0.5 }, shadowRadius: 3, shadowOpacity: 0.7 }} />
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', paddingTop: 12 }}>
                                    <View style={{}}>
                                        <ThemedText style={{ fontSize: 20 }}><ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>Reps : </ThemedText>{exercise.reps}</ThemedText>
                                        <ThemedText style={{ fontSize: 20 }}><ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>Hold : </ThemedText>{exercise.hold} sec</ThemedText>
                                    </View>
                                    <View style={{}}>
                                        <ThemedText style={{ fontSize: 20 }}><ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>Sets: </ThemedText>{exercise.sets}</ThemedText>
                                        <ThemedText style={{ fontSize: 20 }}><ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>Frequency : </ThemedText>{exercise.frequency} / week</ThemedText>
                                    </View>
                                </View>
                                <ThemedText style={{ fontWeight: "bold", fontSize: 20 }}>Description : </ThemedText>
                                <ScrollView style={{ maxHeight: height * 0.2 }}>
                                    <ThemedText style={{ fontSize: 18 }} >
                                        {exercise.description}
                                    </ThemedText>
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

                            </Card>
                        </View>
                    ))}
                </ScrollView>

                <LinearGradient
                    colors={[AppColors.Purple, AppColors.Blue]}
                    style={[styles.button, { margin: 10, justifyContent: 'flex-end', alignItems: 'center' }]}
                >
                    <TouchableOpacity
                        style={styles.buttonInner}
                        onPress={handleAddRoutine}
                    >
                        <ThemedText style={styles.buttonText}>Add</ThemedText>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)}
                />
            )}

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