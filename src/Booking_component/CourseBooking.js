import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import FastImage from "react-native-fast-image";
import { Color } from "../Color/Color";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url, Asseturl } from "../api/Myurl";
import { imageList, colorList } from "../UtilityData/staticData";
import { Dropdown } from "react-native-element-dropdown";
import BookingBtn from "./Booking";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import NoText from "../Images/noText.png";
// Helpers
import { ShowToast, Loader } from "../Helpers";

const CourseBooking = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused;
  const route = useRoute();
  const [defaultModule] = useState("course");
  const [center_ID, setCenter_Id] = useState("");
  const [classdata, setClassdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(null);
  const [startTimes, setStartTimes] = useState([]);
  const [startDate, setStartDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [categoryType, setCategoryType] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocus1, setIsFocus1] = useState(false);

  useEffect(() => {
    const gettoken = async () => {
      try {
        const center = await AsyncStorage.getItem("Centerdata");
        const centerId = JSON.parse(center).id;
        setCenter_Id(centerId);
        publicListCourses(centerId);
      } catch (error) {
        console.log("token error....");
      }
    };
    gettoken();
  }, [route, isFocused]);

  // Date Filter
  useEffect(() => {
    if (classdata || categoryType?.title) {
      const filteredDates = classdata
        .map((item) => {
          if (item.category === categoryType?.title) {
            return item.start_date;
          }
        })
        .filter((date) => date !== null && date !== undefined);

      // Remove duplicates
      const uniqueStartDate = Array.from(new Set(filteredDates));

      // Format the dates to include day
      const formattedDates = uniqueStartDate?.map((dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        return `${dateString} (${day})`;
      });
      setStartDate(formattedDates);
    }
  }, [categoryType?.title, classdata]);

  // Time Filter
  const TimeFilter = (items) => {
    const filteredTimes = classdata
      .map((item) => {
        if (
          item.category === categoryType?.title &&
          item.start_date === items.split(" ")[0]
        ) {
          return item.start_time;
        }
      })
      .filter((time) => time !== null && time !== undefined);
    const uniqueStartTimes = Array.from(new Set(filteredTimes));
    return setStartTimes(uniqueStartTimes);
  };

  const publicListCourses = async (value) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}publicListCourses/${value}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedDate(null);
        setClassdata(data.data);
      } else {
        console.log("error response not ok:::::::::::");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const filterData = classdata.filter((item) => {
    const isCategoryMatch =
      !categoryType?.title ||
      JSON.parse(item?.category.includes(categoryType?.title));
    const isDateMatch =
      !selectedDate?.title ||
      JSON.parse(item?.start_date.includes(selectedDate?.title.split(" ")[0]));
    const isTimeMatch =
      !selectedTime?.title ||
      JSON.parse(item?.start_time.includes(selectedTime?.title));

    return isCategoryMatch && isDateMatch && isTimeMatch;
  });

  const displaDate = (dateElement) => {
    const date = new Date(dateElement); // Replace this with your date object

    // Format the date as "dd-mm-yyyy"
    const formattedDate = date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return formattedDate;
  };
  const refreshDropDown = () => {
    setCategoryType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setStartTimes([]);
  };

  if (loading) {
    return <Loader />;
  }
  const handleContainerPress = (id) => {
    setIsPressed(id);
  };
  // render 1 for class details
  const renderclassdata = (item) => {
    const image1 = imageList[item.index % imageList.length];
    const color = colorList[item.index % colorList.length];
    return (
      <TouchableOpacity
        key={item?.item?.batch_id}
        onPress={() => {
          if (item.item.enrolled >= item?.item?.total_limit) {
            ShowToast(`In this Course no seat is available for booking`);
          } else {
            handleContainerPress(item.item.batch_id);
            navigation.navigate("CourseDetails", { data: item.item });
          }
        }}
        style={[
          styles.cart,
          {
            backgroundColor:
              item?.item?.batch_id === isPressed ? "#0572C1" : color,
          },
        ]}
      >
        <View style={styles.cartImg}>
          <FastImage
            source={
              item.item.img === null
                ? { uri: image1 }
                : { uri: `${Asseturl}${item.item.img}` }
            }
            resizeMode={FastImage.resizeMode.cover}
            style={{ height: 35, width: 35 }}
          />
        </View>
        <View style={styles.cartTitle}>
          <View
            style={{
              width: "70%",
            }}
          >
            <Text
              numberOfLines={2}
              style={[
                styles.text,
                {
                  color:
                    item?.item?.batch_id === isPressed
                      ? "#ffffff"
                      : Color.black,
                },
              ]}
            >
              {item.item.title}
            </Text>
            <Text
              style={[
                styles.text1,
                {
                  color:
                    item?.item?.batch_id === isPressed ? "#ffffff" : Color.gray,
                },
              ]}
            >
              Start Date -: {displaDate(item.item.start_date)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="access-time"
                size={15}
                color={
                  item?.item?.batch_id === isPressed ? "#ffffff" : Color.gray
                }
              />
              <Text
                style={[
                  styles.text1,
                  {
                    color:
                      item?.item?.batch_id === isPressed
                        ? "#ffffff"
                        : Color.gray,
                    marginStart: 2,
                  },
                ]}
              >
                {item.item.start_time} ({item.item.session_duration} min)
              </Text>
            </View>
            <Text
              style={[
                styles.text1,
                {
                  color:
                    item?.item?.batch_id === isPressed ? "#ffffff" : Color.gray,
                },
              ]}
            >
              Availability:{" "}
              <MaterialIcons name="person" style={styles.cardicon} />{" "}
              {item.item.enrolled} /{" "}
              <MaterialIcons name="person" style={styles.cardicon} />{" "}
              {item.item.total_limit}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: "20%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.text,
              {
                color:
                  item?.item?.batch_id === isPressed ? "#ffffff" : Color.black,
                alignSelf: "center",
                fontSize: 14,
              },
            ]}
          >
            €{item.item.price}
          </Text>
          <Text
            style={[
              styles.text1,
              {
                color:
                  item?.item?.batch_id === isPressed ? "#ffffff" : Color.gray,
              },
            ]}
            numberOfLines={2}
          >
            {item.item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.containerView}>
      <BookingBtn defaultModule={defaultModule} />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={[styles.noResultsText, { marginTop: 0 }]}>
            Select to refine your course search
          </Text>
          <TouchableOpacity
            onPress={refreshDropDown}
            style={{
              marginStart: 20,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="replay-circle-filled"
              size={25}
              color={Color.gray}
            />
          </TouchableOpacity>
        </View>
        <Dropdown
          style={styles.dropdown1}
          placeholderStyle={styles.placeholderStyle1}
          selectedTextStyle={styles.selectedTextStyle1}
          itemContainerStyle={{ backgroundColor: "#ffffff" }}
          itemTextStyle={styles.itemTextStyle}
          activeColor={"#FFF2C2"}
          data={[
            { title: "Swimming lessons", id: "0" },
            { title: "Kids camp", id: "1" },
            { title: "Fitness courses", id: "2" },
          ]}
          maxHeight={300}
          labelField="title"
          valueField="id"
          placeholder={"Select Courses type"}
          value={categoryType}
          onChange={(item) => {
            setCategoryType(item);
            setSelectedDate(null);
            setSelectedTime(null);
            setStartTimes([]);
          }}
        />
        <Dropdown
          style={styles.dropdown1}
          placeholderStyle={styles.placeholderStyle1}
          selectedTextStyle={styles.selectedTextStyle1}
          itemContainerStyle={{ backgroundColor: "#ffffff" }}
          itemTextStyle={styles.itemTextStyle}
          activeColor={"#FFF2C2"}
          data={startDate?.map((time, index) => ({
            title: time,
            id: `${index}`,
          }))}
          maxHeight={300}
          labelField="title"
          valueField="id"
          placeholder={
            !isFocus
              ? "Start Date"
              : startDate.length > 0
              ? ""
              : "No session available"
          }
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={selectedDate}
          onChange={(item) => {
            setSelectedDate(item);
            setSelectedTime(null);
            TimeFilter(item?.title);
          }}
        />
        <Dropdown
          style={styles.dropdown1}
          placeholderStyle={styles.placeholderStyle1}
          selectedTextStyle={styles.selectedTextStyle1}
          itemContainerStyle={{ backgroundColor: "#ffffff" }}
          itemTextStyle={styles.itemTextStyle}
          activeColor={"#FFF2C2"}
          data={startTimes?.map((time, index) => ({
            title: time,
            id: `${index}`,
          }))}
          maxHeight={300}
          labelField="title"
          valueField="id"
          placeholder={
            !isFocus1
              ? "Start Time"
              : startTimes.length > 0
              ? ""
              : "No time slot available"
          }
          onFocus={() => setIsFocus1(true)}
          onBlur={() => setIsFocus1(false)}
          value={selectedTime}
          onChange={(item) => {
            setSelectedTime(item);
          }}
        />
        <FlatList
          data={categoryType && selectedDate && selectedTime ? filterData : []}
          keyExtractor={(item, index) => `${item.batch_id}_${index}`}
          renderItem={renderclassdata}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <FastImage
                source={NoText}
                style={{ height: 180, width: 180 }}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.noResultsText}>Session not found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CourseBooking;

const styles = StyleSheet.create({
  containerView: { backgroundColor: Color.white, height: "100%" },
  cart: {
    width: "96%",
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    padding: 10,
    // paddingHorizontal: 20,
    alignSelf: "center",
    justifyContent: "center",
  },
  cartImg: {
    height: 70,
    width: 70,
    borderRadius: 70 / 2,
    backgroundColor: Color.white,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  cartTitle: {
    alignSelf: "center",
    justifyContent: "center",
    width: "60%",
    paddingStart: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
  text1: {
    fontSize: 13,
    fontWeight: "400",
  },
  dropdown1: {
    marginHorizontal: 10,
    marginTop: 12,
    width: "92%",
    height: 45,
    borderWidth: 1,
    borderColor: "#c3c3c3",
    padding: 2,
    borderRadius: 5,
    alignSelf: "center",
  },
  placeholderStyle1: {
    fontSize: 15,
    color: Color.black,
    textAlign: "center",
  },
  selectedTextStyle1: {
    fontSize: 15,
    color: Color.black,
    textAlign: "center",
  },
  itemTextStyle: {
    fontSize: 15,
    color: Color.black, // Text color for dropdown items
  },
  noResultsText: {
    fontSize: 14,
    marginTop: 10,
    color: Color.black,
    textAlign: "center",
  },
});
