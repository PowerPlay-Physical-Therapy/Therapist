import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function GuestLayout() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Redirect href={'/(tabs)/profile'} />
    }
    return <Stack screenOptions= {{headerShown: false}}/>
}