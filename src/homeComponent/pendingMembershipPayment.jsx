import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import React from 'react';

import {useNavigation} from '@react-navigation/native';

import {Color} from '../Color/Color';

// Helpers
import {formatTimeSlotDate} from '../Helpers/momentFormatter';

export default PendingMembershipPayment = ({pendingPaymentMembership}) => {
  const navigation = useNavigation();

  return (
    <View>
      <Text style={styles.txtHeader}>Pending Membership Payments</Text>
      <FlatList
        data={pendingPaymentMembership}
        renderItem={({item}) => {
          return (
            <View
              style={[
                styles.mainview,
                {
                  marginHorizontal: 0,
                  width: '98%',
                  padding: 5,
                },
              ]}>
              <View>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 16,
                      fontWeight: '700',
                    },
                  ]}>
                  {item?.membership?.package_title}
                </Text>
                <Text
                  style={
                    styles.text
                  }>{`Particulars : ${item?.membership?.price_group} ( ${item?.membership?.occupant_count} person)`}</Text>
                <Text style={styles.text}>
                  {formatTimeSlotDate(item?.due_date)}
                </Text>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 16,
                      fontWeight: '700',
                    },
                  ]}>{`Є ${item?.amount}`}</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('SubscriptionDetails', {
                      data: item?.membership?.id,
                    });
                  }}
                  style={{
                    backgroundColor: '#FF9C96',
                    borderRadius: 6,
                    width: '50%',
                    marginTop: 5,
                    marginBottom: 5,
                  }}>
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
        // Add keyExtractor if needed
      />
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
});
