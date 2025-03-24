import { Stack } from "expo-router";


export default function ExploreLayout() {
    return (
        <Stack screenOptions={{
            headerShown: true,
            headerBackButtonDisplayMode:'default',
            headerBackTitle: 'Explore',
        }}>
            <Stack.Screen name="routineDetails" options={{ title: "Routine Details" }}  />
        </Stack>
    );
}