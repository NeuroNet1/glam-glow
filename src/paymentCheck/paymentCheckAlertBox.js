import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {hideAlert} from '../ReduxToolKit/AlertSlice.jsx';
import {useNavigation} from '@react-navigation/native';

import {Color} from '../Color/Color.js';
import Buttons from '../Button_Component/Buttons.js';
import {CardDefault} from '../component';
// Helpers
import {formatTimer} from '../Helpers/momentFormatter.jsx';

export const PaymentCheckAlertBox = ({
  pendingPayment,
  handleCancel,
  defaultCards,
  showAllCard,
  handlePay,
  timeLeft,
}) => {
  const isVisible = useSelector(state => state.alert.isVisible);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  //   const handlePay = () => {
  //     dispatch(hideAlert()); // Hide the dialog before navigating
  //     navigation.navigate('Payment');
  //   };  const allCard = item => {

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleCancel}>
      <View style={styles.container}>
        <View style={styles.dialog}>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <MaterialIcons
              name="warning"
              size={20}
              color={Color.firebrick}
              style={{marginTop: -5, marginRight: 5}}
            />
            <Text
              style={[
                styles.Amount,
                {textAlign: 'center', marginTop: -5, color: Color.firebrick},
              ]}>
              Payment Failed
            </Text>
          </View>

          <FlatList
            data={pendingPayment}
            renderItem={({item}) => {
              return (
                <View>
                  {item &&
                    item.det.map((detailItem, index) => {
                      return (
                        <View
                          key={index}
                          style={{
                            marginVertical: 2,
                            borderWidth: 0.5,
                            borderRadius: 10,
                            padding: 10,
                            borderBottomWidth: 1.5,
                            borderColor: '#2196F3',
                          }}>
                          {/* Render additional details of `detailItem` here if needed */}
                          <Text style={styles.fontTitel}>
                            {
                              detailItem.particulars.split(
                                /Timing|Time|Description/,
                              )[0]
                            }
                          </Text>
                          <Text style={styles.fontTitel}>
                            {
                              item?.created_date
                            }
                          </Text>
                          <Text
                            style={[styles.fontTitel, {fontWeight: 'bold'}]}>
                            {'Assign To:'}{' '}
                            <Text style={styles.fontTitel}>
                              {detailItem.assigned_names}
                            </Text>
                          </Text>
                        </View>
                      );
                    })}
                  <View style={styles.renderContainer}>
                    <Text style={styles.fontTotal}>Discount</Text>
                    <Text
                      style={[
                        styles.fontTotal,
                        {
                          fontWeight: '700',
                        },
                      ]}>
                      €{item?.discount}
                    </Text>
                  </View>
                  <View style={styles.renderContainer}>
                    <Text style={styles.Amount}>Total</Text>
                    <Text style={styles.Amount}>€{item?.net_amt}</Text>
                  </View>
                  <>
                    {defaultCards && defaultCards.length > 0 ? (
                      <View style={{backgroundColor: Color.white}}>
                        <Text style={[styles.fontBold, {marginLeft: 20}]}>
                          {'Selected Card'}
                        </Text>
                        <FlatList
                          data={defaultCards}
                          renderItem={({item}) => (
                            <CardDefault
                              item={item}
                              onPress={() => showAllCard()}
                            />
                          )}
                          keyExtractor={item => item.id.toString()}
                        />
                      </View>
                    ) : (
                      <View style={{backgroundColor: Color.white}}>
                        <Buttons
                          label={'Add Card'}
                          fontS={16}
                          fontW={'600'}
                          color={'#FFFFFF'}
                          padding={10}
                          borderRadius={10}
                          marginTop={12}
                          paddingVertical={12}
                          paddingHorizontal={15}
                          marginHorizontal={100}
                          marginVertical={10}
                          onPress={() => {
                            dispatch(hideAlert());
                            navigation.navigate('Payment_method');
                          }}
                        />
                      </View>
                    )}
                    <View style={styles.actions}>
                      <Buttons
                        label={'Cancel Booking'}
                        fontS={16}
                        fontW={'600'}
                        color={'#FFFFFF'}
                        padding={10}
                        borderRadius={10}
                        marginTop={12}
                        paddingVertical={12}
                        paddingHorizontal={15}
                        marginHorizontal={10}
                        marginVertical={10}
                        onPress={() => handleCancel(item?.id)}
                      />
                      <Buttons
                        label={' Retry Payment '}
                        fontS={16}
                        fontW={'600'}
                        color={'#FFFFFF'}
                        padding={10}
                        borderRadius={10}
                        marginTop={12}
                        paddingVertical={12}
                        paddingHorizontal={15}
                        marginHorizontal={10}
                        marginVertical={10}
                        onPress={() => handlePay(item?.checkout_id)}
                      />
                    </View>
                  </>
                  {timeLeft > 0 && (
                    <Text
                      style={{
                        textAlign: 'center',
                        color: Color.firebrick,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                      {formatTimer(timeLeft)}
                    </Text>
                  )}
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#424141',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>
                    If you want to book it please retry the payment otherwise
                    Cancel the booking.
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    // alignItems: 'center',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fontTitel: {fontSize: 15, fontWeight: '600', color: '#5A5757'},
  renderContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  fontTotal: {
    fontWeight: '600',
    fontSize: 13,
    color: '#424141',
    marginVertical: 5,
  },
  fontBold: {
    textAlign: 'center',
    color: Color.black,
    fontWeight: '600',
    fontSize: 14,
  },
  Amount: {
    fontWeight: '700',
    fontSize: 15,
    color: Color.black,
    marginVertical: 5,
  },
});
