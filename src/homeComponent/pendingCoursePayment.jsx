import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';

import {useNavigation} from '@react-navigation/native';

import {Color} from '../Color/Color';

// Helpers
import {formatTimeSlotDate} from '../Helpers/momentFormatter';

export default PendingCoursePayment = ({pendingPaymentCourse}) => {
  const navigation = useNavigation();

  return (
    <View>
      <Text style={styles.txtHeader}>Pending Course Payments</Text>
      <FlatList
        data={pendingPaymentCourse}
        renderItem={({item}) => {
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
                  {item?.course?.title}
                </Text>
                <Text
                  style={
                    styles.text
                  }>{`Payment type : ${item?.course?.payment_type} `}</Text>
                <Text style={styles.text}>
                  {formatTimeSlotDate(item?.due_date)}
                </Text>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 14,
                      fontWeight: '600',
                    },
                  ]}>{`Є ${item?.amount}`}</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('PurchaseCoursesDetails', {
                      data: item?.course_booking?.id,
                    });
                  }}
                  style={styles.button}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: 6,
                    }}>
                    Pay Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainview: {
    width: '98%',
    flexDirection: 'row',
    marginVertical: 10,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#EDEDED',
  },
  txtHeader: {
    color: Color.black,
    padding: 5,
    fontWeight: '700',
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Color.black,
  },
  button: {
    backgroundColor: '#FF9C96',
    borderRadius: 6,
    width: '50%',
    marginTop: 5,
    marginBottom: 5,
  },
});
