import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../../api/Myurl';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../../Color/Color';
import {useIsFocused} from '@react-navigation/native';
import Visa from '../../Images/visa.png';
import Master from '../../Images/master.png';
import Button from '../../Button_Component/Buttons';
import {confirmPayment} from '@stripe/stripe-react-native';
import {formatTimeSlotDate} from '../../Helpers/momentFormatter';

//Helpers
import { ShowToast, Loader } from "../../Helpers";

const PurchaseCoursesDetails = params => {
  const id = params.route.params.data;
  const isFocused = useIsFocused();
  const [data, setData] = useState('');
  const [cards, setCards] = useState([]);
  const [cardList, setCardList] = useState([]);
  const [showModal1, setShowModal1] = useState(false);
  const [TOKEN, setTOKEN] = useState('');
  const [showcoursedetail, setShowcoursedetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [courseBooking, setCourseBooking] = useState('');
  useEffect(() => {
    gettoken();
    var now = new Date();
    var day = ('0' + now.getDate()).slice(-2);
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var today = now.getFullYear() + '-' + month + '-' + day;
    setCurrentDate(today);
  }, [isFocused]);
  useEffect(() => {
    if (TOKEN && courseBooking) {
      listCustomerCard(TOKEN);
    }
  }, [TOKEN, courseBooking]);
  const gettoken = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== null) {
        const tokenSession = JSON.parse(session).data;
        setTOKEN(tokenSession?.token);
        privateGetPuchaseDetails(tokenSession?.token);
      }
    } catch (error) {
      console.log('token error....', error);
    }
  };

  const privateGetPuchaseDetails = value => {
    setLoading(true);
    fetch(`${url}privateGetPuchaseDetails2/${id}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + value,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.text())
      .then(result => {
        setLoading(false);
        const newData = JSON.parse(result);
        setShowcoursedetail(newData?.mst_batch_session);
        setCourseBooking(newData?.course_booking);

        const bookingCustId = newData?.course_booking?.cust_id;

        const filteredCustomer = newData?.customers.find(item => {
          return item.id === bookingCustId;
        });
        if (filteredCustomer) {
          setData(filteredCustomer);
        } else {
          setData(null); // or handle the case where no customer is found
        }
      })
      .catch(error => {
        setLoading(false);
      });
  };
  // list customer card Details =========== >
  const listCustomerCard = sessionID => {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${sessionID}`);
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };
    fetch(`${url}clistCustomerCard`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        const defaultCards = newData?.data.filter(
          card => card?.id === courseBooking?.subscription?.cust_card_id,
        );
        setCards(defaultCards);
        setCardList(newData?.data);
      })
      .catch(error => {
        console.log('error', error);
      });
  };
  // change card Details =========== >
  const changeCard = card_id => {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${TOKEN}`);
    const formData = new FormData();
    formData.append('subscription_id', courseBooking?.subscription_id);
    formData.append('membership_id', courseBooking?.subscription?.id);
    formData.append('card_id', card_id);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
      redirect: 'follow',
    };
    fetch(`${url}changeSubscriptionPaymentMethod`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result);
        if (newData.error === false) {
          setShowModal1(false);
          privateGetPuchaseDetails(TOKEN);
        }
      })
      .catch(error => {
        console.log('error', error);
      });
  };

  // Cancel update Subscription Payment Details =========== >
  const updateSubscriptionPayment = async () => {
    try {
      setLoading(true);
      var myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${TOKEN}`);
      const formData = new FormData();
      formData.append(
        'payment_id',
        courseBooking?.failed_payment?.payment_intent,
      );
      formData.append(
        'payment_intent',
        courseBooking?.failed_payment?.client_secret,
      );
      formData.append('card_id', courseBooking?.subscription?.cust_card_id);
      formData.append('subs_id', courseBooking?.subscription_id);
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formData,
        redirect: 'follow',
      };
      const response = await fetch(
        `${url}updateSubscriptionPayment`,
        requestOptions,
      );
      const result = await response.text();
      const newData = JSON.parse(result);

      if (newData.error === false) {
        if (newData?.requires_action === true) {
          const clientSecret = newData?.client_secret;
          await confirmPayment(clientSecret).then(result => {
            if (result?.paymentIntent?.status === 'Succeeded') {
              statusUpdate();
              setLoading(false);
            } else if (result.error) {
              ShowToast(result.error.code);
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        statusUpdate();
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const statusUpdate = async () => {
    try {
      setLoading(true);
      var myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${TOKEN}`);
      const formData = new FormData();
      formData.append(
        'payment_id',
        courseBooking?.failed_payment?.payment_intent,
      );
      formData.append(
        'payment_intent',
        courseBooking?.failed_payment?.client_secret,
      );
      formData.append('subs_id', courseBooking?.subscription_id);
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formData,
        redirect: 'follow',
      };
      const response = await fetch(
        `${url}updateSubscriptionPayment`,
        requestOptions,
      );
      const result = await response.text();
      const newData = JSON.parse(result);
      if (newData.error === false) {
        setLoading(false);
        privateGetPuchaseDetails(TOKEN);
        ShowToast(newData.msg);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const rendercalenderdata = item => {
    return (
      <View
        style={[
          styles.sessionStyle,
          {
            backgroundColor:
              item.item.time_slot >= currentDate ? '#CAFFF2' : '#FDDCF8',
          },
        ]}>
        <View>
          <Text style={styles.text}>
            {formatTimeSlotDate(item.item.time_slot)}
          </Text>
          <Text
            style={[
              styles.text,
              {
                fontSize: 16,
                fontWeight: '700',
              },
            ]}>
            Duration:{' '}
            <MaterialIcons name="watch-later" style={styles.cardicon} />{' '}
            {item.item.session_duration} minutes
          </Text>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: Color.white,
        height: '100%',
        paddingHorizontal: 20,
      }}>
      <View>
        <FlatList
          data={showcoursedetail}
          keyExtractor={(item, index) => index}
          renderItem={rendercalenderdata}
          showsVerticalScrollIndicator={false}
          // showsHorizontalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#000000',
                  marginVertical: 10,
                }}>
                {id.title}
              </Text> */}
              <View style={{height: 250}}>
                <FastImage
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREsW7pOAwEMlyNRZi6atxdltDlT43r2oGdsg&usqp=CAU',
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{height: '100%', width: '100%'}}
                />
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  marginVertical: 10,
                }}>
                <Text
                  style={{fontSize: 12, fontWeight: '600', color: '#4A4949'}}>
                  {'Assigned To -'}
                </Text>
              </View>
              <View style={{paddingHorizontal: 25, paddingBottom: 25}}>
                {data?.name === null ? null : (
                  <View style={styles.profileContainer}>
                    <MaterialIcons name="person" />
                    <Text
                      style={[
                        styles.text3,
                        {
                          fontSize: 14,
                          color: '#000000',
                        },
                      ]}>
                      {data?.name}
                    </Text>
                  </View>
                )}
                {data?.email === null ? null : (
                  <View style={styles.profileContainer}>
                    <MaterialIcons name="email" />
                    <Text
                      style={[
                        styles.text3,
                        {
                          fontSize: 12,
                          color: '#4A4949',
                        },
                      ]}>
                      {data?.email}
                    </Text>
                  </View>
                )}
                {data?.contact_no === null ? null : (
                  <View style={styles.profileContainer}>
                    <MaterialIcons name="phone" />
                    <Text
                      style={[
                        styles.text3,
                        {
                          fontSize: 12,
                          color: '#4A4949',
                        },
                      ]}>
                      {data?.contact_no}
                    </Text>
                  </View>
                )}
              </View>
            </>
          }
          ListFooterComponent={
            <>
              {courseBooking && courseBooking.failed_payment === null ? null : (
                <>
                  {cards && cards.length > 0 ? (
                    <View style={{backgroundColor: Color.white}}>
                      <Text style={[styles.txt1, {fontSize: 14}]}>
                        {'Card Details'}
                      </Text>
                      {cards.map((card, index) => (
                        <View key={index} style={styles.container}>
                          <View style={styles.imgContainer}>
                            <Image
                              source={card?.brand === 'visa' ? Visa : Master}
                              style={styles.img}
                            />
                          </View>
                          <View style={styles.expiryContainer}>
                            <View style={{justifyContent: 'center'}}>
                              <Text style={styles.text}>
                                ************{card?.card_number}
                              </Text>
                              <Text style={styles.text}>Expiry Date</Text>
                              <Text style={styles.text}>
                                {card?.month}/{card?.year}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.editContainer}>
                            <MaterialIcons
                              name="more-vert"
                              onPress={() => {}}
                              size={25}
                              style={{marginTop: 10, color: Color.blue}}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <>
                    <Modal
                      // animationType="slide"
                      transparent={true}
                      visible={showModal1}
                      onRequestClose={() => {
                        setShowModal1(!showModal1);
                      }}>
                      <View style={styles.modal}>
                        <View
                          style={{
                            backgroundColor: Color.white,
                            borderRadius: 10,
                            height: '80%',
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginHorizontal: 8,
                              marginVertical: 10,
                              borderBottomWidth: 1,
                            }}>
                            <View style={styles.close} />
                            <Text
                              style={[
                                styles.TextStyle,
                                {
                                  fontSize: 14,
                                  color: Color.black,
                                },
                              ]}>
                              {'Select Card'}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setShowModal1(false);
                                // setdob('');
                              }}
                              style={styles.close}>
                              <MaterialIcons
                                name="close"
                                size={25}
                                color={Color.black}
                              />
                            </TouchableOpacity>
                          </View>
                          <ScrollView>
                            {cardList.map((card, index) => (
                              <TouchableOpacity
                                key={index}
                                activeOpacity={0.4}
                                onPress={() => {
                                  changeCard(card?.id);
                                }}
                                style={styles.container}>
                                <View style={styles.imgContainer}>
                                  <Image
                                    source={
                                      card?.brand === 'visa' ? Visa : Master
                                    }
                                    style={styles.img}
                                  />
                                </View>
                                <View style={styles.expiryContainer}>
                                  <View style={{justifyContent: 'center'}}>
                                    <Text style={styles.text}>
                                      ************{card?.card_number}
                                    </Text>
                                    <Text style={styles.text}>Expiry Date</Text>
                                    <Text style={styles.text}>
                                      {card?.month}/{card?.year}
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
                  </>
                  <View style={{flexDirection: 'row', marginVertical: 10}}>
                    <Button
                      onPress={() => {
                        updateSubscriptionPayment();
                      }}
                      label={'Retry Payment'}
                      color={Color.white}
                      fontS={18}
                      fontW={'700'}
                      marginHorizontal={10}
                      padding={10}
                      borderRadius={10}
                    />
                    <Button
                      onPress={() => {
                        setShowModal1(true);
                      }}
                      label={'Change Card'}
                      color={Color.white}
                      fontS={18}
                      fontW={'700'}
                      marginHorizontal={10}
                      padding={10}
                      borderRadius={10}
                    />
                  </View>
                </>
              )}
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default PurchaseCoursesDetails;
 
const styles = StyleSheet.create({
  text3: {
    fontWeight: '600',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  profileContainer: {flexDirection: 'row', alignItems: 'center'},
  sessionStyle: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10,
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'pink',
  },

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
  container10: {
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 10,
    marginTop: 10,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000056',
    padding: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color:Color.black,
  },
});
