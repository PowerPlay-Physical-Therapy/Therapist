import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {AppColors} from '@/constants/Colors';
import {ThemedText} from '@/components/ThemedText';

const ScreenHeader = ({ title } : {title: string}) => {
  return (
    <View style={styles.header}>
      <ThemedText style={styles.headerText}>{title}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingTop: 15,
    backgroundColor: AppColors.OffWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ScreenHeader;