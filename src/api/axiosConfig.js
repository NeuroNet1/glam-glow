import axios from 'axios';
import {url} from '../api/Myurl.js';

export const fetchDataWithToken = async (endpoint, token) => {
  try {
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    const response = await axios.get(`${url}${endpoint}`, {headers});
    return response.data;
  } catch (error) {
    console.log('fetchDataWithToken error in config', error);
    throw error;
  }
};

export const sendDataWithToken = async (endpoint, token, formData) => {
  try {
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    if (formData) {
      headers['content-type'] = 'multipart/form-data';
    }
    const response = await axios.post(`${url}${endpoint}`, formData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// multiple api hit one time
export const fetchMultipleDataWithTokens = async (endpoints, token) => {
  try {
    const requests = endpoints.map((endpoint, index) => {
      const headers = token ? {Authorization: `Bearer ${token}`} : {};
      return axios.get(`${url}${endpoint}`, {headers});
    });

    const responses = await Promise.all(requests);
    const responseData = responses.map(response => response.data);

    return responseData;
  } catch (error) {
    console.log('Error fetching data:', error);
    throw error;
  }
};
