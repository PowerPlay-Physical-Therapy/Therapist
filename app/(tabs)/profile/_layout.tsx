
import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="exercise_history" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="manage_patients" options={{ headerShown: false }} />
            <Stack.Screen name="patient_info" options={{ headerShown: false }} />
        </Stack>
    );
}