import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useRef} from 'react';

// all packages
import AppIntroSlider from 'react-native-app-intro-slider';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

// app theme
import Animation1 from '../AppTheme/Images/Animation1.jpg';
import Animation2 from '../AppTheme/Images/Animation2.jpg';
import Animation3 from '../AppTheme/Images/Animation3.jpg';
import Animation4 from '../AppTheme/Images/Animation4.jpg';

const AppIntro = () => {
  const sliderRef = useRef(null);
  const navigation = useNavigation();
  const GIFImage = [
    {name: 'Animation1', id: 1, img: Animation1},
    {name: 'Animation2', id: 2, img: Animation2},
    {name: 'Animation3', id: 3, img: Animation3},
    {name: 'Animation4', id: 4, img: Animation4},
  ];

  const renderSlide = ({item}) => {
    return (
      <View style={styles.slide}>
        <FastImage
          source={item.img}
          resizeMode={FastImage.resizeMode.cover}
          style={styles.image}
        />
      </View>
    );
  };
  const handleSkip = () => {
    // Implement skip functionality here
    console.log('Skip pressed');
  };

  const handleDone = () => {
    // Implement done functionality here
    console.log('Done pressed');
  };

  return (
    <View style={styles.container}>
      <AppIntroSlider
        ref={sliderRef}
        data={GIFImage}
        renderItem={renderSlide}
        dotStyle={{backgroundColor: '#c0c0c0'}}
        activeDotStyle={{backgroundColor: '#ffffff'}}
        showSkipButton
        showPrevButton
        showNextButton
        showDoneButton
        renderSkipButton={() => (
          <Text
            style={styles.text}
            onPress={() => {
              navigation.navigate('Center');
            }}>
            Skip
          </Text>
        )}
        renderDoneButton={() => (
          <Text
            style={styles.text}
            onPress={() => {
              navigation.navigate('Center');
            }}>
            Done
          </Text>
        )}
        renderNextButton={() => <Text style={styles.text}>Next</Text>} // Custom next button
        renderPrevButton={() => <Text style={styles.text}>Prev</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: "center",
    backgroundColor: 'white',
  },
  text: {fontSize: 16, color: '#ffffff'},
  image: {
    width: '100%', // Set width as needed
    height: '100%', // Set height as needed
  },
});

export default AppIntro;
