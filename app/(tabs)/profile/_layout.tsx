
import { Stack } from "expo-router";
import { AppColors } from "@/constants/Colors";

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="manage_patients" options={{headerShown: false}}/>
            <Stack.Screen name="patient_info" options={{
                                        headerShown: true, headerBackTitle:'Back', title:'Details',
                                        headerStyle: {
                                            backgroundColor: AppColors.OffWhite,
                                        },
                                     }}/>
            <Stack.Screen name="exerciseHistory" options={{
                                        headerShown: true, headerBackTitle:'Back', title:'Exercise History',
                                        headerStyle: {
                                            backgroundColor: AppColors.OffWhite,
                                        },
                                     }}/>
        </Stack>
    );
}