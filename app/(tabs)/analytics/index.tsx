import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Platform, View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect, useMemo } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';

// Types
type Patient = {
    _id: string;
    firstname: string;
    lastname: string;
    status: 'on-track' | 'off-track';
    expoPushToken: string;
};

type GraphData = {
    last_7_days: Array<{
        date: string;
        routines_count: number;
        exercises_count: number;
    }>;
};

const {height, width }= Dimensions.get('window');

export default function AnalyticsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [therapistId, setTherapistId] = useState<string | null>(user?.id || null);
    const [connections, setConnections] = useState<Patient[]>([]);
    const [selectedTab, setSelectedTab] = useState<'routines' | 'exercises'>('routines');
    const [graphData, setGraphData] = useState<GraphData>({ last_7_days: [] });
    const [selectedPatient, setSelectedPatient] = useState<Patient>({
        _id: "",
        firstname: "",
        lastname: "",
        status: 'on-track',
        expoPushToken: "",
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Memoized data transformations
    const chartData = useMemo(() => {
        const data = graphData.last_7_days?.map(item => 
            selectedTab === 'routines' ? Number(item?.routines_count) || 0 : Number(item?.exercises_count) || 0
        );
        if (!data) return { data: [], segments: 1, chartConfig: {} };
        const maxValue = Math.max(...data, 0);
        const segments = maxValue > 0 ? maxValue : 1;
        
        return {
            data,
            segments,
            chartConfig: {
                labels: graphData.last_7_days.map(item => item?.date?.slice(5) || ''),
                datasets: [{ data }]
            }
        };
    }, [graphData, selectedTab]);

    // Fetch connections
    const fetchConnections = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_connections/${therapistId}/therapist`);
            const data = await response.json();
            setConnections(data.connections);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    // Fetch graph data
    const fetchGraphData = async () => {
        if (!selectedPatient._id) return;
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_graph_data/${selectedPatient._id}`);
            const data = await response.json();
            setGraphData(data);
        } catch (error) {
            console.error('Error fetching graph data:', error);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchConnections();
        await fetchGraphData();
        setIsRefreshing(false);
    }

    // Effects
    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        if (connections.length > 0 && !selectedPatient._id) {
            setSelectedPatient(connections[0]);
        }
    }, [connections]);

    useEffect(() => {
        fetchGraphData();
    }, [selectedPatient]);

    const handleNudge = async (expoPushToken: string, patientId: string) => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/send_push_message/${expoPushToken}?message=${user?.firstName} ${user?.lastName} nudged you! Remember to check your progress!`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to send nudge');
            }
            
            Alert.alert('Nudge sent successfully!');
            router.push(`/(tabs)/message/[chat]?patientId=${patientId}`);
        } catch (error) {
            Alert.alert('Nudge sent successfully!');
            router.push(`/(tabs)/message/[chat]?patientId=${patientId}`);
        }
    };

    const handleViewDetails = async (patientId: string) => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/get_patient/${patientId}`);
                if (!response.ok) {
                    throw new Error('Patient not found');
                }
                const data = await response.json();
                router.push({
                    pathname: '/analytics/patientInfo',
                    params: {
                        patientId: data._id,
                        therapistId: user?.id,
                        name: `${data.firstname} ${data.lastname}`,
                        imageUrl: data.imageUrl,
                    }
                });
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to fetch patient details');
            }
    };

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Patient Analytics" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                >
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={selectedPatient._id}
                        onValueChange={(itemValue) => {
                            const selected = connections.find(patient => patient._id === itemValue);
                            if (selected) {
                                setSelectedPatient(selected);
                            }
                        }}
                    >
                        <Picker.Item label="Select a patient" value="" />
                        {connections.map((patient) => (
                            <Picker.Item
                                key={patient._id}
                                label={`${patient.firstname} ${patient.lastname}`}
                                value={patient._id}
                            />
                        ))}
                    </Picker>
                </View>
                
                <View style={styles.graphContainer}>
                    {chartData.data.length > 0 ? (
                        <View style={styles.graphPlaceholder}>
                            <BarChart
                                data={chartData.chartConfig}
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
                                    style: { borderRadius: 25 },
                                    barPercentage: 0.5,
                                    propsForLabels: { fontSize: 10 }
                                }}
                                style={styles.chart}
                                yAxisLabel=""
                                yAxisSuffix=""
                                showBarTops={true}
                                withInnerLines={false}
                                withVerticalLabels={true}
                                withHorizontalLabels={true}
                                segments={chartData.segments}
                            />
                        </View>
                    ) : (
                        <View style={styles.graphPlaceholder}>
                            <Text style={styles.graphText}>No data available</Text>
                        </View>
                    )} 

                    <View style={styles.tabContainer}>
                        <TouchableOpacity 
                            style={[styles.tab, selectedTab === 'routines' && styles.activeTab]} 
                            onPress={() => setSelectedTab('routines')}
                        >
                            <Text style={[styles.tabText, selectedTab === 'routines' && styles.activeTabText]}>
                                Routines
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tab, selectedTab === 'exercises' && styles.activeTab]} 
                            onPress={() => setSelectedTab('exercises')}
                        >
                            <Text style={[styles.tabText, selectedTab === 'exercises' && styles.activeTabText]}>
                                Exercises
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardsContainer}>
                    {connections.map((patient) => (
                        <View key={patient._id} style={styles.card}>
                            <View style={styles.mainContent}>
                                <Text style={styles.name}>
                                    {patient.firstname} {patient.lastname}
                                </Text>
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
                                    onPress={() => handleViewDetails(patient._id)}
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
        marginTop: 16,
        marginBottom: 80,
    },
    pickerContainer: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 20,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: 140,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 20,
        color: AppColors.Blue,
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
    chart: {
        marginVertical: 8,
        borderRadius: 16,
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
        gap: 10,
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
    buttonInner: {
        padding: 5,
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: 'medium',
        color: 'white',
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
});