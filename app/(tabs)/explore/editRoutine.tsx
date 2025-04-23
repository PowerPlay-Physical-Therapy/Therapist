import * as React from 'react';
import { useState, useEffect } from 'react';
import { Image, Dimensions, Platform, SafeAreaView, StyleSheet, Text, View, FlatList, TextInput, Button, TouchableOpacity, ScrollView, ImageSourcePropType } from 'react-native';
import { useAuth, useUser, useSignIn } from '@clerk/clerk-expo';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ScreenHeader from '@/components/ScreenHeader';
import { Collapsible } from '@/components/Collapsible';
import { AppColors } from '@/constants/Colors';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, Redirect, useLocalSearchParams } from "expo-router";
import { Card } from "@rneui/base";


const { height, width } = Dimensions.get("window");

interface Exercise {
    _id: string;
    reps: number;
    hold: number;
    sets: number;
    frequency: number;
    description: string;
    thumbnail_url: string;
    video_url: string;
    title: string;
    category: string;
    subcategory: string;
}

export default function EditExerciseScreen() {
    const { user } = useUser();
    const router = useRouter();

    const local = useLocalSearchParams();
    const exerciseId = local.exerciseId?.toString(); 


    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExercise = async () => {
            try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/get_exercise/${exerciseId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) throw new Error('Failed to fetch exercise');
            const data = await response.json();
            console.log("Fetched exercise data:", data);
            setExercise(data);

            } catch (err) {
            console.error(err);
            setError('Failed to fetch exercise');
            }
        };

    fetchExercise();
    }, []);

    const updateField = (field: keyof Exercise, value: any) => {
        setExercise((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleSave = async () => {
        if (!exercise) return;

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/update_exercise/${exercise._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reps: exercise.reps,
                    hold: exercise.hold,
                    sets: exercise.sets,
                    frequency: exercise.frequency,
                    description: exercise.description,
                    thumbnail_url: exercise.thumbnail_url,
                    video_url: exercise.video_url,
                    title: exercise.title,
                    category: exercise.category,
                    subcategory: exercise.subcategory,

                    }),
                });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to update/create exercise');
            }
            router.back();
        } catch (err) {
            console.error(err);
            setError("Failed to update");
        }
  };

  if (!exercise) return <Text>Loading...</Text>;

  return (
    <LinearGradient style={{ height: height }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
        <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
            <ScrollView 
                horizontal decelerationRate={0} 
                snapToInterval={width * 0.9} 
                snapToAlignment={"center"}>
                <View key={exercise._id} style={{ maxHeight: height * 0.9 }}>
                <Card containerStyle={{ width: width * 0.9, borderRadius: 15 }}>
                    <Card.Title>
                    <TextInput
                        style={styles.input}
                        value={exercise.title}
                        onChangeText={(text) => updateField('title', text)}
                    />
                    </Card.Title>
                    <Card.Divider />
                    <Card.Divider />
                    <Card.Image source={{ uri: exercise.thumbnail_url }} style={{ borderRadius: 15 }} containerStyle={{ borderRadius: 15, shadowOffset: { height: 0.5, width: 0.5 }, shadowRadius: 3, shadowOpacity: 0.7 }} />
                    <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontSize: 20 }}>
                        <Text style={{ fontWeight: "bold" }}>Reps: </Text>
                        <TextInput
                            style={styles.smallInput}
                            value={exercise.reps.toString()}
                            onChangeText={(val) => updateField("reps", Number(val))}
                            keyboardType="numeric"
                        />
                        </Text>
                        <Text style={{ fontSize: 20 }}>
                        <Text style={{ fontWeight: "bold" }}>Hold: </Text>
                        <TextInput
                            style={styles.smallInput}
                            value={exercise.hold.toString()}
                            onChangeText={(val) => updateField("hold", Number(val))}
                            keyboardType="numeric"
                        />
                        <Text> sec </Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 20 }}>
                        <Text style={{ fontWeight: "bold" }}>Sets: </Text>
                        <TextInput
                            style={styles.smallInput}
                            value={exercise.sets.toString()}
                            onChangeText={(val) => updateField("sets", Number(val))}
                            keyboardType="numeric"
                        />
                        </Text>
                        <Text style={{ fontSize: 20 }}>
                        <Text style={{ fontWeight: "bold" }}>Frequency: </Text>
                        <TextInput
                            style={styles.smallInput}
                            value={exercise.frequency.toString()}
                            onChangeText={(val) => updateField("frequency", Number(val))}
                            keyboardType="numeric"
                        />
                        <Text> / week</Text>
                        </Text>
                    </View>
                    </View>
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>Description:</Text>
                    <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={exercise.description}
                    onChangeText={(text) => updateField("description", text)}
                    multiline
                    />
                    <View style={{ alignItems: "center", marginTop: 15 }}>
                    <LinearGradient
                        colors={[AppColors.Purple, AppColors.Blue]}
                        style={styles.button}
                    >
                        <TouchableOpacity onPress={handleSave} style={styles.buttonInner}>
                        <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                    </View>
                </Card>
                </View>
            </ScrollView>
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    buttonInner: {
        padding: 12,
        alignItems: 'center',
        borderRadius: 20,
    },

    buttonText: {
        fontWeight: 'bold',
        color: 'white',
    },

    button: {
        borderRadius: 25,
        width: '50%',
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    container: { 
        flex: 1, 
        padding: 20 
    },

    form: {
        marginTop: 20,
        flex: 1,
        paddingBottom: 150,
    },

    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },

    text: {
        fontSize: 24,
        fontWeight: "bold",
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 25,
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        elevation: 5,
        padding: 10,
    },

    smallInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        width: 80,
        borderRadius: 25,
        marginLeft: 10,
        marginTop: 10,
        elevation: 5,
        padding: 10,
    },

    descriptionInput: {
        fontSize: 18,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        height: 100,
        textAlignVertical: "top",
        marginTop: 10,
        marginBottom: 10,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 5,
    },
});