import { useState } from 'react';
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
import { Text, View, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol.ios';

import { useSignIn } from "@clerk/clerk-expo";
import { Image, Platform, SafeAreaView, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import UploadCustomVideo from "./index";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import aws from 'aws-sdk'


interface Exercise {
    _id: string;
    category: string;
    description: string;
    frequency: number;
    hold: number;
    reps: number;
    sets: number;
    subcategory: string;
    thumbnail_url: string;
    title: string;
    video_url: string;
}


const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY_ID
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
const S3_REGION = process.env.AWS_REGION

const s3 = new aws.S3({
    region: S3_REGION,  
    accessKeyId: AWS_ACCESS_KEY,  
    secretAccessKey: AWS_SECRET_KEY, 
    signatureVersion: 'v4'  
});



async function generateUploadURL() {
    const imageName = `${Date.now()}.mov`;
  
    const params = ({
      Bucket: S3_BUCKET_NAME,
      Key: imageName,
      Expires: 60
    })
    
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return {uploadURL}
}



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

    const [isTabVisible, setIsTabVisible] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const local = useLocalSearchParams();
    const uri = local.videoUri?.toString();
    const localThumbnail = local.thumbnailUri?.toString();
    const userId = String(user?.id);
    const [text, onChangeText] = useState("");


    // handle video upload
    async function UploadCustomVideo(file: File, exerciseId: string) {
        try {
            // fetch pre-signed URL from backend
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/upload_custom_video`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    exercise_id: exerciseId,
                    filename: file.name,
                    content_type: file.type || "video/mp4" 
                }),
            });

            if (!response.ok) {
                throw new Error("Pre-signed URl fetch failed");
            }

            // extract URL from response
            const { presigned_url, video_url } = await response.json();

            console.log("Presigned URL:", presigned_url);

            // upload video to S3 bucket
            const uploadResponse = await fetch(presigned_url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!uploadResponse.ok) {
                throw new Error("Upload video to S3 failed");
            }

            // save uploaded video URL
            setVideoUrl(video_url);
            console.log("Video upload successful");
            return video_url;

        } catch (err) {
            setError("Uploading unsuccessful");
            console.error("Error uploading video:", err);
            return null;
        }
    }


    // allows picking video from device
    const uploadVideo = async (index: number) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 1,
            });
    
            if (result.canceled || !result.assets.length) return;
            const videoFile = result.assets[0]; // extract the video file from the result
            const videoName = videoFile.uri.split('/').pop(); // extract name from the URI 

            if (!videoFile) return;
    
            // fetch the pre-signed URL from the backend
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/upload_custom_video/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exercise_id: exercises[index]._id,
                    filename: videoFile.fileName, 
                    content_type: videoFile.type || 'video/mp4', 
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to get pre-signed URL');
            }
    
            const { presigned_url, video_url } = await response.json();
            console.log("Pre-signed URL:", presigned_url);
            console.log("Video URL:", video_url);

            // upload the video to S3 using the pre-signed URL
            const fileBlob = await fetch(videoFile.uri).then(res => res.blob());
    
            const uploadResponse = await fetch(presigned_url, {
                method: 'PUT',
                headers: { 'Content-Type': videoFile.type || 'video/mp4' }, 
                body: fileBlob,
            });
    
            if (!uploadResponse.ok) {
                throw new Error('Video upload failed');
            }
    
            // update the exercise with the video URL
            const updatedExercises = [...exercises];
            updatedExercises[index].video_url = video_url;
            setExercises(updatedExercises);
    
            // set the URI for preview
            setSelectedVideoUri(videoFile.uri);
    
            console.log('Video uploaded successfully');
        } catch (err) {
            console.error('Error uploading video:', err);
            setError('Uploading unsuccessful');
        }
    };
    
    

    async function generateUploadURL() {
        const imageName = `${Date.now()}.mov`;
      
        const params = ({
          Bucket: S3_BUCKET_NAME,
          Key: imageName,
          Expires: 60
        })
        
        const uploadURL = await s3.getSignedUrlPromise('putObject', params)
        return {uploadURL}
    }



    // video upload to S3
    // const uploadToS3 = async (file: File) => {
    //     try {
    //         const presignedUrl = await generateUploadURL();
        
    //         const uploadResponse = await fetch(presignedUrl, {
    //             method: "PUT",
    //             headers: { "Content-Type": file.type },
    //             body: file
    //         });
        
    //         if (!uploadResponse.ok) throw new Error("Upload failed");
        
    //         console.log("Upload successful!");
    //         return presignedUrl.split("?")[0];
    //     } catch (err) {
    //         console.log("Error uploading to S3:", err);
    //         return null;
    //     }
    // };    



    const generateThumbnail = async (videoUri: string) => {
        try {
          const url = await VideoThumbnails.getThumbnailAsync(
            videoUri,
            {
              time: 15000,
            }
          );
          console.log("Thumbnail URL:", url);
          setThumbnail(url.uri);
        } catch (e) {
          console.warn(e);
        }
    };

    useEffect(() => {
        if (videoUrl) {
            generateThumbnail(videoUrl);
        }
    }, [videoUrl])



    const addExercise = () => {
        setExercises((prevExercises) => [
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

    const updateExercise = (index: number, key: string, value: string | number) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = { ...updatedExercises[index], [key]: value };
        setExercises(updatedExercises);
    };
    

    const removeExercise = (id: string) => {
        setExercises((prevExercises) => prevExercises.filter(ex => ex._id !== id));
    };
    





    // create new routine
    const createRoutine = async () => {
        if(!name || !category || exercises.length === 0) return;

        try {

            // send request to create routine
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/create_routine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, exercises }),
            });

            if (!response.ok) {
                throw new Error("Create routine failed");
            }
                
            console.log("Routine created successfully");
            router.replace('/'); // navigate to home page

        } catch (err) {
            console.error("Error creating routine:", err);
        }
    };

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>

            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Custom Routine Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} /> 
                
                {exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Exercise Name"
                            value={exercise.title}
                            onChangeText={(text) => {
                                // const updatedExercises = [...exercises];
                                // updatedExercises[index].title = text;
                                // setExercises(updatedExercises);
                                updateExercise(index, "title", text)
                            }}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={exercise.description}
                            onChangeText={(text) => updateExercise(index, "description", text)}
                        />
                        <Button
                        title="Upload Video"
                        onPress={() => uploadVideo(index)}
                        />
                        {exercise.video_url && <Text style={styles.fileName}>Selected: {exercise.video_url}</Text>}

                        {/* Display video preview only if a video is selected */}
                        {selectedVideoUri && (
                            <View style={styles.previewContainer}>
                                <Text>Video Selected:</Text>
                                <Video
                                    source={{ uri: selectedVideoUri }}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    style={styles.videoPreview}
                                />
                            </View>
                        )}
                    </View>
                ))}
                {/* {/* <Button title="Upload Video" onPress={uploadVideo} /> */}
                {video && <Text style={styles.fileName}>Selected: {video.name}</Text>} 
                <Button title="+" onPress={addExercise} />
                <Button title="Create Routine" onPress={createRoutine} />
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20 
    },

    form: {
        marginTop: 20
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

    exerciseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
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
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

    addButtonText: {
        color: "black",
        fontSize: 24,
        fontWeight: "bold",
    },

    input: {
        borderRadius: 25,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 15,
    },

    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 5,
    },
});
