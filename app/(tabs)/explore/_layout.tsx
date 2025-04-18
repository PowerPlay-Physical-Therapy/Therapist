
import { Stack } from "expo-router";

export default function ExploreLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="routineDetails" options={{ headerShown: true, headerBackTitle: 'Explore', title: 'Routine Detail' }} />
        </Stack>
    );
}