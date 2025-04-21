import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {ThemedText} from '@/components/ThemedText';


export default function EditRoutineScreen() {
    return (
        <LinearGradient colors={[AppColors.OffWhite, AppColors.LightBlue]} style={{ flex: 1 }}>
            <ScrollView>
                <View style={{ padding: 20 }}>
                    <ThemedText type="title" style={{ marginBottom: 20 }}>Edit Routine</ThemedText>
                    {/* Add your form or content here */}
                </View>
            </ScrollView>
        </LinearGradient>
    )
}