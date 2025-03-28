import React from 'react';
import { View, Text, StyleSheet, Image, TextInput } from 'react-native';
import {AppColors} from '@/constants/Colors';
import {ThemedText} from '@/components/ThemedText';

type ButtonProps = {
  title?: string,
  name?: string,
  logo?: boolean,
}

const ScreenHeader = ({ title, name = "", logo= false, } : ButtonProps) => {
  return (
    <View style={styles.header}>
      {logo? (
      <View style={styles.logoHeader}>
      <ThemedText style={styles.headerText}>{title} {name}</ThemedText>
      <Image source={require('@/assets/images/app-logo.png')} 
            resizeMode="contain"
            style= {styles.image}></Image></View>) : (
              <View style ={styles.noLogoHeader}>
                <ThemedText style={{fontSize: 20, fontWeight: 'bold'}}>{title} {name}</ThemedText>
              </View>
            )}
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
    alignItems: 'center',
    
  },
  searchBarHeader: {
    height: 110,
    paddingTop: 30,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  logoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 30,
    
  },
  noLogoHeader: {
    justifyContent: 'center',
    height: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 30,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 20,
    position: "relative",
    bottom: 24
  },
  searchbar: {
    backgroundColor: AppColors.LightBlue,
    borderRadius: 12,
    padding: 10,
    width: '90%',
    paddingLeft: 24,
  }
});

export default ScreenHeader;