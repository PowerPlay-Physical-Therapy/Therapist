
import { Stack } from "expo-router";
import { AppColors } from "@/constants/Colors";

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="customRoutine" options={{
                headerShown: true, headerBackTitle:'Back', title:'Custom Routine',
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                },
             }} />
             <Stack.Screen name="assignRoutine" options={{
                headerShown: true, headerBackTitle:'Back', title:'Custom Routine',
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                },
             }}/>
             <Stack.Screen name="editRoutine" options={{
                headerShown: true, headerBackTitle:'Back', title:'Custom Routine',
                headerStyle: {
                    backgroundColor: AppColors.OffWhite,
                },
             }}/>
        </Stack>
    );
}