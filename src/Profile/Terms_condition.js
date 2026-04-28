import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import React from 'react';
import {Color} from '../Color/Color';
const Terms_condition = () => {
  return (
    <ScrollView style={{backgroundColor: Color.white, height: '100%'}}>
      <SafeAreaView>
        <View>
          <Text
            style={[
              styles.text,
              {fontWeight: '700', fontSize: 15, textAlign: 'center'},
            ]}>
            POLICIES & REGULATIONS
          </Text>
          <Text
            style={[styles.text, {color: Color.gradient1, fontWeight: '700'}]}>
            CHILD PROTECTION POLICY
          </Text>
          <Text style={styles.text}>
            Coral Leisure, Longford is first and foremost a family orientated
            organisation and the protection and safeguarding of children is a
            priority of the highest order for the company.
          </Text>
          <Text style={styles.text}>
            We are committed to the development of policies to ensure the
            safety, health and wellbeing of children who come to Coral Leisure,
            Longford.
          </Text>
          <Text style={styles.text}>
            We are committed to developing a training plan for all who work with
            children.
          </Text>
          <Text style={styles.text}>
            Our Full Child Protection Policy is available for download in the
            link below
          </Text>
          <Text
            style={[styles.text, {color: Color.gradient1, fontWeight: 'bold'}]}>
            CHILD ADMISSION POLICY
          </Text>
          <Text style={styles.text}>
            Child Admission Policy – Longford Sports & Leisure Centre
          </Text>
          <Text style={styles.text}>
            Children under 8 years of age must be accompanied by an adult.
          </Text>
          <View>
            <Text style={[styles.text, {fontWeight: 'bold'}]}>
              Adult to Child Ratio:
            </Text>
            <View>
              <Text style={[styles.text, {fontWeight: 'bold'}]}>
                1 adult:{' '}
                <Text style={[styles.text, {fontWeight: '400'}]}>
                  1 child under the age of 3
                </Text>
              </Text>
              <Text style={[styles.text, {fontWeight: 'bold'}]}>
                1 adult:{' '}
                <Text style={[styles.text, {fontWeight: '400'}]}>
                  4 children aged 3-11
                </Text>
              </Text>
            </View>
          </View>
          <Text style={styles.text}>
            All children not yet potty trained must wear a swim nappy.
            (Available at reception).
          </Text>
          <Text style={styles.text}>
            All children and adults must wear a swim hat.
          </Text>
          <Text style={styles.text}>
            No armbands or flotation devices permitted beyond the 1.2m mark
          </Text>
          <Text style={styles.text}>
            Larger Family size cubicles are available for getting children
            changed. These are at the last 2 at the back when you enter the
            changing village.
          </Text>
          <Text style={styles.text}>
            All items must be removed from your cubicle and placed in a locker.
            Lockers are coin operated (€1 coin return). This ensures cubicles
            are available for other pool users.
          </Text>
          <Text style={styles.text}>
            Maximum time allowed in the swimming pool is 2 hours.
          </Text>
          <Text style={styles.text}>
            Children misbehaving will be asked to leave the pool and if parents
            are not on site they will be called.
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Terms_condition;

const styles = StyleSheet.create({
  heading: {
    margin: 10,
    color: Color.blue,
    fontWeight: 'bold',
    fontSize: 20,
  },
  text: {
    textAlign: 'justify',
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 15,
    fontWeight: '400',
    color: Color.black,
  },
  view: {
    flexDirection: 'row',
  },
});
