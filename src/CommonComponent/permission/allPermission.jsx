import {
    requestNotifications,
    checkNotifications,
    RESULTS,
  } from 'react-native-permissions';
  
  export const checkNotificationsPermission = async () => {
    try {
      // Check notification permission status
      const { status } = await checkNotifications();
      
      if (status !== RESULTS.GRANTED) {
        // Request notification permissions if not granted
        const { status: newStatus } = await requestNotifications(['alert', 'sound', 'badge']);
        return newStatus === RESULTS.GRANTED;
      }
      return status === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking or requesting notification permissions:', error);
      return false;
    }
  };
  