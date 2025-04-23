import { Image, StyleSheet, TouchableOpacity, Platform, TextInput, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { FlatList, View, Text } from 'react-native';

export default function HomeScreen() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const [therapistName, setTherapistName] = useState<string | null>(null);
    const [routines, setRoutines] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoaded } = useUser();
    const [therapistId, setTherapistId] = useState<string | null>(null);
    const [viewFavorites, setViewFavorites] = useState(false);

    useEffect(() => {
        const fetchRoutines = async () => {
            if (!user || !isLoaded) return;
            const id = user.id;
            setTherapistId(id);
            setTherapistName(user?.firstName || "Therapist");
            try {
                const route = viewFavorites
                    ? `/therapist/get_favorite_routines/${id}`
                    : `/therapist/get_custom_routines/${id}`;
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${route}`);
                if (!response.ok) throw new Error("Failed to fetch routines");
                const data = await response.json();
                setRoutines(data);
            } catch (err) {
                console.error("Error fetching routines:", err);
                setError("Failed to fetch routines");
            }
        };
        fetchRoutines();
    }, [isLoaded, user, viewFavorites]);

    if (error) {
        return (
            <View style={{ padding: 20 }}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader
                title={viewFavorites ? "Favorites" : "Home Library"}
                leftButton={null}
                rightButton={
                    <TouchableOpacity onPress={() => setViewFavorites(prev => !prev)}>
                      <Image
                        source={
                          viewFavorites
                            ? require('@/assets/images/heart-icon.png') // Filled heart image
                            : require('@/assets/images/heart-outline.png') // Outline heart image
                        }
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  }
                  
            />

            <FlatList
                data={routines}
                keyExtractor={(item) => item._id["$oid"] || item._id}
                style={{ padding: 20, marginBottom: 80 }}
                renderItem={({ item: routine }) => (
                    <View style={styles.routine}>
                        <Text style={styles.routineTitle}>{routine.name}</Text>
                        <View style={styles.exerciseList}>
                            <FlatList
                                data={routine.exercises}
                                keyExtractor={(exercise) => exercise._id["$oid"] || exercise._id}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                renderItem={({ item: exercise }) => (
                                    <View style={styles.exerciseItem}>
                                        <Image source={{ uri: exercise.thumbnail_url }} style={styles.exerciseThumbnail} />
                                        <View style={styles.exerciseInfo}>
                                            <Text style={styles.exerciseName}>{exercise.title}</Text>
                                            <Text>
                                                <Text style={styles.exerciseDetails}>Reps: </Text>
                                                {exercise.reps}
                                            </Text>
                                            <Text>
                                                <Text style={styles.exerciseDetails}>Sets: </Text>
                                                {exercise.sets}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => console.log("Heart toggle placeholder")}> 
                                            <Image source={require('@/assets/images/heart-outline.png')} style={{ width: 24, height: 24 }} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => router.push(`./home/customRoutine`)}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    title: { alignItems: 'center', justifyContent: 'center', height: '100%' },
    text: { fontSize: 24, fontWeight: "bold" },
    routine: { marginVertical: 10, padding: 15, borderRadius: 10 },
    routineTitle: { fontSize: 18, fontWeight: "bold" },
    routineList: { flexDirection: "row", alignItems: "center" },
    exerciseInfo: { flex: 1 },
    exerciseList: {
        marginTop: 10,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    exerciseThumbnail: { width: 82, height: 76, borderRadius: 5, marginRight: 10 },
    exerciseName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    exerciseDetails: { fontSize: 14, fontWeight: "bold", color: "black", marginLeft: 4 },
    exerciseItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 8 },
    separator: { height: 1, backgroundColor: "#9BB4D6", marginVertical: 5, width: "100%" },
    bottomView: { backgroundColor: "white", alignSelf: "center" },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 90,
        left: '50%',
        transform: [{ translateX: -30 }],
        width: 60,
        height: 60,
        marginTop: 10,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'black',
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 1000,
    },
    addButtonText: { color: "black", fontSize: 24, fontWeight: "bold" },
    errorText: { color: 'red', fontSize: 12, marginLeft: 15, marginTop: 5 },
});
