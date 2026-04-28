import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
// All packages
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

// All components
import {Color} from '../../Color/Color';

const CalendarStrip = ({handlePress}) => {
  const today = moment().startOf('day');
  const [selectedDate, setSelectedDate] = useState(today.format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(today.format('MMM'));
  const listRef = useRef(null);

  useEffect(() => {
    handlePress(today.format('YYYY-MM-DD'));
  }, []);

  // Generate all days of the next 3 months
  const getDates = () => {
    let dates = [];
    for (let i = 0; i < 90; i++) {
      dates.push(moment().add(i, 'days'));
    }
    return dates;
  };

  const dates = getDates();

  // Update month name in header when scrolling
  const handleScroll = event => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / 60);
    if (dates[index]) {
      setCurrentMonth(dates[index].format('MMM'));
    }
  };

  const renderItem = ({item}) => {
    const formattedDate = item.format('YYYY-MM-DD');
    const isSelected = formattedDate === selectedDate;
    const isToday = item.isSame(today, 'day');

    return (
      <TouchableOpacity
        onPress={() => {
          handlePress(formattedDate);
          setSelectedDate(formattedDate);
        }}>
        {isSelected ? (
          <LinearGradient
            colors={Color.button}
            style={[styles.dateContainer, isSelected && styles.selectedDate]}>
            <Text
              style={[styles.dayText, isSelected && styles.selectedDayText]}>
              {isToday ? 'Today' : item.format('ddd')}
            </Text>
            <View
              style={[
                styles.dateCircle,
                isSelected && styles.selectedDateCircle,
              ]}>
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                ]}>
                {item.format('D')}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.dateContainer}>
            <Text
              style={[styles.dayText, isSelected && styles.selectedDayText]}>
              {isToday ? 'Today' : item.format('ddd')}
            </Text>
            <View
              style={[
                styles.dateCircle,
                isSelected && styles.selectedDateCircle,
              ]}>
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                ]}>
                {item.format('D')}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Name Header */}
      <LinearGradient colors={Color.button} style={styles.monthTxtContainer}>
        <Text style={styles.monthText}>{currentMonth.toUpperCase()}</Text>
      </LinearGradient>
      {/* Horizontal Calendar */}
      <FlatList
        ref={listRef}
        horizontal
        data={dates}
        renderItem={renderItem}
        keyExtractor={item => item.format('YYYY-MM-DD')}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  monthTxtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0044cc',
    width: 32,
    height: 76,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    transform: [{rotate: '-90deg'}],
  },
  dateContainer: {
    // width: 40,
    height: 80,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  dayText: {
    fontSize: 14,
    paddingHorizontal: 5,
    color: '#555',
  },
  dateCircle: {
    width: 34,
    height: 34,
    marginHorizontal: 2,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    color: '#333',
  },
  selectedDate: {
    backgroundColor: '#0044cc',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDateCircle: {
    backgroundColor: '#fff',
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  selectedDateText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default CalendarStrip;
