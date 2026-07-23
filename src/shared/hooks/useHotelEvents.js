import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import useAuthStore from "../stores/authStore";
import {
  getHotelByManager,
  getEventsByHotel,
  createEvent as createEventRequest,
  editEvent as editEventRequest,
  cancelEvent as cancelEventRequest,
  getEventById,
} from "../../services/api";

const useHotelEvents = () => {
  const [events, setEvents] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  const toast = useToast();
  const token = useAuthStore((state) => state.getToken());

  const fetchHotel = useCallback(async () => {
    const response = await getHotelByManager();
    if (response.error) {
      console.error("Error al obtener el hotel:", response.e.message);
      return null;
    }
    const h = response.hotel;
    setHotel(h);
    setHotelId(h.uid || h._id);
    return h;
  }, []);

  const fetchEvents = useCallback(async (hotelIdToUse) => {
    if (!hotelIdToUse) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const response = await getEventsByHotel(hotelIdToUse);
    if (response.error) {
      const msg = response.e.response?.data?.msg || response.e.message;
      setError(msg);
      toast({
        title: "Error al cargar eventos",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setEvents([]);
    } else {
      setEvents(Array.isArray(response) ? response : []);
      setError(null);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      let currentHotel = null;
      if (token) {
        currentHotel = await fetchHotel();
      }

      const idToUse = currentHotel?.uid || currentHotel?._id || hotelId;

      if (!idToUse) {
        console.warn("No se encontró hotelId para eventos.");
        setLoading(false);
        return;
      }

      await fetchEvents(idToUse);
    };

    initialize();
  }, [fetchHotel, fetchEvents, token]);

  const createEvent = async (eventData) => {
    if (!hotelId) {
      toast({
        title: "Error",
        description: "No hay hotel seleccionado para crear eventos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const response = await createEventRequest(eventData, hotelId);
    if (response.error) {
      const msg = response.e.response?.data?.msg || response.e.message;
      toast({
        title: "Error al crear evento",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }
    toast({
      title: "Evento creado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    await fetchEvents(hotelId);
    return true;
  };

  const updateEvent = async (eventId, eventData) => {
    if (!eventId) return false;

    const response = await editEventRequest(eventId, eventData);
    if (response.error) {
      const msg = response.e.response?.data?.msg || response.e.message;
      toast({
        title: "Error al actualizar evento",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }
    toast({
      title: "Evento actualizado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    if (hotelId) await fetchEvents(hotelId);
    return true;
  };

  const deleteEvent = async (eventId) => {
    if (!eventId) return false;

    const response = await cancelEventRequest(eventId);
    if (response.error) {
      const msg = response.e.response?.data?.msg || response.e.message;
      toast({
        title: "Error al eliminar evento",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }
    toast({
      title: "Evento eliminado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    if (hotelId) await fetchEvents(hotelId);
    return true;
  };

  const getEventDetails = async (eventId) => {
    if (!eventId) return null;

    const response = await getEventById(eventId);
    if (response.error) {
      const msg = response.e.response?.data?.msg || response.e.message;
      toast({
        title: "Error al obtener detalles del evento",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return null;
    }
    setEventDetails(response);
    return response;
  };

  return {
    events,
    hotel,
    hotelId,
    loading,
    error,
    eventDetails,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventDetails,
  };
};

export default useHotelEvents;
