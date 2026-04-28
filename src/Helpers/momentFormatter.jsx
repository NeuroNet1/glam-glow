import moment from "moment";
export const formatTimeSlotDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const [month, day, year] = formattedDate.split(/\s+/); // Split by whitespace
  return `${day} ${month}, ${year} ${time}`;
};
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const toDate = (str) => {
  return moment(str).format("DD-MM-YYYY");
};
export const toDay = (str) => {
  return moment(str).format("dddd");
};
export const toTime = (str, hour = 0) => {
  if (hour == 0) return moment(str).format("h:mm a");
  else return moment(str).add(hour, "hours").format("h:mm a");
};
export const addMinToTimestamp = (timestamp, addedMinutes) => {
  return moment(timestamp)
    .add(addedMinutes, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
};
export const CURRENT_TIMEstamp = (timestamp) => {
  return moment(timestamp).format("D MMMM YYYY h:mm A");
};
export const addTime = (str, mint) => {
  if (mint == 0) return moment(str).format("h:mm a");
  else return moment(str).add(mint, "m").format("h:mm a");
};
export const toTime2 = (str) => {
  const time = new Date(Date.parse("1970-01-01T" + str)).toLocaleTimeString(
    [],
    { hour: "numeric", minute: "2-digit", hour12: true }
  );
  return time;
};

export const formatTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
// Format time as MM:SS
export const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};
