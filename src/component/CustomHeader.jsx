import React from 'react';
import {View, Text, TouchableOpacity, Platform} from 'react-native';
// all package
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// all component
import ResponsiveText from './ResponsiveText';

const CustomHeader = ({
  title,
  showBack = true,
  backTo,
  color = '#000',
  size = 'medium',
  hide = true,
}) => {
  const navigation = useNavigation();
  const handleBack = () => {
    if (backTo) {
      navigation.navigate(backTo); // navigate to specific screen
    } else {
      navigation.goBack(); // default goBack
    }
  };

  return (
    <View
      style={{
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomWidth: 0.4,
        borderColor: '#000',
      }}>
      {hide && (
        <View style={{flex: 1}}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} style={{paddingStart: 10}}>
              <MaterialIcons
                // name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                name={'arrow-back-ios'}
                size={24}
                color="#1D1CE5"
                style={{marginRight: 10}}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View
        style={{
          flex: hide == true ? 2.5 : -1,
          marginStart: hide == true ? 0 : 20,
          alignItems: 'center',
        }}>
        <ResponsiveText
          size={size}
          style={{
            color: color,
            fontWeight: '400',
          }}>
          {title}
        </ResponsiveText>
      </View>
      <View style={{flex: 1}} />
    </View>
  );
};

export default CustomHeader;
