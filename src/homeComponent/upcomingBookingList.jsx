import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Color} from '../Color/Color';

export default upcomingBookingList = ({item}) => {

  const inputString = item?.particulars;
  const datePattern = /\d{4}-\d{2}-\d{2}/; // Regular expression pattern to match the date (YYYY-MM-DD)
  const timePattern = /\d{2}:\d{2}:\d{2}/; // Regular expression pattern to match the time (HH:mm:ss)
  const wordPattern = /\bTime\b/; // Regular expression pattern to match the word "Time"
  const colonPattern = /:/g;

  const result = inputString
    .replace(datePattern, '') // Remove the date portion
    .replace(timePattern, '') // Remove the time portion
    .replace(wordPattern, '') // Remove the word "Time"
    .replace(colonPattern, ''); // Remove the colon ":"
  return (
    <View style={styles.mainview}>
      <View>
        <Text
          style={[
            styles.text,
            {
              fontSize: 16,
              fontWeight: '700',
            },
          ]}>
          <MaterialIcons name="person" style={styles.cardicon} />{' '}
          {item.cust_name}
        </Text>
        <Text style={styles.text}>{item.time_slot}</Text>
        <Text style={styles.text}>{`Particulars : ${result}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainview: {
    width: '90%',
    flexDirection: 'row',
    marginVertical: 10,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#EDEDED',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Color.black,
  },
});
