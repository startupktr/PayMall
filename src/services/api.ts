import api from "@/lib/axios";
import { Mall, Location } from "@/types";

export const MallService = {
  async getNearbyMalls(location: Location, radius = 10): Promise<Mall[]> {
    const res = await api.get("/malls/nearby", {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
      },
    });

    return res.data.data ?? [];
  },

  async getMallById(id: string): Promise<Mall | null> {
    const res = await api.get(`/malls/${id}`);
    return res.data.data ?? null;
  },

  async searchMalls(query: string, location?: Location): Promise<Mall[]> {
    const res = await api.get("/malls/search", {
      params: {
        q: query,
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
    });

    return res.data.data ?? [];
  },
};



// import axios from 'axios';
// import { API_BASE_URL } from '@/constants/index';
// import { Mall, Location } from '@/types/index';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor for adding auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     // Add auth token here if needed
//     // const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for handling errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       // Server responded with error
//       console.error('API Error:', error.response.data);
//     } else if (error.request) {
//       // Request made but no response
//       console.error('Network Error:', error.request);
//     } else {
//       console.error('Error:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// export const MallService = {
//   getNearbyMalls: async (location: Location, radius: number = 10): Promise<Mall[]> => {
//     try {
//       const response = await apiClient.get('/malls/nearby', {
//         params: {
//           latitude: location.latitude,
//           longitude: location.longitude,
//           radius,
//         },
//       });
//       return response.data.malls || [];
//     } catch (error) {
//       console.error('Failed to fetch nearby malls:', error);
      
//       // Return mock data for development
//       return getMockMalls(location);
//     }
//   },

//   getMallById: async (mallId: string): Promise<Mall | null> => {
//     try {
//       const response = await apiClient.get(`/malls/${mallId}`);
//       return response.data.mall;
//     } catch (error) {
//       console.error('Failed to fetch mall details:', error);
//       return null;
//     }
//   },

//   searchMalls: async (query: string, location?: Location): Promise<Mall[]> => {
//     try {
//       const response = await apiClient.get('/malls/search', {
//         params: {
//           q: query,
//           latitude: location?.latitude,
//           longitude: location?.longitude,
//         },
//       });
//       return response.data.malls || [];
//     } catch (error) {
//       console.error('Failed to search malls:', error);
//       return [];
//     }
//   },
// };

// // Mock data for development
// const getMockMalls = (location: Location): Mall[] => {
//   return [
//     {
//       id: '1',
//       name: 'City Center Mall',
//       address: '123 Main Street, Downtown',
//       distance: 2.5,
//       latitude: location.latitude + 0.01,
//       longitude: location.longitude + 0.01,
//       rating: 4.5,
//       openingHours: '10:00 AM - 10:00 PM',
//     },
//     {
//       id: '2',
//       name: 'Grand Plaza Shopping',
//       address: '456 Commerce Ave, Business District',
//       distance: 3.8,
//       latitude: location.latitude - 0.02,
//       longitude: location.longitude + 0.015,
//       rating: 4.2,
//       openingHours: '9:00 AM - 9:00 PM',
//     },
//     {
//       id: '3',
//       name: 'Metro Shopping Complex',
//       address: '789 Market Road, Central',
//       distance: 5.1,
//       latitude: location.latitude + 0.03,
//       longitude: location.longitude - 0.02,
//       rating: 4.7,
//       openingHours: '10:00 AM - 11:00 PM',
//     },
//   ];
// };

// export default apiClient;
