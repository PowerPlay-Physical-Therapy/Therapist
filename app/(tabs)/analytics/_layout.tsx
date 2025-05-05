
import { Stack } from "expo-router";

export default function AnalyticsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="patientDetails" options={{ headerShown: true, headerTitle: 'Patient Details', headerBackTitle: 'Analytics',}} />
        </Stack>
    );
}