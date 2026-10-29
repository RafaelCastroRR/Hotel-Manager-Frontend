import { useState } from "react";
import { 
  saveReservation as saveReservationRequest, 
  getReservations as getReservationsRequest, 
  getReservationsByUser as getReservationsByUserRequest, 
  editReservation as editReservationRequest, 
  deleteReservation as deleteReservationRequest 
} from "../../services/api";
import { useToast } from "@chakra-ui/react";

export const useReservation = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const saveReservation = async (data) => {
    setLoading(true);
    const response = await saveReservationRequest(data);
    
    if (response.error) {
      const errorMsg = response.e?.response?.data?.msg || 
                       response.e?.response?.data?.message || 
                       response.e?.message || 
                       "Error al realizar la reserva";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setLoading(false);
      return { error: true, message: errorMsg };
    }

    toast({
      title: "¡Reserva Confirmada!",
      description: "Tu reserva ha sido creada exitosamente.",
      status: "success",
      duration: 3500,
      isClosable: true,
    });
    setLoading(false);
    return response.data || response;
  };

  const getReservations = async () => {
    setLoading(true);
    const response = await getReservationsRequest();
    if (response.error) {
      const errorMsg = response.e?.response?.data?.msg || 
                       response.e?.response?.data?.message || 
                       response.e?.message || 
                       "Error al obtener reservaciones";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return [];
    }
    
    setLoading(false);
    return response.reservations || [];
  };

  const getReservationsByUser = async () => {
    setLoading(true);
    const response = await getReservationsByUserRequest();
    if (response.error) {
      const errorMsg = response.e?.response?.data?.msg || 
                       response.e?.response?.data?.message || 
                       response.e?.message || 
                       "Error al cargar tus reservas";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return [];
    }
    setLoading(false);
    return response.reservations || [];
  };

  const editReservation = async (id, data) => {
    setLoading(true);
    const response = await editReservationRequest(id, data);
    if (response.error) {
      const errorMsg = response.e?.response?.data?.msg || 
                       response.e?.response?.data?.message || 
                       response.e?.message || 
                       "Error al editar la reserva";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return { error: true, message: errorMsg };
    }

    toast({
      title: "Reserva actualizada",
      description: "La reserva se ha modificado correctamente.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setLoading(false);
    return response;
  };

  const deleteReservation = async (id) => {
    setLoading(true);
    const response = await deleteReservationRequest(id);
    if (response.error) {
      const errorMsg = response.e?.response?.data?.msg || 
                       response.e?.response?.data?.message || 
                       response.e?.message || 
                       "Error al cancelar la reserva";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return { error: true, message: errorMsg };
    }
    toast({
      title: "Reserva cancelada",
      description: "La reserva ha sido cancelada correctamente.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    setLoading(false);
    return response;
  };

  return { 
    saveReservation, 
    loading, 
    getReservations, 
    getReservationsByUser, 
    editReservation, 
    deleteReservation 
  };
};

export default useReservation;
