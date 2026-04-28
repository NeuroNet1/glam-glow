import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Color} from '../../Color/Color';

import Visa from '../../Images/visa.png';
import Master from '../../Images/master.png';
const CardDefault = ({item, onPress}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        <Image
          source={item?.brand === 'visa' ? Visa : Master}
          style={styles.img}
        />
      </View>
      <View style={styles.expiryContainer}>
        <View style={{justifyContent: 'center'}}>
          <Text
            style={{
              color: Color.black,
            }}>
            ************{item?.card_number}
          </Text>
          <Text
            style={{
              color: Color.black,
            }}>
            Expiry Date
          </Text>
          <Text
            style={{
              color: Color.black,
            }}>
            {item?.month}/{item?.year}
          </Text>
        </View>
      </View>
      <View style={styles.editContainer}>
        <MaterialIcons
          name="more-vert"
          onPress={onPress}
          size={25}
          style={{marginTop: 10, color: Color.blue}}
        />
      </View>
    </View>
  );
};

export default CardDefault;

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Color.lightgray,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  imgContainer: {
    flex: 1 / 3,
    margin: 10,
    borderColor: Color.lightgray,
    backgroundColor: Color.white,
    elevation: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  img: {height: '80%', width: '80%', resizeMode: 'contain'},
  expiryContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingStart: 10,
  },
  editContainer: {
    flex: 1 / 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
