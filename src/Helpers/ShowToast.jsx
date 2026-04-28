import React from 'react';
import {ToastAndroid, Platform} from 'react-native';
import Toast from 'react-native-simple-toast';

const ShowToast = message => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Toast.show(message, Toast.SHORT);
  }
};

export default ShowToast;
