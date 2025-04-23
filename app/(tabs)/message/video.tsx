import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Button, Touchable } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useLocalSearchParams, Link } from "expo-router";
import { WebView } from 'react-native-webview';
import { TouchableOpacity, Image, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";


const { height: screenHeight, width: screenWidth } = Dimensions.get('window');


export default function Video() {
    const videoLink = useLocalSearchParams().videoLink;

    // video source url is not supported, consider another solution
    return (
        <View style={styles.contentContainer}>
            <WebView
                source={{ uri: videoLink }} style={styles.video}
            />
        </View>
    );
}



const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "black",
    },
    video: {
        position: 'relative',
        backgroundColor: "black",
        width: screenWidth,
        height: screenHeight / 3,
        zIndex: 1,

    }
});