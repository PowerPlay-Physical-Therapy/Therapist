import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Platform, View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';

const {height, width }= Dimensions.get('window');

export default function AnalyticsScreen() {
    const router = useRouter();
    const {user} = useUser();
    const [therapistId, setTherapistId] = useState<string | null>(user?.id || null);
    const [connections, setConnections] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState<'routines' | 'exercises'>('routines');
    const [graphData, setGraphData] = useState<{ last_7_days: any[] }>({ last_7_days: [] });

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_graph_data/${therapistId}`);
                const data = await response.json();
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };
        if (therapistId) fetchGraphData();
    }, [therapistId]);

    const routinesData = graphData.last_7_days.map(item => item.routines_count);
    const exercisesData = graphData.last_7_days.map(item => item.exercises_count);
    const labels = graphData.last_7_days.map(item => item.date.slice(5));

    const currentData = selectedTab === 'routines' ? routinesData : exercisesData;
    const maxValue = Math.max(...currentData, 0);
    const segments = maxValue > 0 ? maxValue : 1;

    const chartData = {
        labels,
        datasets: [
            {
                data: currentData,
            }
        ],
    };

    const fetchConnections = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_connections/${therapistId}/therapist`);
            const data = await response.json();
            setConnections(data.connections);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    }

    useEffect(() => {
        fetchConnections();
    }, []);

    const handleNudge = async (expoPushToken: string, patientId: string) => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/send_push_message/${expoPushToken}?message=${user?.firstName} ${user?.lastName} nudged you! Remember to check your progress!`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                console.error('Error sending nudge:', response.statusText);
            }
            Alert.alert('Nudge sent successfully!');
            return router.push(`/(tabs)/message/[chat]?patientId=${patientId}`);
        } catch (error) {
            console.error('Error sending nudge:', error);
        }
    };

    const handleViewDetails = (name: string) => {
        console.log(`Viewing details for ${name}`);
    };

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Patient Analytics" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.graphContainer}>
                        <BarChart
                            data={chartData}
                            width={width - 32}
                            height={215}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => AppColors.Blue,
                                fillShadowGradient: AppColors.Blue,
                                fillShadowGradientOpacity: 1,
                                style: {
                                    borderRadius: 25
                                },
                                barPercentage: 0.5,
                                propsForLabels: {
                                    fontSize: 10
                                }
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                            yAxisLabel=""
                            yAxisSuffix=""
                            showBarTops={true}
                            withInnerLines={false}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                            segments={segments}
                        />
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tab, selectedTab === 'routines' && styles.activeTab]} onPress={() => setSelectedTab('routines')}>
                            <Text style={selectedTab === 'routines' ? styles.activeTabText : styles.tabText}>Routines</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, selectedTab === 'exercises' && styles.activeTab]} onPress={() => setSelectedTab('exercises')}>
                            <Text style={selectedTab === 'exercises' ? styles.activeTabText : styles.tabText}>Exercises</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardsContainer}>
                    {connections.map((patient, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.mainContent}>
                                <Text style={styles.name}>{patient.firstname} {patient.lastname}</Text>
                                <Text style={[
                                    styles.status,
                                    patient.status === 'on-track' ? styles.onTrack : styles.offTrack
                                ]}>
                                    {patient.status === 'on-track' ? 'On-track' : 'Off-track'}
                                </Text>
                            </View>
                            <View style={styles.buttons}>

                            <LinearGradient
                                        colors={[AppColors.Purple, AppColors.Blue]}
                                        style={styles.button}
                                    >
                                        <TouchableOpacity
                                            style={styles.buttonInner}
                                            onPress={() => handleNudge(patient.expoPushToken, patient._id)}
        
                                        >
                                            <ThemedText style={styles.buttonText}>Nudge</ThemedText>
                                        </TouchableOpacity>
                                    </LinearGradient>

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

    buttonInner: {
        padding: 5,
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: 'medium',
        color: 'white',
    },
    button: {
        borderRadius: 25,
        width: '50%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});