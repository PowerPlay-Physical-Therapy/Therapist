import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PrivacyPolicy() {
    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Privacy Policy</ThemedText>
                
                <ThemedText style={styles.section}>Last Updated: {new Date().toLocaleDateString()}</ThemedText>
                
                <ThemedText style={styles.section}>
                    1. Information We Collect
                </ThemedText>
                <ThemedText style={styles.content}>
                    [Your privacy policy content here]
                </ThemedText>

                <ThemedText style={styles.section}>
                    2. How We Use Your Information
                </ThemedText>
                <ThemedText style={styles.content}>
                    [Your privacy policy content here]
                </ThemedText>

                {/* Add more sections as needed */}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 15,
    },
}); 