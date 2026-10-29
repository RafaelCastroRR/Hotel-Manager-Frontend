import { useState } from "react";
import {
  createEvent as createEventRequest, 
  getMyEvents as getMyEventsRequest, 
  getEvents as getEventsRequest, 
  editEvent as editEventRequest, 
  cancelEvent as cancelEventRequest
} from "../../services/api";
import { useToast } from "@chakra-ui/react";

export const useEvent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const getErrorMessage = (response, defaultMsg) => {
    return (
      response?.e?.response?.data?.message ||
      response?.e?.response?.data?.error ||
      response?.e?.response?.data?.msg ||
      response?.e?.message ||
      defaultMsg
    );
  };

  const createEvent = async (data, hotelId) => {
    setIsLoading(true);
    try {
      const response = await createEventRequest(data, hotelId);
      if (response.error) {
        toast({
          title: "Error al solicitar evento",
          description: getErrorMessage(response, "No se pudo crear el evento"),
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return null;
      }
      toast({
        title: "¡Evento Solicitado con Éxito!",
        description: "Tu solicitud ha sido enviada al gerente del hotel para su revisión y aprobación.",
        status: "success",
        duration: 4500,
        isClosable: true,
      });
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Error al procesar la solicitud del evento",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMyEvents = async () => {
    setIsLoading(true);
    try {
      const response = await getMyEventsRequest();
      if (response.error) {
        toast({
          title: "Error",
          description: getErrorMessage(response, "No se pudieron obtener tus eventos"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return [];
      }
      return response.events || [];
    } finally {
      setIsLoading(false);
    }
  };

  const getEvents = async () => {
    setIsLoading(true);
    try {
      const response = await getEventsRequest();
      if (response.error) {
        toast({
          title: "Error", 
          description: getErrorMessage(response, "No se pudieron obtener los eventos"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return [];
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };
    
  const editEvent = async (id, data) => {
    setIsLoading(true);
    try {
      const response = await editEventRequest(id, data);
      if (response.error) {
        toast({
          title: "Error al editar",
          description: getErrorMessage(response, "No se pudo actualizar el evento"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      }
      toast({
        title: "Evento Actualizado",
        description: "Los cambios se guardaron correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEvent = async (id) => {
    setIsLoading(true);
    try {
      const response = await cancelEventRequest(id);
      if (response.error) {
        toast({
          title: "Error al cancelar",
          description: getErrorMessage(response, "No se pudo cancelar el evento"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return null;
      }
      toast({
        title: "Evento Cancelado",
        description: "El evento ha sido cancelado exitosamente",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createEvent,
    getMyEvents,
    getEvents,
    editEvent,
    cancelEvent,
  };
};

export default useEvent;
