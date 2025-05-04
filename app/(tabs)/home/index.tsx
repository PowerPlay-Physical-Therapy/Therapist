
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  SafeAreaView,
  ScrollView,
  Modal
} from "react-native";
import { useState } from "react";
// import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import ScreenHeader from "@/components/ScreenHeader";
import { Collapsible } from "@/components/Collapsible";
import { useEffect } from "react";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Text, View, FlatList } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol.ios";
import capitalizeWords from "@/utils/capitalizeWords";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SearchBar } from '@rneui/themed';

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [therapistName, setTherapistName] = useState<string | null>(null);
  const [routines, setRoutines] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const [therapistId, setTherapistId] = useState<string | null>(user?.id || null);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewFavorites, setViewFavorites] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredRoutines, setFilteredRoutines] = useState<any[] | null>(null);

  const toggleFavorite = async (routineId: string) => {
    if (!user?.id) return;
    try {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/toggle_favorite/${user.id}/${routineId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });
        console.log("Toggled favorite for:", routineId);
        onRefresh(); // Refresh the list after toggling favorite
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
    }
};

  const fetchCustomRoutines = async () => {
    if (!user || !isLoaded) {
      return;
    }
    // Display user id
    const therapistId = user?.id;
    console.log("userid:", user?.id);
    setTherapistId(therapistId);
    setTherapistName(user?.firstName || "Therapist");

    // Error message if no therapistID is available
    if (!therapistId) {
      setError("Therapist ID is not defined");
      return;
    }


    try {

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/get_custom_routines/${therapistId}`);

      // Throw an error if the response is not successful
      if (!response.ok) {
        throw new Error("Failed to fetch custom routines");
      }

      // Parse the response as JSON
      const data = await response.json();
      console.log("Fetched data:", data);
      setRoutines(data);

      const response3 = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/get_favorite_routines/${therapistId}`);
      if (!response3.ok) {
        throw new Error("Failed to fetch favorite routines");
      }

      const data3 = await response3.json();
      console.log("Fetched favorite routines:", data3);
      setFavorites(data3)

      const response2 = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/update_therapist/${user?.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: therapistId,
          username: user?.username,
          firstname: user?.firstName,
          lastname: user?.lastName,
          email: user?.emailAddresses[0].emailAddress,
          imageUrl: user?.imageUrl
        }),
      }) 

      if (!response2.ok) {
        throw new Error('Failed to update user');
      }
      console.log('User updated successfully!');
    } catch (err) {
      console.error("Error fetching routines:", err);
      setError("Failed to fetch routines");
    }
  };

  useEffect(() => {
    fetchCustomRoutines();
  }, []);

  useEffect(() => {
    if (!routines) return;
  
    const query = search.toLowerCase();

    if (query.trim() === '') {
      setFilteredRoutines(null); // fall back to full list
      return;
    }

    const filtered = (viewFavorites ? favorites : routines).filter(routine => {
      const routineNameMatch = routine.name?.toLowerCase().includes(query);
      const categoryMatch = routine.category?.toLowerCase().includes(query);
      const exerciseMatch = routine.exercises?.some((exercise: any) =>
        exercise.title?.toLowerCase().includes(query)
      );
      return routineNameMatch || categoryMatch || exerciseMatch;
    });
  
    setFilteredRoutines(filtered);
  }, [search, routines, favorites, viewFavorites]);
  
  const routinesToDisplay = filteredRoutines ?? (viewFavorites ? favorites : routines);


  const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchCustomRoutines();
        setIsRefreshing(false);
    }
  

  // Display the error message
  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={styles.errorText}>{error}</Text>
      </View>

    );
  }
  return (
    <LinearGradient
      style={{ flex: 1, paddingTop: Platform.OS == "ios" ? 50 : 0 }}
      colors={[AppColors.OffWhite, AppColors.LightBlue]}
    >
      <ScreenHeader
                title={viewFavorites ? "Favorites" : "Home Library"}
                leftButton={null}
                showLeft={true}
                showRight={true}

                rightButton={
                  <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', marginRight: 40 }}>
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
                  

                    <Link href={`/home/customRoutine`} asChild>
                      <TouchableOpacity onPress={() => {
                        console.log("Navigating to Custom Routine screen");
                      }}
                      >
                        <Image
                          source={require('@/assets/images/add.png') }
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </Link>
                  </View>
                }

            />
              <SearchBar round={true} containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }} inputContainerStyle={{ backgroundColor: AppColors.LightBlue }} placeholder='Search Routines/Categories' onChangeText={setSearch} value={search} />

      {!routines && (
                <ScrollView style={{ flex: 1}}>  
                    <ThemedText style={{ alignSelf: 'center', color : 'black', paddingTop: 80}}>Loading Routines...</ThemedText>
                </ScrollView>
            )}

      {routines && routines.length === 0 && (
                <ScrollView style={{ flex: 1}}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ThemedText style={{ alignSelf: 'center', color : 'black', paddingTop: 80}}>No Routines Added</ThemedText>
                </View>
                </ScrollView>)}

      {routines && routines.length > 0 && (
            
      <FlatList
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        // data={viewFavorites? favorites : routines}
        data={routinesToDisplay}
        keyExtractor={(item) => item._id}
        style={{ padding: 8, marginBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: routine }) => (
          <View style={styles.routine}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
            <Text style={styles.routineTitle}>{routine.name? capitalizeWords(routine.name) : "No Routine Name Provided"}
            </Text>
            <TouchableOpacity onPress={() => toggleFavorite(routine._id)}> 
                                            <Image source={(viewFavorites || favorites.some((favorite) => favorite._id === routine._id))? require('@/assets/images/heart-icon.png') : require('@/assets/images/heart-outline.png')} style={{ width: 24, height: 24 }} />
                     </TouchableOpacity>
</View>
            {/* Exercises within routine */}
            <View style={styles.exerciseList}>
              <FlatList
                data={routine.exercises}
                keyExtractor={(exercise, index) => index.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item: exercise }) => (
                  <View style={styles.exerciseItem}>
                    
                      <Image
                        source={exercise.thumbnail_url? {uri : exercise.thumbnail_url} : require(`@/assets/images/default-thumbnail.png`)}
                        style={styles.exerciseThumbnail}
                      />
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
                    
                  </View>
                )}
              />
              <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
              <LinearGradient
                colors={[AppColors.Purple, AppColors.Blue]}
                style={styles.button}
              >
                <Link href={`/home/assignRoutine?routineId=${routine._id}&therapistId=${therapistId}`} asChild>
                <TouchableOpacity
                  style={styles.buttonInner}
                >
                  <ThemedText style={styles.buttonText}>
                    Assign
                  </ThemedText>
                  
                </TouchableOpacity>
                </Link>
              </LinearGradient>

              <Link href={`/home/editRoutine?routineId=${routine._id}`} asChild>
              <TouchableOpacity onPress={() => {
                console.log("Navigating to Edit Routine screen");}}>
                <Image source={require(`@/assets/images/settings.png`)}
                style={{height: 30, width: 30}}/>
                </TouchableOpacity>
              </Link>
              </View>
            </View>
          </View>
        )}
      />
      )}
      <Modal 
      transparent={true}
      visible={isRefreshing}
      >
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>

            <View style={styles.modalView}>
              <ThemedText style={{fontSize: 16}}>Updating...</ThemedText>
              <LoadingSpinner color={AppColors.Blue} durationMs={1000}/>
            </View>
          </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: AppColors.OffWhite,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonInner: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
  title: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  button: {
    borderRadius: 25,
    width: "40%",
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    paddingVertical: 5,
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
    bottom: Platform.OS === "ios" ? 100 : 90, // Adjust for iOS and Android
    left: "50%",
    transform: [{ translateX: -30 }],
    width: 60,
    height: 60,
    marginTop: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1000,
  },

  addButtonText: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 15,
    marginTop: 5,
  },

  search: {
    // Add your search bar styles here
  }
});
