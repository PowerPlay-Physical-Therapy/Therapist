import { ThemedText } from "@/components/ThemedText";
import { AppColors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useUser } from "@clerk/clerk-expo";

export default function PatientInfo() {
    const { patientId } = useLocalSearchParams<{ patientId: string }>();
    const [patient, setPatient] = useState<any | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                // Fetch patient data
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/get_patient/${patientId}`);
                const data = await response.json();
                setPatient(data);

                // Fetch connection to get mute status
                if (user?.id) {
                    const connectionResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_connection/${patientId}/${user.id}`);
                    if (connectionResponse.ok) {
                        const connectionData = await connectionResponse.json();
                        setIsMuted(connectionData.is_muted || false);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchPatient();
    }, [patientId, user?.id]);

    const handleMuteToggle = async () => {
        if (!user?.id || !patientId) {
            console.error('Missing required IDs');
            return;
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/toggle_mute/${patientId}/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    Alert.alert("Error", "Connection not found");
                    return;
                }
                throw new Error(data.detail || 'Failed to update mute status');
            }

            // Toggle local mute state
            setIsMuted(!isMuted);

            // Show feedback to user
            Alert.alert(
                "Success",
                `Patient ${!isMuted ? "muted" : "unmuted"} successfully`
            );

        } catch (error) {
            console.error('Error toggling mute status:', error);
            Alert.alert("Error", "Failed to update mute status");
        }
    };

    const handleDeleteChat = async () => {
        if (!user?.id || !patientId) {
            console.error('Missing required IDs');
            return;
        }

        // Show confirmation alert
        Alert.alert(
            "Delete Chat History",
            "Are you sure you want to delete the chat history? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/delete_chat/${user.id}/${patientId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                if (response.status === 404) {
                                    Alert.alert("Error", "No chat history found");
                                    return;
                                }
                                throw new Error(data.detail || 'Failed to delete chat history');
                            }

                            Alert.alert(
                                "Success",
                                "Chat history deleted successfully",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => router.back()
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error deleting chat:', error);
                            Alert.alert("Error", "Failed to delete chat history");
                        }
                    }
                }
            ]
        );
    };

    return (
        <LinearGradient style={styles.container} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <View style={styles.card}>
                <View style={styles.profileSection}>
                    <Image 
                        source={{ uri: patient?.imageUrl || require('@/assets/images/app-logo.png') }}
                        style={styles.profileImage}
                    />
                    <View style={styles.patientInfo}>
                        <ThemedText style={styles.name}>{patient?.firstname} {patient?.lastname}</ThemedText>
                        <View style={styles.diagnosisContainer}>
                            <ThemedText style={styles.diagnosisLabel}>Diagnosis:</ThemedText>
                            <ThemedText style={styles.diagnosisText}>{patient?.diagnosis || 'Not specified'}</ThemedText>
                        </View>
                        <View style={styles.notesContainer}>
                            <ThemedText style={styles.notes}>{patient?.notes || 'No notes available'}</ThemedText>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Image 
                            source={require('@/assets/images/Magicpen.png')}
                            style={styles.editIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/message/exerciseHistory')}
            >
                <ThemedText style={styles.actionButtonText}>Home Exercise History</ThemedText>
                <Image 
                    source={require('@/assets/images/chevron-right.png')}
                    style={styles.chevronIcon}
                />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionButton, styles.muteButton]}
                onPress={handleMuteToggle}
            >
                <ThemedText style={styles.muteButtonText}>
                    {isMuted ? 'Unmute Patient' : 'Mute Patient'}
                </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteChat}
            >
                <ThemedText style={styles.deleteButtonText}>DELETE Chat History</ThemedText>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginVertical: 20,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    patientInfo: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    diagnosisContainer: {
        marginBottom: 8,
    },
    diagnosisLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    diagnosisText: {
        fontSize: 16,
    },
    notesContainer: {
        marginTop: 8,
    },
    notes: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        padding: 8,
    },
    editIcon: {
        width: 20,
        height: 20,
        tintColor: '#666',
    },
    actionButton: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    chevronIcon: {
        width: 24,
        height: 24,
        tintColor: '#666',
    },
    muteButton: {
        backgroundColor: 'white',
    },
    muteButtonText: {
        color: AppColors.Blue,
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: 'white',
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '500',
    },
});