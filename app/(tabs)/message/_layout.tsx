import { AppColors } from "@/constants/Colors";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { View, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";

type SearchParams = {
    chat: string;
};

type Patient = {
    _id: string;
    firstname: string;
    lastname: string;
};

export default function MessageLayout() {
    const params = useLocalSearchParams<SearchParams>();
    console.log("Layout params:", params);
    const { chat} = params;
    // Extract the ID portion if it's a full user ID format
    const patientId =  chat;
    console.log("Processed patientId in layout:", patientId);
    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchPatient = async () => {
            if (!patientId) {
                console.log("No patientId available");
                return;
            }
            console.log("Fetching patient with ID:", patientId);
            try {
                const response = await fetch(
                    `${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/get_patient/${patientId}`
                );
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                console.log("Fetched patient data:", data);
                setPatient(data);
            } catch (error) {
                console.error("Error fetching patient:", error);
            }
        };
        fetchPatient();
    }, [patientId]);

    const renderHeaderRight = () => {
        if (!patientId) return null;
        
        return (
            <TouchableOpacity 
                onPress={() => {
                    router.push(`/(tabs)/message/patientInfo?patientId=${patientId}`)
                }}
            >
                <Image 
                    style={{
                        width: 30,
                        height: 30,
                        marginRight: 15,
                        tintColor: AppColors.Black,
                        backgroundColor: 'red'
                    }} 
                    source={require("@/assets/images/info.png")}
                />
            </TouchableOpacity>
        );
    };

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[chat]" options={{
                headerShown: true, 
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                }, 
                headerBackTitle: "Messages", 
                headerTitle: patient ? `${patient.firstname} ${patient.lastname}` : 'Chat',
                headerRight: renderHeaderRight
            }} />
            <Stack.Screen name="video" options={{
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                },
                headerBackTitle: 'Chat',
                headerShown: true,
                title: "Video",
            }} />
            <Stack.Screen name="routineDetails" options={{ 
                headerShown: true, 
                headerBackTitle: 'Chat', 
                title: 'Routine Detail' 
            }} />
            <Stack.Screen name="patientInfo" options={{ 
                headerShown: true, 
                headerBackTitle: 'Chat', 
                title: 'Patient Info' 
            }} />
        </Stack>
    );
}