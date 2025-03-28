import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Root() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Redirect href={'/home'} />
    }
    return <Redirect href={'/sign-in'} />
}