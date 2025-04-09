import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type ScreenHeaderProps = {
  title?: string;
  name?: string | null;
  logo?: boolean;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
};

const ScreenHeader = ({ title, name, logo = false, leftButton, rightButton }: ScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.side}>{leftButton}</View>

        <View style={styles.center}>
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

        <View style={styles.side}>{rightButton}</View>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  image: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
});

export default ScreenHeader;
