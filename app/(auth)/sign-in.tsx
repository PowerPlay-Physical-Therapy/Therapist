import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  Button,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { AppColors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import ForgotPassword from "./password-change";

export default function signIN() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({
    email: '',
    password: '',
  });

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      email: /\S+@\S+\.\S+/.test(emailAddress) ? '' : 'Invalid email format',
      password: password.trim() ? '' : 'Password is required',
    };

    if (Object.values(newErrors).some(error => error !== '')) {
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    if (!validateInputs()) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status == "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("Signed in Successfully");
        router.replace("/home");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.log("Signed in Error");
      console.error(JSON.stringify(err, null, 2));
      setErrors({
        email: 'Invalid email or password',
        password: 'Invalid email or password'
      });
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", padding: 40 }}>
      <ThemedView style={{ flex: 1, justifyContent: "center" }}>
        <Image
          source={require("@/assets/images/app-logo.png")}
          style={{
            width: 140,
            height: 140,
            alignSelf: "center",
            marginBottom: 20,
          }}
        />
        <ThemedView style={{ alignSelf: "center" }}>
          <ThemedText style={{ color: "Black", alignSelf: "center", fontSize: 24 }}>
            Welcome!
          </ThemedText>
          <ThemedText style={{ color: "Black", fontSize: 24, marginTop: 10 }}>
            to{" "}
            <ThemedText style={{ color: AppColors.Blue, fontSize: 24}}>Powerplay Provider</ThemedText>
          </ThemedText>
        </ThemedView>
        <LinearGradient
          colors={[AppColors.LightBlue, AppColors.White]}
          style={styles.input}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TextInput
            style={{ color: "black", marginLeft: 10 }}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#666666"
            onChangeText={(email) => {
              setEmailAddress(email);
              setErrors(prev => ({...prev, email: ''}));
            }}
          />
        </LinearGradient>
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
        <LinearGradient
          colors={[AppColors.LightBlue, AppColors.White]}
          style={styles.input}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TextInput
            style={{ color: "black", marginLeft: 10 }}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#666666"
            secureTextEntry={true}
            onChangeText={(pass) => {
              setPassword(pass);
              setErrors(prev => ({...prev, password: ''}));
            }}
          />
        </LinearGradient>

        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
        <ThemedView style={{alignItems: 'center', marginTop: 10}}>
          <LinearGradient
            colors={[AppColors.Purple, AppColors.LightBlue]}
            style={styles.buttonLogin}
          >
            <TouchableOpacity onPress={onSignInPress}>
              <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </ThemedView>

      <View style={styles.forgotPasswordView}>
        <ThemedText>
            <Link href="/password-change">
              <ThemedText style={{ color: AppColors.Blue }}>
                Forgot your Password?
              </ThemedText>
            </Link>
        </ThemedText>
      </View>
      </ThemedView>

      <View style={styles.bottomView}>
        <ThemedText>
          Don't have an account?
          <Link href="/sign-up">
            <ThemedText style={{ color: AppColors.Blue }}>
              {" "}
              Create One!
            </ThemedText>
          </Link>
        </ThemedText>
        <ThemedText style={{ alignSelf: "center" }}>
          Review our
          <Link href="/privacy-policy"> {/* This should be a link to the privacy policy */}
            <ThemedText style={{ color: AppColors.Blue }}>
              {" "}
              Privacy Policy
            </ThemedText>
          </Link>
        </ThemedText>
      </View>
  </ThemedView> )};
  


const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonInner: {
    padding: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: "bold",
  },
  bottomView: {
    backgroundColor: "white",
    alignSelf: "center",
  },
  forgotPasswordView: {
    marginTop: 14,
    alignSelf: "center",
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
  buttonLogin: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    width: "30%",
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 15,
    marginTop: 5,
  },
});
