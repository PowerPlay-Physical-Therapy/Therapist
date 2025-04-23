import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Platform, FlatList, TouchableOpacity, Image, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SearchBar } from '@rneui/themed';
import { Badge } from '@rneui/base';

type Patient = {
    _id: string;
    firstname: string;
    lastname: string;
    imageUrl?: string;
    username: string;
};

export default function MessagesScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [connections, setConnections] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [filteredResults, setFilteredResults] = useState<Patient[]>([]);

    useEffect(() => {
        const therapistId = user?.id;
        console.log("Therapist ID: ", therapistId);
        const fetchConnections = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_connections/${therapistId}/therapist`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setConnections(data.connections);
            } catch (error) {
                console.error("Error Fetching Connections", error);
            }
        };
        fetchConnections();
    }, [])

    useEffect(() => {
        const filtered = connections.filter((patient: any) => {
            return patient.firstname.toLowerCase().includes(search.toLowerCase()) ||
                patient.lastname.toLowerCase().includes(search.toLowerCase()) ||
                patient.username.toLowerCase().includes(search.toLowerCase())
        });
        setFilteredResults(filtered);
    }, [search, connections]);

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 20 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Messages" logo={true} />
            <SearchBar round={true} containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }} inputContainerStyle={{ backgroundColor: AppColors.LightBlue }} placeholder='Search Patients' onChangeText={setSearch} value={search} style={styles.search} />
            <View style={{ paddingLeft: 20, paddingRight: 20, flex: 1 }}>
                <FlatList
                    data={filteredResults}
                    keyExtractor={(item) => item["_id"]}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.messageRow} onPress={() => {
                            const patientId = item["_id"];
                            console.log("Navigating with patientId:", patientId);
                            router.push({
                                pathname: "/message/[chat]",
                                params: { 
                                    chat: patientId,
                                }
                            });
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={{ uri: item?.imageUrl }} style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    marginRight: 12
                                }} />
                                <ThemedText>{item["firstname"]} {item["lastname"]}</ThemedText>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={require('@/assets/images/mute.png')} style={{ width: 20, height: 20, tintColor: AppColors.Purple, marginRight: 5 }} />
                                <Badge value="3" status="error" />
                                <Image source={require('@/assets/images/chevron-right.png')} style={{ width: 20, height: 20 }} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    search: {
        // Add your search bar styles here
    }
});