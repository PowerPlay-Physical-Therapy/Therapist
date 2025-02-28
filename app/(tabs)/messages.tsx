import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function MessagesScreen() {
    return (
        <ThemedView style={styles.title}>
            <ThemedText>Messages</ThemedText>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    } });