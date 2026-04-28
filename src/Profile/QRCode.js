import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Color} from '../Color/Color';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import {formatTimeSlotDate} from '../Helpers/momentFormatter';

const QRCode = item => {
  // const formatTimeslotDate = timestamp => {
  //   const date = new Date(timestamp);
  //   const options = {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   };
  //   const formattedDate = new Intl.DateTimeFormat('US', options).format(date);
  //   return formattedDate;
  // };
  return (
    <ScrollView style={{backgroundColor: Color.white, height: '100%'}}>
      <SafeAreaView>
        <View style={styles.qrcodeview}>
          <Text style={styles.text}>Longford</Text>
          {/* <Image
            source={require('../Images/logo.jpg')}
            style={styles.imagestyle}
          /> */}
          <View style={styles.mainview}>
            <View style={styles.memberview}>
              <Text style={[styles.membertext, {color: Color.gradient1}]}>
                Member Name
              </Text>
              <Text style={[styles.membertext, {color: Color.black}]}>
                {item.route.params.name}
              </Text>
            </View>
            <View style={styles.memberview}>
              <Text
                style={[
                  styles.membertext,
                  {color: Color.gradient1, textAlign: 'right'},
                ]}>
                Membership Number
              </Text>
              <Text
                style={[
                  styles.membertext,
                  {color: Color.black, textAlign: 'right'},
                ]}>
                {item.route.params.barcode}
              </Text>
            </View>
          </View>
          <Barcode
            value={item.route.params.barcode}
            text={item.route.params.barcode}
            textStyle={styles.qrcodetext}
            style={styles.barcode}
            maxWidth={(Dimensions.get('window').width * 2.5) / 3}
          />
          <View>
            <Text style={[styles.qrcodetext, {marginVertical: 20}]}>
              Club Member Since :{' '}
              {formatTimeSlotDate(item.route.params.created_date)}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default QRCode;

const styles = StyleSheet.create({
  qrcodeview: {
    borderWidth: 1,
    borderColor: Color.whitesmoke,
    margin: 10,
    height: 'auto',
    borderRadius: 5,
  },
  qrcodetext: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.black,
    margin: 10,
  },
  barcode: {
    margin: 20,
  },
  text: {
    color: Color.gradient1,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    margin: 20,
  },
  imagestyle: {
    alignSelf: 'center',
    borderRadius: 5,
  },
  mainview: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginVertical: 20,
  },
  memberview: {
    margin: 5,
  },
  membertext: {
    fontSize: 17,
    fontWeight: 'bold',
    margin: 5,
  },
});
