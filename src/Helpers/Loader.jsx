import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import React from 'react';
import {Colors} from '../AppTheme/color';

const Loader = () => {
  return (
    <View style={styles.modalBackground}>
      <View style={styles.activityIndicatorWrapper}>
        <ActivityIndicator
          animating={true}
          color="rgb(6, 180, 215)"
          size="large"
          style={styles.activityIndicator}
        />
      </View>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  activityIndicatorWrapper: {
    backgroundColor: Colors.white,
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
    zIndex: 1000,
  },
});
