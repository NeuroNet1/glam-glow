import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {url} from '../api/Myurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../Color/Color';
import {useNavigation} from '@react-navigation/native';
import {CREDIT_CLASS_BOOKING} from '../api/Myurl.js';
//Helpers
import {Loader} from '../Helpers';

const AllClasses = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [Token, setToken] = useState();
  const [dataList, setDataList] = useState();
  const [isModalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session !== null) {
          const tokenSession = JSON.parse(session).data;
          ClassList(tokenSession?.token);
          setToken(tokenSession?.token);
        }
      } catch (error) {
        console.log('token error....');
      }
    };
    getToken();
  }, []);
  const ClassList = async token => {
    setLoading(true);
    try {
      const response = await fetch(`${url}new_getClassList`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        redirect: 'follow',
      });
      if (response.ok) {
        const data = await response.json();
        setDataList(data?.data);
        setLoading(false);
      } else if (response.status === 401) {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const payMents = {
    pay_mode: 'gift_voucher',
    amount: deleteId?.total_amount,
  };

  const cancelClasses = async () => {
    setLoading(true);
    try {
      const FormData = require('form-data');
      let data = new FormData();
      data.append('invoice_id', deleteId?.booking_id);
      data.append('id', deleteId?.id);
      data.append('payable_amt', deleteId?.total_amount);
      data.append('payments', JSON.stringify([payMents]));

      const response = await fetch(`${url}${CREDIT_CLASS_BOOKING}`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${Token}`},
        redirect: 'follow',
        body: data,
      });
      if (response.ok) {
        const data = await response.json();
        ClassList(Token);
        setModalVisible(false);
      } else {
        console.log('Response Status:', response.status);
      }
    } catch (error) {
      console.log('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = item => {
    return (
      <View style={styles.card}>
        <View
          style={{
            justifyContent: 'center',
            width: '85%',
          }}>
          <Text style={styles?.Txt}>{item?.item?.title}</Text>
          <Text style={styles?.Txt}>
            Invoice no:{' '}
            <Text
              style={[
                styles?.Txt,
                {color: '#0A3ECB'},
              ]}>{`#${item?.item?.invoice_no}`}</Text>
          </Text>
          <Text style={styles?.Txt}>
            {item?.item?.assigned_names}{' '}
            <Text
              style={[
                styles?.Txt,
                {color: '#0A3ECB'},
              ]}>{`(€ ${item?.item?.paid_amt})`}</Text>
          </Text>
          <Text style={styles?.Txt}>Time Slot : {item?.item?.time_slot}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            marginLeft: 5,
            width: '7%',
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('InvoiceDetails', {
                data: item?.item?.booking_id,
              });
            }}
            style={{
              alignItems: 'flex-end',
            }}>
            <MaterialIcons
              name="visibility"
              style={{
                fontSize: 25,
                color: '#0A3ECB',
                //   alignSelf: 'flex-start',
              }}
            />
          </TouchableOpacity>
          {item?.item?.is_credit_note == 0 &&
            item?.item?.is_credit_done == 0 && (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setDeleteId(item?.item);
                }}
                style={{
                  alignItems: 'flex-end',
                }}>
                <MaterialIcons
                  name="delete"
                  style={{
                    fontSize: 25,
                    color: 'red',
                    //   alignSelf: 'flex-start',
                  }}
                />
              </TouchableOpacity>
            )}
        </View>

        <Modal
          visible={isModalVisible}
          onRequestClose={() => {
            setModalVisible(!isModalVisible);
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.1)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={styles.modalcontainer}>
              <MaterialIcons
                name="report"
                size={80}
                color={Color.wheat}
                style={{textAlign: 'center'}}
              />
              <Text
                style={[
                  styles.text1,
                  {
                    fontSize: 20,
                  },
                ]}>
                Are you sure ?
              </Text>
              <Text style={[styles.text1, {fontSize: 14}]}>
                If you cancel your booking at least 2 hours before the scheduled
                time, you will receive a credit note as compensation. Otherwise,
                There is no compensation!
              </Text>
              <View style={styles.modalbuttonview}>
                <TouchableOpacity
                  style={styles.buttonview}
                  onPress={() => cancelClasses()}>
                  <Text style={[styles.text1, {color: Color.white}]}>
                    {'Cancel Booking'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonview, {backgroundColor: Color.gray}]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={[styles.text1, {color: Color.white}]}>
                    {'Cancel'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      {dataList && dataList.length > 0 ? (
        <FlatList data={dataList} renderItem={renderItem} />
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.Txt}>No Bookings Available !</Text>
        </View>
      )}
    </View>
  );
};

export default AllClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    BackGroundColor: Color.white,
  },
  card: {
    width: '94%',
    height: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 10,
    borderColor: 'black',
    paddingStart: 10,
  },
  Txt: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  text1: {
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 16,
    fontWeight: '600',
    color: Color.gray,
    textAlign: 'center',
  },

  modalcontainer: {
    alignSelf: 'center',
    flex: 1 / 3,
    backgroundColor: Color.white,
    padding: 10,
    borderRadius: 8,
  },
  buttonview: {
    height: 50,
    width: '40%',
    alignSelf: 'center',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.red,
    borderRadius: 8,
  },

  modalbuttonview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
