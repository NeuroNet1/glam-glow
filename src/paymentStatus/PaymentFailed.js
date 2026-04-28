import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {confirmPayment} from '@stripe/stripe-react-native';
import Button from '../Button_Component/Buttons';
import {Color} from '../Color/Color';
import {CardDefault} from '../component';
import success from '../Images/successimage.png';
import failed from '../Images/failedimage.png';
import {url} from '../api/Myurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Helpers
import {Loader} from '../Helpers';
import {useNavigation} from '@react-navigation/native';
import Visa from '../Images/visa.png';
import Master from '../Images/master.png';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const PaymentFailed = props => {
  const navigation = useNavigation();
  const payment_intent = props?.route?.params?.paymentIntent;
  const booking_Id = props?.route?.params?.BookingID;
  const [loading, setLoading] = useState(false);
  const [Token, setToken] = useState('');
  const [cardList, setCardList] = useState('');
  const [defaultCards, setDefaultCards] = useState('');
  const [showModal1, setShowModal1] = useState(false);
  const [resultIDs, setResultIDs] = useState('');
  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session !== null) {
          const tokenSession = JSON.parse(session).data;
          setToken(tokenSession?.token);
          listCustomerCard(tokenSession?.token);
        }
      } catch (error) {
        console.log('gettoken error....', error);
      }
    };
    getToken();
  }, []);

  const listCustomerCard = token => {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

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
          card => card.is_default === 1,
        );
        if (defaultCards.length > 0) {
          setDefaultCards(defaultCards);
        } else {
          setDefaultCards(newData?.data);
        }
        setCardList(newData?.data);
      })
      .catch(error => {
        console.log('error', error);
      });
  };
  const updatePaymentStatus = async () => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${Token}`);

    var formdata = new FormData();
    formdata.append('payment_id', payment_intent);
    formdata.append('card_id', defaultCards[0].id);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };
    try {
      const response = await fetch(`${url}updatePaymentStatus`, requestOptions);
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        if (data?.error === false) {
          if (data?.requires_action === true) {
            const newData = data?.client_secret;
            await confirmPayment(newData).then(result => {
              if (result?.paymentIntent?.status === 'Succeeded') {
                confirmPaymentStatus(result?.paymentIntent?.id);
                setLoading(false);
              } else if (result.error) {
                setLoading(false);
              }
            });
          } else {
            navigation.replace('PaymentSuccess', {
              InvID: booking_Id,
            });
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log('Error:', error.message);
    }
  };

  const confirmPaymentStatus = async paymentId => {
    setLoading(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${Token}`);

    var formdata = new FormData();
    formdata.append('payment_id', paymentId);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };
    try {
      const response = await fetch(`${url}updatePaymentStatus`, requestOptions);
      if (response.ok) {
        const data = await response.json();
        if (data?.error === false) {
          navigation.replace('PaymentSuccess', {
            InvID: data?.data?.id,
          });
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log('Error:', error.message);
    }
  };

  const allCard = item => {
    return (
      <TouchableOpacity
        activeOpacity={0.4}
        onPress={() => {
          setDefaultCards([item?.item]);
          setShowModal1(false);
        }}
        style={styles.container}>
        <View style={styles.imgContainer}>
          <Image
            source={item?.item?.brand === 'visa' ? Visa : Master}
            style={styles.img}
          />
        </View>
        <View style={styles.expiryContainer}>
          <View style={{justifyContent: 'center'}}>
            <Text style={styles.text}>
              ************{item?.item?.card_number}
            </Text>
            <Text style={styles.text}>Expiry Date</Text>
            <Text style={styles.text}>
              {item?.item?.month}/{item?.item?.year}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <View
        style={{
          flex: 1 / 1.6,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={failed}
          style={{height: '40%', width: '80%', resizeMode: 'contain'}}
        />
      </View>
      <View style={{marginVertical: 40}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center',color:'#000'}}>
          {'Your payment is failed'}
        </Text>
      </View>
      <View style={{backgroundColor: Color.white}}>
        <Text style={[styles.fontBold, {marginLeft: 20,color:'#000'}]}>
          {'Selected Card'}
        </Text>
        <FlatList
          data={defaultCards}
          renderItem={({item}) => (
            <CardDefault item={item} onPress={() => setShowModal1(true)} />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Button
          onPress={() => {
            navigation.goBack();
          }}
          label={'  Cancel  '}
          color={Color.white}
          fontS={18}
          fontW={'700'}
          marginHorizontal={20}
          padding={10}
          borderRadius={10}
        />
        <Button
          onPress={() => {
            updatePaymentStatus();
          }}
          label={'Retry Payment'}
          color={Color.white}
          fontS={18}
          fontW={'700'}
          marginHorizontal={20}
          padding={10}
          borderRadius={10}
        />
      </View>
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
                <MaterialIcons name="close" size={25} color={Color.black} />
              </TouchableOpacity>
            </View>
            <FlatList data={cardList} renderItem={allCard} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentFailed;

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
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000056',
    padding: 16,
  },
});
