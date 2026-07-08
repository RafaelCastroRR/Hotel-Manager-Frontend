import axios from "axios";
import useAuthStore from "../shared/stores/authStore";

const apiClient = axios.create({
  baseURL: "https://api-hotel.cristianlima.dev",
  timeout: 5000,
});

export const login = async (data) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    const { token, user } = response.data;


    useAuthStore.getState().login(user, token);

    return {
      data: {
        token,
        user,
      },
    };
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();

    if (token) {
      config.headers["x-token"] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (data) => {
  try {
    return await apiClient.post("/auth/register", data);
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getHotels = async () => {
  try {
    const response = await apiClient.get("/hotels/get");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getHotelsByAdmin = async () => {
  try {
    const response = await apiClient.get(`/hotels/admin`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getHotelById = async (id) => {
  try {
    const response = await apiClient.get(`/hotels/search/${id}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const saveHotel = async (data) => {
  try {
    const response = await apiClient.post("/hotels/save", data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const updateHotel = async (id, data) => {
  try {
    const response = await apiClient.put(`/hotels/upgrade/${id}`, data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const deleteHotel = async (id) => {
  try {
    const response = await apiClient.delete(`/hotels/delete/${id}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getManagers = async () => {
  try {
    const response = await apiClient.get("/users/managers");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getUsers = async () => {
  try {
    const response = await apiClient.get("/users")
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    }
  }
}

export const updateUser = async (id, data) => {
  try {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    }
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    }
  }
}

export const enableRoom = async (id) => {
  try {
    const response = await apiClient.put(`/rooms/${id}/enable`)
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    }
  }
}

export const getActiveUsersByHotel = async (hotelId) => {
  try {
    const response = await apiClient.get(`/reservations/active-users/${hotelId}`)
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    }
  }
}

export const updatePassword = async (data) => {
  try {
    const response = await apiClient.patch('/password', data)
    return response.data
  } catch (e) {
    return {
      error: true,
      e
    }
  }
}
export const saveReservation = async (data) => {
  try {
    const response = await apiClient.post("/reservations", data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getReservations = async () => {
  try {
    const response = await apiClient.get("/reservations");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getReservationsByUser = async () => {
  try {
    const response = await apiClient.get(`/reservations/my-reservations`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const editReservation = async (id, data) => {
  try {
    const response = await apiClient.put(`/reservations/${id}`, data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const deleteReservation = async (id) => {
  try {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const createEvent = async (data, hotelId) => {
  try {
    const response = await apiClient.post(`events/hotels/${hotelId}/events`, data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getMyEvents = async () => {
  try {
    const response = await apiClient.get("/events/my-events");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getEvents = async () => {
  try {
    const response = await apiClient.get("/events");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const editEvent = async (id, data) => {
  try {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const cancelEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getServices = async () => {
  try {
    const response = await apiClient.get("/services");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const createService = async (data) => {
  try {
    const response = await apiClient.post("/services", data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const updateService = async (id, data) => {
  try {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getHotelByManager = async () => {
  try {
    const response = await apiClient.get("/hotels/hotel-by-manager");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getRoomsByHotel = async (hotelId) => {
  try {
    const response = await apiClient.get(`/hotels/${hotelId}/rooms`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const createRoom = async (formData) => {
  try {
    const response = await apiClient.post('/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (e) {
    return {
      success: false,
      error: e.response?.data?.msg || 'Error al crear la habitación'
    };
  }
};

export const updateRoom = async (uid, formData) => {
  try {
    const response = await apiClient.put(`/rooms/${uid}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      data: response.data
    };
  } catch (e) {
    return {
      success: false,
      error: e.response?.data?.msg || 'Error al actualizar la habitación'
    };
  }
};

export const toggleRoomState = async (uid, data) => {
  try {
    const response = await apiClient.patch(`/rooms/${uid}`, { available: data });
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const deleteRoom = async (uid) => {
  try {
    const response = await apiClient.patch(`/rooms/${uid}`);
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

// GRAPHICS
export const getOccupancyStats = async () => {
  try {
    const response = await apiClient.get("/hotels/occupancy-stats");
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

// MANAGERS
export const getMonthStats = async () => {
  try {
    const { token } = useAuthStore.getState();
    const response = await apiClient.get(`/hotels/month-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getBusyAvailableRooms = async () => {
  try {
    const { token } = useAuthStore.getState();
    const response = await apiClient.get(`/hotels/busy-available-rooms`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data
  } catch (e) {
    return {
      error: true,
      e,
    };
  }
};

export const getTotalReservations = async () => {
  try {
    const response = await apiClient.get('/reservations/busyRooms')
    return response.data
  } catch (e) {
    return {
      error: true,
      e
    }
  }
}

export const getInvoices = async (hotelId) => {
  try {
    const response = await apiClient.get('/invoices', { params: { hotelId } })
    return response.data
  } catch (e) {
    return {
      error: true,
      e
    }
  }
}

export const createInvoice = async (data) => {
  try {
    const response = await apiClient.post('/invoices', data)
    return response.data
  } catch (e) {
    return {
      error: true,
      e
    }
  }
}
