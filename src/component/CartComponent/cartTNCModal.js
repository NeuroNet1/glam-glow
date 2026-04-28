import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Color} from '../../Color/Color.js';

import Buttons from '../../Button_Component/Buttons';
import CartButton from '../../Button_Component/CartButton';

const CartTNCModal = ({visibleTNC, handleBack, tncText, handleProceed}) => {
  const handleDropdownChange = item => {
    setCouponCode(item.code);
  };
  return (
    <Modal transparent visible={visibleTNC} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View
          style={{
            height: '90%',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              marginTop: 10,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: Color.white,
            }}>
            <View />

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: Color?.black,
                }}>{`Terms & Condition`}</Text>
            </View>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                height: 40,
                width: 40,
                borderRadius: 40 / 2,
                backgroundColor: 'rgba(192, 192, 192, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialIcons name="close" size={25} color={Color?.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: Color.white,
              padding: 10,
            }}>
            {tncText && (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'justify',
                  color: Color.gray,
                }}>
                {tncText}
              </Text>
            )}

            <Buttons
              label={'Proceed'}
              fontS={16}
              fontW={'600'}
              color={'#FFFFFF'}
              padding={10}
              borderRadius={10}
              marginTop={12}
              paddingVertical={12}
              paddingHorizontal={20}
              onPress={handleProceed}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000040',
  },
});

export default CartTNCModal;
