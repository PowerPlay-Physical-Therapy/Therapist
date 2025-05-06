
import { Stack } from "expo-router";
import { AppColors } from "@/constants/Colors";

export default function ExploreLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="editRoutine" options={{
                                        headerShown: true, headerBackTitle:'Back', title:'Edit Routine',
                                        headerStyle: {
                                            backgroundColor: AppColors.OffWhite,
                                        },
                                     }} />
            <Stack.Screen name="routineDetails" options={{
                            headerShown: true, headerBackTitle:'Back', title:'Routine Details',
                            headerStyle: {
                                backgroundColor: AppColors.OffWhite,
                            },
                         }} />
            <Stack.Screen name="assignRoutine" options={{
                            headerShown: true, headerBackTitle:'Back', title:'Assign Routine',
                            headerStyle: {
                                backgroundColor: AppColors.OffWhite,
                            },
                         }} />
        </Stack>
    );
}