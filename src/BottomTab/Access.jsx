import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import FastImage from 'react-native-fast-image';
import {Color} from '../Color/Color';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url, Asseturl} from '../api/Myurl';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Swiper from 'react-native-swiper';

// Helpers
import {ShowToast, Loader} from '../Helpers';

const Access = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [TOKEN, setTOKEN] = useState('');
  const [Center, setCenter] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setDate] = useState('');
  const [statusCheck, setStatusCheck] = useState('');
  useEffect(() => {
    const checkLogin = async isSelected => {
      setLoading(true);
      try {
        const centerid = await AsyncStorage.getItem('Centerdata');
        const centerDetails = JSON.parse(centerid);
        setCenter(centerDetails);
        const session = await AsyncStorage.getItem('user_session');
        if (session !== undefined && session !== null) {
          const sessionID = JSON.parse(session)?.data;
          setTOKEN(sessionID?.token);
          getCustomerProfile(sessionID?.token);
          setLoading(false);
        } else {
          navigation.navigate('Login');
          setLoading(false);
        }
      } catch (error) {
        // There was an error on the native side
      }
    };
    checkLogin();
  }, [isFocused]);

  useEffect(() => {
    // Simulate a delay for loading data or component
    setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds (adjust as needed)

    // Optionally, you can also load data here
  }, []);
  const getCustomerProfile = value => {
    setLoading(true);
    fetch(`${url}getCustomerProfile`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + value,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        if (response.status === 401) {
          ShowToast('Your token is expired');
          navigation.navigate('Login');
          setLoading(false);
        } else if (response.ok) {
          return response.text();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(result => {
        setLoading(false);
        const data = JSON.parse(result).data;
        const checkMemberShipStatus = Array.isArray(data?.membership)
          ? data.membership.filter(item => item.status === 'active')
          : [];

        const checkStatus = checkMemberShipStatus.map(item => item.status);
        setStatusCheck(checkStatus);
        setDate(data);
      })
      .catch(error => {
        setLoading(false);
      });
  };
  const displaDate = dateElement => {
    const date = new Date(dateElement); // Replace this with your date object

    // Format the date as "dd-mm-yyyy"
    const formattedDate = date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formattedDate;
  };
  if (loading) {
    return <Loader />;
  }

  const purchaseListRender = item => {
    const data = item?.item?.assigned_users.split(',');
    const assigned_names = item?.item?.assigned_names.split(',');
    return (
      <View
        key={item?.item?.id}
        style={{
          width: Dimensions.get('window').width * 0.92,
          backgroundColor: Color.white,
          marginHorizontal: 15,
          marginVertical: 7,
          padding: 5,
          borderRadius: 5,
        }}>
        <View>
          <Text style={styles.texts}>Membership Plan :</Text>
          <Text style={styles.text}>{item?.item?.package_title}</Text>
        </View>
        <View>
          {/* <View>
            <Text style={styles.texts}>Membership No :</Text>
            {data.map((part, index) => (
              <Text style={[styles.text, {marginBottom: 2}]} key={index}>
                {part.replace(/,/g, '')}
              </Text>
            ))}
          </View> */}
          <View style={{flexDirection: 'row'}}>
            <>
              <Text style={styles.texts}>Expiry Date :</Text>
              <Text style={styles.text}>
                {displaDate(item?.item?.expiry_date)}
              </Text>
            </>
            <>
              <Text style={styles.texts}>Status :</Text>
              <Text style={styles.text}>{item?.item?.status}</Text>
            </>
          </View>
        </View>
        <View>
          <View>
            <View>
              <Text style={styles.texts}>Assign To :</Text>
              {/* {assigned_names.map((part, index) => (
                <Text style={styles.text} key={index}>
                  {part.replace(/,/g, '')}
                </Text>
              ))} */}
              <Text style={styles.text}>{item?.item?.assigned_names}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView>
      <LinearGradient colors={Color.button}>
        <ScrollView style={{height: '100%'}}>
          <Text style={[styles.centername, {fontSize: 25}]}>
            {Center?.center_name}
          </Text>
          <View style={[styles.profileview, {alignItems: 'center'}]}>
            <FastImage
              source={
                data?.img
                  ? {uri: `${Asseturl}${data?.img}`}
                  : require('../Images/ProfileImage.png')
              }
              resizeMode={FastImage.resizeMode.cover}
              style={styles.profileimage}
            />
            <Text style={{color: Color.black, fontWeight: '700', fontSize: 18}}>
              {data?.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="email"
                style={styles.profileicon}
                size={15}
              />
              <Text
                style={{
                  color: Color.gradient1,
                  fontSize: 15,
                  fontWeight: '400',
                  marginHorizontal: 4,
                }}>
                {data?.email}
              </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <View style={{flexDirection: 'row', margin: 2}}>
                <MaterialIcons
                  name="phone"
                  style={styles.profileicon}
                  size={15}
                />
                <Text
                  style={{
                    color: Color.black,
                    fontSize: 15,
                    fontWeight: '400',
                    marginHorizontal: 4,
                  }}>
                  {data?.contact_no}
                </Text>
              </View>
              <View style={{flexDirection: 'row', margin: 2}}>
                <MaterialIcons
                  name="date-range"
                  style={styles.profileicon}
                  size={15}
                />
                <Text
                  style={{
                    color: Color.black,
                    fontSize: 15,
                    fontWeight: '400',
                    marginHorizontal: 4,
                  }}>
                  {displaDate(data?.dob)}
                </Text>
              </View>
            </View>
          </View>
          {data?.membership && data?.membership.length > 0 ? (
            <FlatList
              data={data?.membership}
              horizontal
              pagingEnabled
              renderItem={purchaseListRender}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.index}
            />
          ) : null}
          {data?.membership &&
          data?.membership.length > 0 &&
          statusCheck?.length > 0 ? (
            <Swiper style={styles.swiper} loop={true}>
              <View style={styles.card}>
                <QRCode
                  value={data?.barcode}
                  color={Color.black}
                  backgroundColor={Color.white}
                  borderColor={Color.black}
                  size={170}
                  onError={error =>
                    // console.log(`QR Code Error: ${error.message}`)
                    console.log('QR Code Error:')
                  }
                />
              </View>
              <View style={styles.card}>
                <Barcode
                  value={String(data?.barcode)}
                  text={String(data?.barcode)}
                  textStyle={styles.qrcodetext}
                  style={styles.barcode}
                  maxWidth={(Dimensions.get('window').width * 2.5) / 3}
                />
              </View>
            </Swiper>
          ) : (
            <View
              style={{
                backgroundColor: Color.white,
                margin: 15,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                height: 120,
              }}>
              <Text
                style={{
                  color: '#df4453',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  margin: 10,
                }}>
                Non-Active Membership
              </Text>
            </View>
          )}
          <Text style={styles.centername}>
            Member Since : {displaDate(data?.created_date)}
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Access;

const styles = StyleSheet.create({
  centername: {
    textAlign: 'center',
    color: Color.white,
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
  },
  profileview: {
    flexDirection: 'column',
    backgroundColor: Color.white,
    marginHorizontal: 15,
    marginVertical: 7,
    padding: 5,
    borderRadius: 5,
    justifyContent: 'space-between',
  },
  profileicon: {
    color: Color.black,
    marginTop: 4,
  },
  profileimage: {
    borderRadius: 100,
    width: 90,
    height: 90,
    borderWidth: 3,
    borderColor: Color.white,
  },
  texts: {
    color: Color.black,
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontWeight: '600',
  },
  text: {
    color: Color.black,
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 5,
    fontWeight: '400',
  },
  barcode: {
    margin: 20,
    padding: 15,
  },
  qrcodetext: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Color.black,
  },
  swiper: {
    height: 250,
  },
  card: {
    backgroundColor: Color.white,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    height: 220,
  },
});
