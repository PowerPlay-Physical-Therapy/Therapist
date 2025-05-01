import {
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "@/components/ScreenHeader";
import { useEffect, useState } from "react";
import { Link, router, Stack } from "expo-router";
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";
import { setStatusBarTranslucent } from "expo-status-bar";
import { SearchBar, Skeleton } from "@rneui/themed";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import capitalizeWords from "@/utils/capitalizeWords";

const { height, width } = Dimensions.get("window");

export default function ExploreScreen() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [exploreAll, setExploreAll] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/get_explore_collection`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Fetched data:", data);
        setExploreAll(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = exploreAll.filter((category: any) => {
      return (
        category.title.toLowerCase().includes(search.toLowerCase()) ||
        category.subcategory.some(
          (subcategory: any) =>
            subcategory.subtitle.toLowerCase().includes(search.toLowerCase()) ||
            subcategory.exercises.some((exercise: any) =>
              exercise.name.toLowerCase().includes(search.toLowerCase())
            )
        )
      );
    });
    setFilteredResults(filtered);
  }, [search, exploreAll]);

  return (
    <LinearGradient
      style={{ flex: 1, paddingTop: Platform.OS == "ios" ? 50 : 0 }}
      colors={[AppColors.OffWhite, AppColors.LightBlue]}
    >
      <ScreenHeader title="Explore" logo={true} />
      <SearchBar
        round={true}
        containerStyle={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          borderBottomWidth: 0,
        }}
        inputContainerStyle={{ backgroundColor: AppColors.LightBlue }}
        placeholder="Search Routines/Categories"
        onChangeText={setSearch}
        value={search}
        style={styles.search}
      />
      <ScrollView style={{ marginBottom: 60 }}>
        {exploreAll.length > 0 ? (
          filteredResults.length == 0 ? (
            <ThemedText style={{ flex: 1, alignSelf: "center", padding: 40 }}>
              No results found
            </ThemedText>
          ) : (
            filteredResults.map((category, index) => (
              <View key={index} style={{ padding: 16 }}>
                <ThemedText
                  style={{ fontSize: 18, paddingLeft: 10, fontWeight: "bold" }}
                >
                  {capitalizeWords(category.title)}
                </ThemedText>
                {category["subcategory"].map(
                  (subcategory: any, index2: any) => (
                    <View
                      style={{
                        margin: 5,
                        padding: 5,
                        backgroundColor: AppColors.OffWhite,
                        borderRadius: 15,
                      }}
                      key={index2}
                    >
                      <ThemedText
                        style={{ paddingLeft: 5, fontWeight: "bold" }}
                      >
                        {subcategory.subtitle}
                      </ThemedText>
                      <ScrollView horizontal={true}>
                        {subcategory["exercises"].map(
                          (exercise: any, index3: any) => (
                            <Link
                              href={`/explore/routineDetails?exerciseId=${JSON.stringify(
                                exercise._id
                              )}`}
                              asChild
                              key={index3}
                            >
                              <TouchableOpacity key={index3}>
                                <View
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    margin: 5,
                                    borderRadius: 15,
                                    zIndex: 0,
                                    shadowOffset: { height: 0.2, width: 0.2 },
                                    shadowRadius: 3,
                                    shadowOpacity: 0.5,
                                  }}
                                >
                                  <Image
                                    source={{ uri: exercise.thumbnail_url }}
                                    style={{
                                      width: width * 0.5,
                                      height: height * 0.2,
                                      borderRadius: 15,
                                      zIndex: 2,
                                    }}
                                  />
                                  <View
                                    style={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      zIndex: 5,
                                    }}
                                  >
              
                                  </View>
                                  <ThemedText
                                    style={{
                                      fontWeight: "bold",
                                      position: "absolute",
                                      zIndex: 3,
                                      backgroundColor: "rgba(0,0,0,0.3)",
                                      borderRadius: 5,
                                      padding: 2.5,
                                      margin: 4,
                                    }}
                                  >
                                    {capitalizeWords(exercise.name)}
                                  </ThemedText>
                                </View>
                              </TouchableOpacity>
                            </Link>
                          )
                        )}
                      </ScrollView>
                    </View>
                  )
                )}
              </View>
            ))
          )
        ) : (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <ScrollView style={{ padding: 16 }}>
              <Skeleton
                width={width * 0.9}
                height={height * 0.2}
                animation="wave"
                style={{ margin: 5, borderRadius: 15 }}
              />
              <Skeleton
                width={width * 0.9}
                height={height * 0.2}
                animation="wave"
                style={{ margin: 5, borderRadius: 15 }}
              />
              <Skeleton
                width={width * 0.9}
                height={height * 0.2}
                animation="wave"
                style={{ margin: 5, borderRadius: 15 }}
              />
              <Skeleton
                width={width * 0.9}
                height={height * 0.2}
                animation="wave"
                style={{ margin: 5, borderRadius: 15 }}
              />
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  search: {},
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subcategoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 5,
  },
  exerciseName: {
    padding: 2.5,
    paddingBottom: 4,
    fontSize: 14,
    lineHeight: 12,
    fontWeight: "bold",
    borderRadius: 15,
  },
  blurContainer: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 15,
    padding: 2.5,
    paddingBottom: 4,
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
});
