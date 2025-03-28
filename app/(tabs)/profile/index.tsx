import { StyleSheet, Image, Platform, TouchableOpacity, Pressable, View, TextInput } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { ScrollView, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ScreenHeader from '@/components/ScreenHeader';
import { Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';


export default function ProfileScreen() {
    const { isSignedIn, user, isLoaded } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(user?.imageUrl);
    const [username, setUsername] = useState("");
    const [notifications, setNotifications] = useState(false);

    const toggleNotifications = () => {
        setNotifications(!notifications);
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/sign-in'); // Redirect to sign-in page after logout
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await user?.setProfileImage({ file: result.assets[0].uri })
        }
    };

    const changeIcon = async () => {
        setIsEditing(!isEditing);
    }

    const handleSave = React.useCallback(async () => {
        setIsEditing(!isEditing);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/patient/update_patient/${user?.username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user?.id,
                    username: username,
                    firstname: user?.firstName,
                    lastname: user?.lastName,
                    email: user?.emailAddresses[0].emailAddress,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // Handle validation errors
                    data.errors.forEach((error: any) => {
                        console.error(`Validation error: ${error.message}`);
                    });
                } else {
                    console.error('Error updating profile:', data);
                }
                throw new Error('Failed to update profile');
            }

            console.log('Profile updated successfully:', data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }

        await user?.update({ username: username });
    }, [username, isEditing, user]);

    return (
        <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0 }} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
            <ScreenHeader title="Your Profile & Settings" />
            <ScrollView style={{ flex: 1, marginBottom: 80 }}>
                <LinearGradient start={{ x: 0, y: 0.25 }} end={{ x: 0.5, y: 1 }} style={styles.buttonContainer} colors={[AppColors.LightBlue, AppColors.OffWhite]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginBottom: 20 }}>
                        <ThemedView style={styles.headerImage}>

                            <Image
                                source={{ uri: image }}
                                resizeMode="contain"
                                style={styles.profileImage}
                            />
                        </ThemedView>
                        <Pressable onPress={pickImage}>
                            <Image
                                source={require('@/assets/images/Magicpen.png')}
                                style={styles.pen}
                                resizeMode="contain"
                            />
                        </Pressable>
                        <View style={{ alignSelf: 'center', paddingTop: 30 }}>
                            {isEditing ? (
                                <TextInput
                                    style={{ color: "black", borderBottomColor: "black", borderBottomWidth: 1, width: 120, fontSize: 20 }}
                                    value={username}
                                    placeholder="Enter username"
                                    placeholderTextColor="#666666"
                                    onChangeText={(text) => {
                                        setUsername(text);
                                    }}
                                />
                            ) : (

                                <ThemedText style={styles.text}>{user?.username}</ThemedText>
                            )

                            }
                            <ThemedText style={{ marginTop: 10, fontSize: 20 }}>{user?.fullName}</ThemedText>
                        </View>
                        <View>
                            <Pressable onPress={changeIcon} style={{ width: '100%' }}>
                                {isEditing ? (
                                    <LinearGradient colors={["#E91313", "#EB9BD0"]}
                                        style={styles.saveButton}>
                                        <TouchableOpacity onPress={handleSave}>
                                            <ThemedText style={styles.buttonText}>Save Changes?</ThemedText>
                                        </TouchableOpacity>
                                    </LinearGradient>) : (
                                    <IconSymbol style={styles.cog} name="gear" size={24} color={'black'} />

                                )}
                            </Pressable>
                        </View>
                    </View>
                    <ThemedText style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</ThemedText>
                    <ThemedText style={styles.text}>Password: Replace this with user password</ThemedText>
                    <LinearGradient
                        colors={[AppColors.Purple, AppColors.Blue]}
                        style={styles.button}
                    >
                        <TouchableOpacity
                            style={styles.buttonInner}
                            onPress={handleSignOut}
                        >
                            <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
                        </TouchableOpacity>
                    </LinearGradient>
                </LinearGradient>
                <ThemedView style={styles.container}>
                    <ThemedText style={{ fontSize: 16 }}>Subscription Plan: Active</ThemedText>
                </ThemedView>
                <ThemedView style={styles.container}>
                    <ThemedText style={{ fontSize: 16 }}>Manage Patients</ThemedText>
                    <Image source={require('@/assets/images/chevron-right.png')}></Image>
                </ThemedView>
                <ThemedView style={{ ...styles.container, flexDirection: 'column' }}>
                    <ThemedView style={{ flexDirection: 'row', backgroundColor: AppColors.OffWhite, alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 12 }}>
                        <ThemedText style={{ fontSize: 16 }}>Push Notifications</ThemedText>
                        <Switch onValueChange={toggleNotifications} value={notifications} thumbColor={AppColors.OffWhite} trackColor={{ false: 'grey', true: AppColors.Blue }} />
                    </ThemedView>

                    <ThemedText style={{ fontSize: 12, color: 'grey', lineHeight: 14, paddingTop: 12, borderTopColor: "lightgrey", borderTopWidth: 1 }}>You'll recieve friendly notifications to stay on track with your fitness goals!</ThemedText>

                </ThemedView>
                <ThemedView style={styles.container}>
                    <ThemedText style={{ fontSize: 16 }}>Privacy Policy</ThemedText>
                    <Link href="/privacy-policy" >
                        <Image source={require('@/assets/images/chevron-right.png')}></Image>
                    </Link>
                </ThemedView>
            </ScrollView>

        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    headerImage: {
        borderRadius: 60,
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    buttonContainer: {
        alignItems: 'center',
        margin: 20,
        marginBottom: 10,
        padding: 20,
        backgroundColor: AppColors.LightBlue,
        borderRadius: 20,
        flex: 1,
    },
    container: {
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: "space-between",
        margin: 20,
        marginTop: 10,
        marginBottom: 10,
        padding: 20,
        backgroundColor: AppColors.OffWhite,
        borderRadius: 20,
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
    saveButton: {
        borderRadius: 25,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 6,
        position: 'relative',
        right: 50,


    },
    buttonInner: {
        padding: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    pen: {
        position: 'relative',
        right: 50,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    text: {
        fontSize: 20,
    },
    cog: {
        position: 'relative',
        right: -20,
    }
});
