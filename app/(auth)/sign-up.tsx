import * as React from 'react';
import { Text, TextInput, View, Image, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';

export default function signUP() {
    const { isLoaded, signUp } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [policyAccepted, setPolicyAccepted] = React.useState(false);
    
    const [errors, setErrors] = React.useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        policy: '',
    });

    // Real-time confirm password validation
    React.useEffect(() => {
        if (confirmPassword && confirmPassword !== password) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    }, [confirmPassword, password]);

    // Input Validation Function
    const validateInputs = () => {
        let valid = true;
        const newErrors = { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', policy: '' };

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            valid = false;
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }
        if (!username.trim()) {
            newErrors.username = 'Username is required';
            valid = false;
        }
        if (!emailAddress.trim() || !/\S+@\S+\.\S+/.test(emailAddress)) {
            newErrors.email = 'Invalid email format';
            valid = false;
        }
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            valid = false;
        }
        if (!policyAccepted) {
            newErrors.policy = 'You must accept the privacy policy';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // ✅ Sign-Up Button Handler
    const onSignUpPress = async () => {
        if (!isLoaded) return;

        if (!validateInputs()) {
            return; // Stop if validation fails
        }

        try {
            const response = await signUp.create({
                username,
                firstName,
                lastName,
                emailAddress,
                password,
            });

            if(response.status == 'complete') {
                const backend_response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/create_therapist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: response.createdUserId,
                        username: response.username,
                        firstname: response.firstName,
                        lastname: response.lastName,
                        email: response.emailAddress,
                    }),
                })
                const data = await backend_response.json();
                console.log("Successfully created new Patient with ID : ", JSON.stringify(data));
                console.log("Signed up successfully")
                router.push('/home') }
        } catch (err) {
            console.error("Sign-up error:", JSON.stringify(err, null, 2));
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 40 }}>
                    <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
                        <Image
                            source={require('@/assets/images/app-logo.png')}
                            style={{ width: 140, height: 140, alignSelf: 'center', marginBottom: 20 }}
                        />
                        <ThemedText style={styles.powerplayTitle}>PowerPlay Provider</ThemedText>
                        <ThemedText style={{ alignSelf: 'center', fontSize: 24, marginTop: 10 }}>Create an Account!</ThemedText>

                        {/* Input Fields */}
                        <InputField value={firstName} placeholder="First Name" onChangeText={setFirstName} error={errors.firstName} />
                        <InputField value={lastName} placeholder="Last Name" onChangeText={setLastName} error={errors.lastName} />
                        <InputField value={username} placeholder="Username" onChangeText={setUsername} error={errors.username} />
                        <InputField value={emailAddress} placeholder="Email" onChangeText={setEmailAddress} error={errors.email} />
                        <InputField value={password} placeholder="Password" onChangeText={setPassword} secureTextEntry error={errors.password} />
                        <InputField value={confirmPassword} placeholder="Confirm Password" onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword} />

                        {/* Privacy Policy Checkbox */}
                        <View style={styles.policyContainer}>
                            <Checkbox
                                value={policyAccepted}
                                onValueChange={setPolicyAccepted}
                                color={policyAccepted ? AppColors.LightBlue : undefined}
                                style={styles.checkbox}
                            />
                            <ThemedText style={styles.policyText}>
                                I agree to the {' '}
                                <Link href="/privacy-policy" asChild>
                                    <TouchableOpacity>
                                        <ThemedText style={styles.policyLink}>Privacy Policy</ThemedText>
                                    </TouchableOpacity>
                                </Link>
                            </ThemedText>
                        </View>
                        {errors.policy ? <ThemedText style={styles.errorText}>{errors.policy}</ThemedText> : null}

                        {/* Sign-Up Button */}
                        <LinearGradient colors={[AppColors.Purple, AppColors.LightBlue]} style={styles.button}>
                            <TouchableOpacity style={styles.buttonInner} onPress={onSignUpPress}>
                                <ThemedText style={styles.buttonText}>Create My Account</ThemedText>
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Sign-in Link */}
                        <View style={styles.bottomView}>
                            <ThemedText>
                                Already have an account? 
                                <Link href="/sign-in">
                                    <ThemedText style={{ color: AppColors.Blue }}> Sign in!</ThemedText>
                                </Link>
                            </ThemedText>
                        </View>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const InputField = ({ value, placeholder, onChangeText, secureTextEntry = false, error }) => (
    <>
        <LinearGradient start={{x:0, y: 0}} end={{x: 1, y: 0}}colors={[AppColors.LightBlue, AppColors.White]} style={styles.input}>
            <TextInput
                style={{ color: "black", marginLeft: 10 }}
                autoCapitalize="none"
                value={value}
                placeholder={placeholder}
                placeholderTextColor="#666666"
                secureTextEntry={secureTextEntry}
                onChangeText={onChangeText}
            />
        </LinearGradient>
        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </>
);

const styles = StyleSheet.create({
    button: { borderRadius: 25, marginTop: 10, padding: 12, alignItems: 'center' },
    buttonInner: { alignItems: 'center' },
    buttonText: { fontWeight: 'normal' },
    bottomView: { alignSelf: 'center', marginTop: 20 },
    input: { borderRadius: 25, marginTop: 10, padding: 15, backgroundColor: 'white' },
    policyContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    checkbox: { marginRight: 10 },
    policyText: { flex: 1 },
    policyLink: { color: AppColors.Blue, textDecorationLine: 'underline', position: 'relative', top: 16 },
    errorText: { color: 'red', fontSize: 12, marginLeft: 15, marginTop: 5 },
    powerplayTitle: { fontFamily: 'Meticula', fontSize: 28, textAlign: 'center', color: AppColors.Blue, lineHeight: 30 },
});