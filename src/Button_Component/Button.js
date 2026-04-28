import {StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Color} from '../Color/Color';

const Button = ({label, onPress, disabled}) => {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} disabled={disabled}>
      <LinearGradient colors={Color.button} style={styles.button}>
        <Text style={styles.buttontext}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
export default Button;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginHorizontal: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttontext: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
