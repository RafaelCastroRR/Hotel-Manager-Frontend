import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Spacer, 
  useToast, 
  Spinner, 
  Center,
  Heading,
  Text,
} from '@chakra-ui/react';
import ServiceForm from './ServiceForm';
import ServicesList from './ServicesList';
import useHotel from '../../../shared/hooks/useHotel';

const ServicesContent = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { getHotelsByAdmin } = useHotel();
  const [hotel, setHotel] = useState(null);

  const fetchHotel = async () => {
    try {
      const hotelData = await getHotelsByAdmin();
      setHotel(hotelData);
      if (hotelData?.services) {
        setServices(hotelData.services);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error al cargar servicios del hotel:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de servicios del hotel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  const refreshServices = async () => {
    await fetchHotel();
  };

  if (loading) {
    return (
      <Box p={5}>
        <Center py={16}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Center>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Flex mb={6} alignItems="center" wrap="wrap" gap={4}>
        <Box>
          <Heading as="h2" size="lg" color="gray.800">
            Servicios Adicionales del Hotel
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Administra los servicios opcionales (desayunos, traslados, spas, tours) que los huéspedes pueden sumar a sus estancias en {hotel?.name || 'tu hotel'}.
          </Text>
        </Box>
        <Spacer />
        <ServiceForm 
          refreshServices={refreshServices} 
          hotelId={hotel?.uid || hotel?._id} 
        />
      </Flex>
      
      <ServicesList 
        services={services} 
        refreshServices={refreshServices} 
      />
    </Box>
  );
};

export default ServicesContent;
