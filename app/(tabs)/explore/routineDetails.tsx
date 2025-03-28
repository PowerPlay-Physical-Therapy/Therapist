import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { AppColors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Card } from "@rneui/base";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useGlobalSearchParams, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react"
import { ScrollView, View, Text, Platform, Dimensions, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Notification from "@/components/Notification";
// import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window")

export default function RoutineDetails() {

    const { user } = useUser();

    const local = useLocalSearchParams();
    const parsedId = JSON.parse(local.exerciseId);
    const exercise_id = parsedId.$oid;

    const [routine, setRoutine] = useState([]);

    const [notification, setNotification] = useState(null);

    const showNotification = () => {
        setNotification({ message: "Adding New Routine!!", type: "info" });

        // Auto-hide after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    };


    // const routine = require('@/assets/Exercises.json');

    //TODO:Only for single exercise routine, need to change for multiple exercises
    useEffect(() => {
        const fetchData = async () => {
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
    }, []);

    const handleAddRoutine = () => {
        showNotification();
        // Toast.show({ text1: "Hello", type: "success" })
        console.log(1)
        const writeData = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/add_explore_routine/${user?.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: routine[0].title,
                        exercises: routine.map(exercise => ({ _id: exercise._id }))
                    })
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log("Fetched data:", data);

                router.back();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        writeData();
    }

    return (
        <LinearGradient style={{ height: height }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            {notification && (
                <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
            )}
            <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
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