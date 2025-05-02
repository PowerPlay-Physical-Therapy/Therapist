import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Platform, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

const mockData = [
    { name: 'Jane Doe', status: 'on-track' },
    { name: 'John Doe', status: 'off-track' },
    { name: 'Johnson', status: 'on-track' },
    { name: 'Grand Johnson', status: 'on-track' },
];

export default function AnalyticsScreen() {
    const handleNudge = (name: string) => {
        console.log(`Nudged ${name}`);
    };

    const handleViewDetails = (name: string) => {
        console.log(`Viewing details for ${name}`);
    };

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Patient Analytics" />
            <ScrollView style={styles.container}>
                <View style={styles.graphContainer}>
                    {/* Placeholder for graphs - we'll add actual graphs once you approve the chart library */}
                    <View style={styles.graphPlaceholder}>
                        <Text style={styles.graphText}>Patient Progress Graph</Text>
                    </View>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                            <Text style={styles.activeTabText}>Weekly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab}>
                            <Text style={styles.tabText}>Comparison</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab}>
                            <Text style={styles.tabText}>Future</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardsContainer}>
                    {mockData.map((patient, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.mainContent}>
                                <Text style={styles.name}>{patient.name}</Text>
                                <Text style={[
                                    styles.status,
                                    patient.status === 'on-track' ? styles.onTrack : styles.offTrack
                                ]}>
                                    {patient.status === 'on-track' ? 'On-track' : 'Off-track'}
                                </Text>
                            </View>
                            <View style={styles.buttons}>
                                <TouchableOpacity 
                                    style={styles.nudgeButton}
                                    onPress={() => handleNudge(patient.name)}
                                >
                                    <Text style={styles.buttonText}>Nudge</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.viewButton}
                                    onPress={() => handleViewDetails(patient.name)}
                                >
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                    <Image 
                                        source={require('@/assets/images/chevron-right.png')}
                                        style={styles.chevronIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    graphContainer: {
        padding: 16,
    },
    graphPlaceholder: {
        height: 200,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    graphText: {
        fontSize: 16,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 16,
    },
    activeTab: {
        backgroundColor: 'white',
    },
    tabText: {
        color: '#666',
    },
    activeTabText: {
        color: AppColors.Blue,
        fontWeight: '600',
    },
    cardsContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onTrack: {
        backgroundColor: '#e6f4ea',
        color: '#1e8e3e',
    },
    offTrack: {
        backgroundColor: '#fce8e6',
        color: '#d93025',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    nudgeButton: {
        flex: 1,
        backgroundColor: AppColors.Blue,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        paddingHorizontal: 8,
    },
    viewButtonText: {
        color: AppColors.Blue,
        fontSize: 14,
        fontWeight: '500',
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: AppColors.Blue,
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
    },
});