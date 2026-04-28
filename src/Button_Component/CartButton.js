import {TouchableOpacity, Text, Image} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Color} from '../Color/Color';

const CartButton = ({
  bg,
  label,
  onPress,
  color,
  fontS,
  fontW,
  padding,
  marginHorizontal,
  marginVertical,
  borderRadius,
  borderWidth,
  borderColor,
  marginTop,
  paddingHorizontal,
  paddingVertical,
  height,
  width,
  disabled,
  image,
  imageStyle,
}) => {
  const buttonColors = disabled ? Color.buttonDisabled : Color.button;
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={image ? ['#fff', '#fff'] : buttonColors}
        style={{
          borderRadius: borderRadius,
          padding: padding,
          marginHorizontal: marginHorizontal,
          marginVertical: marginVertical,
          marginTop: marginTop,
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          borderWidth: borderWidth,
          borderColor: borderColor,
          height: height,
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {image && (
          <Image
            source={image}
            style={[
              {
                width: 20,
                height: 20,
              },
              imageStyle,
            ]}
            resizeMode="cover"
          />
        )}
        <Text
          style={{
            color: color,
            fontSize: fontS,
            fontWeight: fontW,
            textAlign: 'center',
          }}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
export default CartButton;
