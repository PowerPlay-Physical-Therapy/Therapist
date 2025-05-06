
import { Stack } from "expo-router";
import { AppColors } from "@/constants/Colors";

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="exercise_history" options={{
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                },
                headerBackTitle: 'Profile',
                headerShown: true,
                title: "Exercise History",
            }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="manage_patients" options={{ headerShown: false }} />
            <Stack.Screen name="patient_info" options={{ headerShown: false }} />
        </Stack>
    );
}