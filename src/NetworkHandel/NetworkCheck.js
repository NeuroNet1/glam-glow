import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Internet from '../Images/internet.png';

const NetworkCheck = () => {
  return (
    <View style={styles.container}>
      <View style={styles.ImageContainer}>
        <Image source={Internet} style={styles.img} />
      </View>
      <Text style={styles.font}>
        {'Please check your internet connection and try again.'}
      </Text>
    </View>
  );
};

export default NetworkCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  ImageContainer: {
    flex: 1 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {height: '100%', width: '80%'},
  font: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    margin: 20,
  },
});
