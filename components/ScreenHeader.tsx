import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type ScreenHeaderProps = {
  title?: string;
  name?: string | null;
  logo?: boolean;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  streak?: boolean;
  showLeft?: boolean;
  showRight?: boolean;
};

const {width: ScreenWidth} = Dimensions.get('window');

const ScreenHeader = ({ title, name, logo = false, leftButton, rightButton, showLeft = false, showRight = false }: ScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>

        {showLeft &&
        <View style={styles.side}>{leftButton}</View>}

        <View style={showRight? styles.center : styles.centerAlt}>
          {logo ? (
            <View style={styles.logoRow}>
              <ThemedText style={styles.headerText}>{title} {name}</ThemedText>
              
              <Image
                source={require('@/assets/images/app-logo.png')}
                resizeMode="contain"
                style={styles.image}
              />
            </View>
          ) : (
            <ThemedText style={styles.headerText}>{title} {name}</ThemedText>
          )}
        </View>
        
        {showRight &&
        <View style={styles.side}>{rightButton}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 70,
    paddingTop: 30,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: ScreenWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAlt: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 20,
    marginRight: 20,

  },
  image: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginBottom: 20,
  },
});

export default ScreenHeader;
