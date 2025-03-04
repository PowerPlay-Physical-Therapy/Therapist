import { StyleSheet, Image, Platform, TouchableOpacity, Pressable, View } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import  ScreenHeader  from '@/components/ScreenHeader';
import { Alert } from 'react-native';
import {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';


export default function TabTwoScreen() {
  const {isSignedIn, user, isLoaded} = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(user?.imageUrl);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in'); // Redirect to sign-in page after logout
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
      await user?.setProfileImage({file: result.assets[0].uri})
    }
  };

  return (
    <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0}} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
      <ScreenHeader title="Your Profile & Settings"/>
      {/* Add Logout Button */}
      <ThemedView style={styles.buttonContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginBottom: 20}}>
        <ThemedView style={styles.headerImage}>
          
          <Image
            source={{uri: image}} 
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
        <View style={{alignSelf: 'center'}}>
          <ThemedText style={styles.text}>{user?.username}</ThemedText>
          <ThemedText style={styles.text}>{user?.fullName}</ThemedText>
        </View>
        <View>
          <Pressable onPress={() => setIsEditing(!isEditing)} style={{width: '100%'}}>
           {isEditing? (
            <LinearGradient colors={["#E91313", "#EB9BD0"]}
            style={styles.saveButton}>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <ThemedText style={styles.buttonText}>Save Changes?</ThemedText>
          </TouchableOpacity>
          </LinearGradient>) : (
          <IconSymbol style={styles.cog} name="gear" size={24} color={'black'}/>)}
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
        </ThemedView>
      
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
    padding: 20,
    backgroundColor: AppColors.LightBlue,
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
    padding: 8
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
