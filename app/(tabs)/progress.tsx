import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function ProgressScreen() {
    return (
        <ThemedView style={styles.title}>
            <ThemedText>Progress</ThemedText>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    } });