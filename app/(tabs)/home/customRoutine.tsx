import { useState, useRef } from 'react';
// import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { Collapsible } from '@/components/Collapsible';
import { useEffect } from 'react';
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import * as React from 'react';
import { Text, View, FlatList, TextInput, Button, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';
import { useSignIn } from "@clerk/clerk-expo";
import { Image, Platform, SafeAreaView, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import UploadCustomVideo from "./index";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import * as mime from 'mime';
import { Buffer } from 'buffer';
import aws from 'aws-sdk'


// define exercise structure
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


// aws s3 credentials
const AWS_ACCESS_KEY = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID
const AWS_SECRET_KEY = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY
const S3_BUCKET = "custom-exercise-vids"
const S3_REGION = "us-east-2"


// initialize
const s3 = new aws.S3({
    region: S3_REGION,  
    accessKeyId: AWS_ACCESS_KEY,  
    secretAccessKey: AWS_SECRET_KEY,
    signatureVersion: 'v4'  
});

global.Buffer = global.Buffer || Buffer;

const {width: ScreenWidth} = Dimensions.get('window');
const {height: ScreenHeight} = Dimensions.get('window');


export default function CustomRoutineScreen() {
    
    const { isSignedIn } = useAuth();
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [video, setVideo] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
    const [exerciseMedia, setExerciseMedia] = useState<Record<string, {
        videoUrl: string;
        thumbnailUrl: string;
      }>>({});
      
      
    const local = useLocalSearchParams();
    const uri = local.videoUri?.toString();
    const localThumbnail = local.thumbnailUri?.toString();
    const userId = String(user?.id);
    const [text, onChangeText] = useState("");
    
      
    // pick a video from device
    const uploadVideo = async (): Promise<{
    uri: string;
    name: string;
    type: string;
    } | null> => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
            });

            if (result.canceled || !result.assets.length) return null;

            const videoFile = result.assets[0];
                        
            return {
            uri: videoFile.uri,
            name: videoFile.fileName || videoFile.uri.split('/').pop() || 'Unknown Video',
            type: videoFile.mimeType || 'video/quicktime' || 'video/mp4',
            };
        } catch (err) {
            console.error('Error picking video:', err);
            setError('Failed to pick video');
            return null;
        }
    };

   
    // generate s3 pre-signed upload url
    async function generateUploadURL() {
        const imageName = `${Date.now()}.mov`; // Ensure that you're passing a valid file name
   
        const params = {
            Bucket: S3_BUCKET,
            Key: imageName,
            Expires: 60, // expires in 60 secs
        };
   
        console.log("hello")
        try {
            console.log("bye")
            const uploadURL = await s3.getSignedUrlPromise('putObject', params);
            console.log('Generated upload URL:', uploadURL); 
            return { uploadURL, imageName }; // key to upload final url
        } catch (error) {
            console.error('Error generating upload URL:', error);
            throw error;
        }
    }
   

    // upload, generate thumbnail, and update state
    const handleUpload = async (
        exerciseId: string,
        exerciseIndex: number,
        selected: { uri: string; name: string; type: string }
    ) => {
        try {

        let uploadBody: BodyInit;
        if (Platform.OS === 'web') {
            const response = await fetch(selected.uri);
            uploadBody = await response.blob();
        } else {
            const base64String = await FileSystem.readAsStringAsync(selected.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const binaryData = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
            uploadBody = binaryData;
            // const fileUri = selected.uri;
            // const fileBuffer = await FileSystem.readAsStringAsync(fileUri, {
            //   encoding: FileSystem.EncodingType.Base64,
            // });
          
            // uploadBody = Buffer.from(fileBuffer, 'base64');
          
        }
        
        const { uploadURL, imageName } = await generateUploadURL();

        const response = await fetch(uploadURL, {
            method: 'PUT',
            headers: {
            'Content-Type': selected.type,
            },
            body: uploadBody,
        });

    
        if (!response.ok) throw new Error('Failed to upload video');
    
        const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${imageName}`;
    
        // Generate thumbnail
        let thumbnail: { uri: string } | null = null;

        if (Platform.OS !== 'web') {
            try {
                thumbnail = await VideoThumbnails.getThumbnailAsync(selected.uri, {
                    time: 1500,
                });
            } catch (e) {
                console.error('Failed to generate thumbnail:', e);
                thumbnail = null;
            }
        } else {
            try {
                const thumbnailUri = await generateWebThumbnail(selected.uri);
                thumbnail = { uri: thumbnailUri };
            } catch (e) {
                console.error('Failed to generate thumbnail (web):', e);
                thumbnail = null;
            }
        }
    
        // Save video & thumbnail info to UI state
        setExerciseMedia((prev) => ({
            ...prev,
            [exerciseId]: {
                videoUrl: publicUrl,
                thumbnailUrl: thumbnail?.uri || '',
            },
        }));
    
        // attach video & thumbnail url to exercise
        setExercises((prev) => {
            const updated = [...prev];
            updated[exerciseIndex].video_url = publicUrl;
            updated[exerciseIndex].thumbnail_url = thumbnail?.uri || '';
            return updated;
        });
    
        } catch (err) {
        console.error('Upload error:', err);
        setError('Upload failed');
        }
    };

    // combine picking & uploading video
    const onUploadPress = async (exerciseId: string, index: number) => {
        const selected = await uploadVideo();
        if (selected) {
          await handleUpload(exerciseId, index, selected);
        }
    };      
  
    // generate thumbnail for web platform
    const generateWebThumbnail = async (videoUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.src = videoUrl;
          video.muted = true;
          video.currentTime = 1;
      
          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
      
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject('Could not get canvas context');
              return;
            }
      
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
            resolve(thumbnailDataUrl);
          };
      
          video.onerror = (e) => {
            reject('Error loading video for thumbnail generation');
          };
        });
    };
    

    // appends new blank exercise
    const addExercise = () => {
        setExercises((prevExercises) => 
            [
            ...prevExercises,
            {
                _id: `${Date.now()}`,
                title: "",
                category: "",
                description: "",
                frequency: 0,
                hold: 0,
                reps: 0,
                sets: 0,
                subcategory: "",
                thumbnail_url: "",
                video_url: ""
            }
        ]);

    };


    // updates exercise fields
    const updateExercise = (index: number, key: string, value: string | number) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = { ...updatedExercises[index], [key]: value };
        setExercises(updatedExercises);
    };
   

    // deletes an exercise by id
    const removeExercise = (id: string) => {
        setExercises((prevExercises) => prevExercises.filter(ex => ex._id !== id));
    };


    // create new routine
    const createRoutine = async () => {
        try {
            if (!name || !category) {
                setError('Please enter a routine name and select a category.');
                return;
            }

            console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
        
            // create all exercises
            const updatedExercises = [...exercises];

            for (let i = 0; i < updatedExercises.length; i++) {
                const exercise = updatedExercises[i];
      
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/create_exercise`, {
                method: 'POST',
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
                    category: category,
                    subcategory: exercise.subcategory,

                    }),
                });

                console.log("Uploading Exercise:", JSON.stringify({
                    reps: exercise.reps,
                    hold: exercise.hold,
                    sets: exercise.sets,
                    frequency: exercise.frequency,
                    description: exercise.description,
                    thumbnail_url: exercise.thumbnail_url,
                    video_url: exercise.video_url,
                    title: exercise.title,
                    category: category,
                    subcategory: exercise.subcategory,
                }, null, 2));
                
        
                const data = await response.json();
                if (!response.ok) {
                throw new Error(data.detail || 'Failed to create exercise');
                }
        
                console.log("Created exercise with ID:", data._id);
                updatedExercises[i]._id = data._id;
            };
            setExercises(updatedExercises);
      
        
            console.log("Created exercise IDs before creating routine:", updatedExercises.map(ex => ({ _id: ex._id })));
            console.log('Routine API URL:', `${process.env.EXPO_PUBLIC_BACKEND_URL}/create_routine`);

            // Step 2: Create routine with exercise IDs
            const routineResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/create_routine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    // exercises: createdExerciseIds,
                    exercises: updatedExercises.map(ex => ({ _id: ex._id })),
                }),
            });
      
            const routineData = await routineResponse.json();
      
            if (!routineResponse.ok) {
                throw new Error(routineData.detail || 'Failed to create routine');
            }
      
            console.log('Routine created successfully:', routineData);

            if (user?.id && routineData.routine_id) {
                const updateResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/add_custom_routines/${user.id}/${routineData.routine_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                });

                const updateData = await updateResponse.json();
                if (!updateResponse.ok) {
                    console.error('Failed to update therapist with routine:', updateData);
                } else {
                    console.log('Routine linked to therapist successfully:', updateData);
                }
            }

            router.push('/');
      
        } catch (err) {
            console.error('Routine creation error:', err);
            setError('Failed to create routine. Please try again.');
        }
    };
    

    return (
        <LinearGradient style={{ flex: 1}} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <View style={{ flex: 1 }}>
                <ScrollView
                onContentSizeChange={(contentWidth, contentHeight) => console.log(contentWidth, contentHeight)}
                contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                    
                    <TextInput style={styles.input} placeholder="Custom Routine Name" value={name} onChangeText={setName} />
                    <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} /> 
                    
                    {exercises.map((exercise, index) => (

                        <View key={exercise._id} style={styles.exerciseBlock}>
                            <View style={styles.exerciseContainer}>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.label}>Exercise Name:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={exercise.title}
                                        onChangeText={(text) => updateExercise(index, "title", text)}
                                    />
                                </View>

                                {/* Display video preview only if a video is selected */}
                                {exercise.video_url && (
                                    <View style={styles.previewContainer}>
                                        <Text>Video Selected:</Text>
                                        {video && <Text style={styles.fileName}>Selected: {video.name}</Text>}
                                        <Video
                                            source={{ uri: exercise.video_url }}
                                            useNativeControls
                                            resizeMode={ResizeMode.CONTAIN}
                                            style={styles.videoPreview}
                                        />
                                        <View style={styles.separator} />
                                    </View>
                                )}
                                
                                <View style={styles.inputContainer}>

                                    <View style={styles.rowContainer}>
                                        <View style={styles.column}>
                                            <Text style={styles.label}>Reps:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(exercise.reps)}
                                                keyboardType='numeric'
                                                onChangeText={(text) => updateExercise(index, "reps", Number(text))}
                                            />
                                            <Text style={styles.label}>Sets:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(exercise.sets)}
                                                keyboardType='numeric'
                                                onChangeText={(text) => updateExercise(index, "sets", Number(text))}
                                            />
                                        </View>

                                        <View style={styles.column}>
                                            <Text style={styles.label}>Hold:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(exercise.hold)}
                                                keyboardType='numeric'
                                                onChangeText={(text) => updateExercise(index, "hold", Number(text))}
                                            />
                                            <Text>Seconds</Text>
                                            <Text style={styles.label}>Frequency:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={String(exercise.frequency)}
                                                keyboardType='numeric'
                                                onChangeText={(text) => updateExercise(index, "frequency", Number(text))}
                                            />
                                            <Text>x/week</Text>
                                        </View>
                                    </View>

                                </View>
                                
                                <Text style={styles.label}>Description:</Text>
                                <TextInput
                                    style={styles.descriptionInput}
                                    value={exercise.description}
                                    onChangeText={(text) => updateExercise(index, "description", text)}
                                    multiline
                                />
                                
                                <LinearGradient
                                    colors={[AppColors.Purple, AppColors.Blue]}
                                    style={styles.button}
                                >
                                    <TouchableOpacity
                                        style={styles.buttonInner}
                                        onPress={() => onUploadPress(exercise._id, index)} 
                                    >
                                    <ThemedText style={styles.buttonText}>Upload Video</ThemedText>
                                    </TouchableOpacity>
                                        
                                </LinearGradient>
                            </View>
                        </View>

                        
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                            <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                    
                </ScrollView>
                
                <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>

                    <LinearGradient
                        colors={[AppColors.Purple, AppColors.Blue]}
                        style={styles.createButton}
                    >
                        <TouchableOpacity
                            style={styles.buttonInner}
                            onPress={() => createRoutine()} 
                        >
                        <ThemedText style={styles.buttonText}>Create Routine</ThemedText>
                        </TouchableOpacity>
                    </LinearGradient>

                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>
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

    createButton: {
        position: 'absolute',  // Fixed at the bottom of the page
        bottom: 20,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        marginBottom: 20,
        width: '50%',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
        alignSelf: 'center',
    },

    container: { 
        flex: 1, 
        padding: 20 
    },

    form: {
        marginTop: 20,
        paddingBottom: 150,
    },

    fileName: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },

    title: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },

    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },

    text: {
        fontSize: 24,
        fontWeight: "bold",
    },


    routine: {
        marginVertical: 10,
        padding: 15,
        borderRadius: 10,
    },


    routineTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },


    routineList: {
        flexDirection: "row",
        alignItems: "center",
    },


    exerciseInfo: {
        flex: 1,
    },
    exerciseBlock: {
        
        marginBottom: 30,
        
    },

    exerciseContainer: {
        
        backgroundColor: AppColors.OffWhite,
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 15,
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    exerciseList: {
        marginTop: 10,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },


    exerciseThumbnail: {
        width: 82,
        height: 76,
        borderRadius: 5,
        marginRight: 10,
    },


    exerciseName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },


    exerciseDetails: {
        fontSize: 14,
        fontWeight: "bold",
        color: "black",
        marginLeft: 4,
    },


    exerciseItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    column: {
        flex: 1,
        marginRight: 10,
    },

    previewContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    videoPreview: {
        width: 300,
        height: 200,
    },

    separator: {
        height: 1,
        backgroundColor: "#9BB4D6",
        marginVertical: 5,
        width: "100%",
    },


    bottomView: {
        backgroundColor: "white",
        alignSelf: "center",
    },

    addButton: {
        marginTop: 10,
        width: 60,
        height: 60,
        marginVertical: 20,
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
        alignSelf: 'center',
    },

    addButtonText: {
        color: "black",
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

