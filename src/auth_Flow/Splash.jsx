import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Color} from '../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      checkFirstTimeUser();
    }, 3000);
  });

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTime = await AsyncStorage.getItem('isFirstTime');
      if (isFirstTime === null) {
        // User is visiting the app for the first time
        navigation.navigate('AppIntro'); // Navigate to your intro screen
        await AsyncStorage.setItem('isFirstTime', 'false'); // Set the flag to indicate the user has visited before
      } else {
        // User has visited the app before
        navigateToCorrectScreen();
      }
    } catch (error) {
      console.log('Error checking first time user:', error);
    }
  };
  const navigateToCorrectScreen = async () => {
    try {
      const centerid = await AsyncStorage.getItem('Centerdata');
      const centerCode = JSON.parse(centerid);
      if (centerCode !== null) {
        navigation.navigate('Tab');
      } else {
        navigation.navigate('Center');
      }
    } catch (error) {
      console.log('splashscreen error....', error);
    }
  };
  return (
    // <LinearGradient style={styles.mainview} colors={Color.button}>
    <View style={styles.mainview}>
      <Animatable.Image
        animation="bounceIn"
        source={require('../Images/logoRound.png')}
        style={styles.image}
      />
      <Animatable.Text animation="bounceIn" style={styles.text}>
        Coral Leisure
      </Animatable.Text>
      <Animatable.Text animation="bounceIn" style={styles.text1}>
        Welcome to Coral Leisure Centre
      </Animatable.Text>
    </View>
    // </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  image: {
    height: 250,
    width: 250,
    borderRadius: 125,
    alignSelf: 'center',
    marginBottom: 20,
  },
  mainview: {
    justifyContent: 'center',
    backgroundColor: Color.white,
    flex: 1,
  },
  text: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
    color: Color.white,
  },
  text1: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.white,
  },
});
