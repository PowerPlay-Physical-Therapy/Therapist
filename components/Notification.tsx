import React, { useState } from "react";
import { View, Text, Animated, TouchableOpacity, StyleSheet } from "react-native";

const Notification = ({ message, type = "info", onClose } : {message: any, type: string, onClose: any}) => {
    const [fadeAnim] = useState(new Animated.Value(1));

    // Fade out animation
    const closeNotification = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(onClose);
    };

    return (
        <Animated.View style={[styles.container, styles[type], { opacity: fadeAnim }]}>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={closeNotification}>
                <Text style={styles.close}>✖</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 5,
        zIndex: 5,
    },
    info: { backgroundColor: "#3498db" },
    success: { backgroundColor: "#2ecc71" },
    error: { backgroundColor: "#e74c3c" },
    message: { color: "#fff", fontSize: 16 },
    close: { color: "#fff", fontSize: 18, marginLeft: 10 },
});

export default Notification;