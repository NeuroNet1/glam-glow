import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Color} from '../Color/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../api/Myurl';
const FAQ = () => {
  const [centerDetails, setCenterDetails] = useState('');
  const [Data, setData] = useState([]);
  useEffect(() => {
    checkLogin();
  }, []);
  const checkLogin = async isSelected => {
    // setLoading(true);
    try {
      const centerid = await AsyncStorage.getItem('Centerdata');
      const centerDetails = JSON.parse(centerid);
      setCenterDetails(centerDetails);
      getFaq(centerDetails.id);
    } catch (error) {
      console.log('error:::::');
      // There was an error on the native side
    }
  };

  const getFaq = Id => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };

    fetch(`${url}getFaq/${Id}`, requestOptions)
      .then(response => response.text())
      .then(result => {
        const newData = JSON.parse(result)?.data;
        setData(newData);
      })
      .catch(error => console.log('getBanners error', error));
  };

  // const Data = [
  //   {
  //     id: 1,
  //     question: 'What are your operating hours ?',
  //     answer: `We are generally open ${centerDetails?.open_timing}. However, please note that our hours may vary on holidays and special occasions, so it's always a good idea to check our website or call ahead.`,
  //   },
  //   {
  //     id: 2,
  //     question: 'How can I become a member ?',
  //     answer:
  //       'Becoming a member is easy! You can sign up in person at our facility or visit our website to explore membership options and register online. Our friendly staff will also be happy to assist you with the process.',
  //   },
  //   {
  //     id: 3,
  //     question: 'Do you offer fitness classes ?',
  //     answer:
  //       'Yes, we offer a wide range of fitness classes suitable for all fitness levels. Our class schedule is varied, please check our website or ask at the front desk for the current class schedule.',
  //   },
  //   {
  //     id: 4,
  //     question: 'Is there ample parking available ?',
  //     answer:
  //       'Yes, we provide ample parking spaces for our members and guests. Parking is free, and our facility is easily accessible.',
  //   },
  //   {
  //     id: 5,
  //     question: 'How can I stay updated on your events and promotions ?',
  //     answer:
  //       'To stay in the loop about our events, promotions, and news, be sure to subscribe to our newsletter on our website. You can also follow us on social media for real-time updates.',
  //   },
  //   // {
  //   //   id: 6,
  //   //   question: 'Can I book a court or field in advance ?',
  //   //   answer:
  //   //     'Absolutely! You can reserve a court or field in advance by visiting our website or calling our booking desk. We recommend booking.',
  //   // },
  //   {
  //     id: 6,
  //     question: 'Do you provide personal training services ?',
  //     answer:
  //       'Yes, we have experienced personal trainers available to help you achieve your fitness goals. You can inquire at the front desk to schedule a session with one of our trainers.',
  //   },
  //   // {
  //   //   id: 8,
  //   //   question: 'What facilities do you have for children ?',
  //   //   answer:
  //   //     'We have dedicated areas for children, including a supervised playroom and kid-friendly activities. Parents can enjoy their workouts while their children are safely entertained.',
  //   // },
  //   {
  //     id: 7,
  //     question: 'What amenities do you offer for relaxation ?',
  //     answer:
  //       "We have a spa area with saunas and a stem room for members to unwind after their workouts. It's a perfect way to rejuvenate and distress.",
  //   },
  //   {
  //     id: 8,
  //     question: 'Are there any group discounts available ?',
  //     answer:
  //       ' We do offer group discounts for families, corporate groups, and more. Please get in touch with our membership team for details on group rates and how we can tailor them to your needs.',
  //   },
  // ];
  const [selectedItemId, setSelectedItemId] = useState(null);

  const tooglequestion = itemId => {
    setSelectedItemId(prevItemId => (prevItemId === itemId ? null : itemId));
  };
  return (
    <SafeAreaView style={{backgroundColor: Color.white, height: '100%'}}>
      <View>
        {Data && Data.length > 0 ? (
          <FlatList
            data={Data}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => {
              const Selected_Item = item.id === selectedItemId;
              return (
                <View style={{paddingHorizontal: 10}}>
                  <TouchableOpacity onPress={() => tooglequestion(item.id)}>
                    <View style={styles.titleview}>
                      <Text style={styles.titletext}>
                        {index + 1}. {item.ques}
                      </Text>
                      <MaterialIcons
                        name={
                          Selected_Item
                            ? 'keyboard-arrow-down'
                            : 'keyboard-arrow-right'
                        } 
                        size={20}
                        color={Color.black}
                        // style={[styles.icons, {fontSize: 20, margin: 14}]}
                      />
                    </View>
                  </TouchableOpacity>
                  {Selected_Item && (
                    <View style={styles.bodyview}>
                      <Text style={styles.bodytext}>{item.ans}</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ListFooterComponent={
              <View
                style={{
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={styles.bodytext1}>
                  If you have any other questions or need further information,
                  feel free to contact our friendly staff at{' '}
                  <Text
                    style={{
                      color: Color.royalblue,
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                    {centerDetails?.contact_no} / {centerDetails?.phone}
                  </Text>
                  . We look forward to helping you make the most of your
                  experience at our sports and leisure centre!
                </Text>
              </View>
            }
          />
        ) : (
          <Text style={styles.faqText}>No FAQ available</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Color.gray,
    padding: 5,
  },
  titletext: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  bodyview: {
    marginHorizontal: 10,
    padding: 5,
  },
  bodytext: {
    color: '#707070',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'left',
    lineHeight: 23,
  },
  bodytext1: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'justify',
    lineHeight: 23,
  },
  faqText: {
    color: Color.silver,
    padding: 5,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
