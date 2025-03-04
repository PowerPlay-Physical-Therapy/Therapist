import { StyleSheet, Image, Platform } from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '@/components/ScreenHeader';

export default function ExploreScreen() {
  return (
      <LinearGradient style={{ flex: 1, paddingTop: Platform.OS == 'ios' ? 50 : 0}} colors={[AppColors.OffWhite, AppColors.LightBlue]}>
        <ScreenHeader title="Explore" />
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  title: {
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
  } });