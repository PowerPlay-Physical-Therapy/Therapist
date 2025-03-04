import * as React from 'react'
import { Text, TextInput, Button, View, Image, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import {ThemedView} from '@/components/ThemedView'
import {AppColors } from '@/constants/Colors'
import {LinearGradient} from 'expo-linear-gradient'
import Checkbox from 'expo-checkbox'

export default function signUP() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [username, setUsername] = React.useState<string>('');
    const [firstName, setFirstName] = React.useState<string>('');
    const [lastName, setLastName] = React.useState<string>('');
    const [role, setRole] = React.useState<'patient' | 'therapist'>('patient')
    const [confirmPassword, setConfirmPassword] = React.useState('')
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

    const validateInputs = () => {
        let valid = true;
        const newErrors = {
            firstName: firstName.trim() ? '' : 'Name is required',
            lastName: lastName.trim() ? '' : 'Last name is required',
            username: username.trim() ? '' : 'Username is required',
            email: /\S+@\S+\.\S+/.test(emailAddress) ? '' : 'Invalid email format',
            password: password.length >= 8 ? '' : 'Password must be at least 8 characters',
            confirmPassword: confirmPassword === password ? '' : "Passwords don't match",
            policy: policyAccepted ? '' : 'You must accept the privacy policy'
        };

        if (Object.values(newErrors).some(error => error !== '')) {
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSignUpPress = React.useCallback(async () => {
        if (!isLoaded) return

        if (!validateInputs()) {
            return;
        }

        try {
            const response = await signUp.create({
                username,
                firstName,
                lastName,
                emailAddress,
                password,
                //publicMetadata: {
                //    role: role
                //}
            })
            console.log(JSON.stringify(response, null, 2))

            if(response.status == 'complete') {
                const backend_response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/therapist/create_therapist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id : response.id,
                        username: response.username,
                        firstname: response.firstName,
                        lastname: response.lastName,
                        email: response.emailAddress,
                    }),
                })
                const data = await backend_response.json();
                console.log("Successfully created new Therapist with ID : ", JSON.stringify(data));
                console.log("Signed up successfully")
                router.push('/sign-in')
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
        console.log("Sign up handling complete")
    }, [isLoaded, signUp, emailAddress, password, username, firstName, lastName, role])

    // Update the GradientButton component with new gradient colors
    const GradientButton = ({ isActive, children }: { isActive: boolean, children: React.ReactNode }) => {
        if (isActive) {
            return (
                <LinearGradient
                    colors={[AppColors.DarkBlue, AppColors.LightBlue]}
                    style={styles.roleButtonActive}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {children}
                </LinearGradient>
            );
        }
        return <View style={styles.roleButton}>{children}</View>;
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 40}}>
                    <>
                    <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
                        <Image
                            source={require('@/assets/images/app-logo.png')}
                            style={{ width: 140, height: 140, alignSelf: 'center', marginBottom: 20 }}
                        />
                        <ThemedText style={{alignSelf: 'center', fontSize: 24}}>Create an Account!</ThemedText>

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            autoCapitalize="words"
                            value={firstName}
                            placeholder="First Name:"
                            placeholderTextColor="#666666"
                            onChangeText={(firstName) => {
                                setFirstName(firstName);
                                setErrors(prev => ({...prev, firstName: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.firstName ? (
                            <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
                        ) : null}

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            autoCapitalize="words"
                            value={lastName}
                            placeholder="Last Name:"
                            placeholderTextColor="#666666"
                            onChangeText={(lastName) => {
                                setLastName(lastName);
                                setErrors(prev => ({...prev, lastName: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.lastName ? (
                            <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
                        ) : null}

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            autoCapitalize="none"
                            value={username}
                            placeholder="Username:"
                            placeholderTextColor="#666666"
                            onChangeText={(username) => {
                                setUsername(username);
                                setErrors(prev => ({...prev, username: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.username ? (
                            <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
                        ) : null}

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Email:"
                            placeholderTextColor="#666666"
                            onChangeText={(email) => {
                                setEmailAddress(email);
                                setErrors(prev => ({...prev, email: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.email ? (
                            <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                        ) : null}

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            value={password}
                            placeholder="Password:"
                            placeholderTextColor="#666666"
                            secureTextEntry={true}
                            onChangeText={(password) => {
                                setPassword(password);
                                setErrors(prev => ({...prev, password: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.password ? (
                            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
                        ) : null}

                        <LinearGradient
                            colors={[AppColors.LightBlue, AppColors.White]}
                            style={styles.input}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                        <TextInput
                            style={{ "color": "black", marginLeft: 10 }}
                            value={confirmPassword}
                            placeholder="Confirm Password:"
                            placeholderTextColor="#666666"
                            secureTextEntry={true}
                            onChangeText={(confirmPassword) => {
                                setConfirmPassword(confirmPassword);
                                setErrors(prev => ({...prev, confirmPassword: ''}));
                            }}
                        />
                        </LinearGradient>
                        {errors.confirmPassword ? (
                            <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
                        ) : null}

                        <View style={styles.roleSelector}>
                            <GradientButton isActive={role === 'patient'}>
                                <TouchableOpacity 
                                    style={styles.roleButtonTouchable}
                                    onPress={() => setRole('patient')}
                                >
                                    <ThemedText style={[
                                        styles.roleText,
                                        role === 'patient' && styles.roleTextActive
                                    ]}>Patient</ThemedText>
                                </TouchableOpacity>
                            </GradientButton>
                            <GradientButton isActive={role === 'therapist'}>
                                <TouchableOpacity 
                                    style={styles.roleButtonTouchable}
                                    onPress={() => setRole('therapist')}
                                >
                                    <ThemedText style={[
                                        styles.roleText,
                                        role === 'therapist' && styles.roleTextActive
                                    ]}>Therapist</ThemedText>
                                </TouchableOpacity>
                            </GradientButton>
                        </View>

                        <View style={styles.policyContainer}>
                            <Checkbox
                                value={policyAccepted}
                                onValueChange={() => {policyAccepted ? setPolicyAccepted(false) : setPolicyAccepted(true)}}
                                color={policyAccepted ? AppColors.LightBlue : undefined}
                                style={styles.checkbox}
                            />
                            <ThemedText style={styles.policyText}>
                                I have read and agree to the {' '}
                                <Link href="/privacy-policy" asChild>
                                    <TouchableOpacity>
                                        <ThemedText style={styles.policyLink}>Privacy Policy</ThemedText>
                                    </TouchableOpacity>
                                </Link>
                            </ThemedText>
                        </View>
                        {errors.policy ? <ThemedText style={styles.errorText}>{errors.policy}</ThemedText> : null}

                        <LinearGradient
                            colors={[AppColors.Purple, AppColors.LightBlue]}
                            style={styles.button}
                        >
                            <TouchableOpacity style={styles.buttonInner} onPress={onSignUpPress}>
                                <ThemedText style={styles.buttonText}>Create My Account</ThemedText>
                            </TouchableOpacity>
                        </LinearGradient>
                    </ThemedView>
                    
                        <View style={styles.bottomView}>
                            <ThemedText>Already have an account? 
                                <Link href="/sign-in">
                                    <ThemedText style={{color: AppColors.Blue}}> Sign in!</ThemedText>
                                </Link>
                            </ThemedText>
                        </View>
                    </>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonInner: {
        padding: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    bottomView: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    roleSelector: {
        flexDirection: 'row',
        backgroundColor: '#A0A0A0', // medium gray
        borderRadius: 25,
        marginVertical: 20,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    roleButton: {
        flex: 1,
        borderRadius: 20,
        alignItems: 'center',
    },
    roleButtonActive: {
        flex: 1,
        borderRadius: 20,
    },
    roleButtonTouchable: {
        width: '100%',
        padding: 10,
        alignItems: 'center',
    },
    roleText: {
        color: '#FFFFFF', // white text for better contrast on gray
        fontWeight: '500',
    },
    roleTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    input: {
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 15,
        backgroundColor: 'white',
    },
    policyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        paddingHorizontal: 10,
    },
    checkbox: {
        marginRight: 10,
    },
    policyText: {
        fontSize: 14,
        flex: 1,
    },
    policyLink: {
        color: AppColors.Blue,
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 5,
    },
})