import {
  Box,
  SimpleGrid,
  HStack,
  Heading,
  Button,
  Badge,
  VStack,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  IconButton,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Image,
  Divider,
} from "@chakra-ui/react";
import { 
  FiEdit, 
  FiImage, 
  FiCheckCircle, 
  FiCalendar, 
  FiDollarSign, 
  FiPackage, 
  FiMapPin, 
  FiLayers,
  FiArrowRight
} from "react-icons/fi";
import HotelForm from "../../hotels/HotelForm";
import HotelGallery from "../platform/HotelGallery";
import useHotel from "../../../shared/hooks/useHotel";
import { useEffect, useState } from "react";

const DashboardContent = ({ setActiveNavItem }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isGalleryOpen, onOpen: onGalleryOpen, onClose: onGalleryClose } = useDisclosure();
  const { getHotelsByAdmin, editHotel } = useHotel();
  const [hotelData, setHotelData] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      const data = await getHotelsByAdmin();
      setHotelData(data || {});
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del hotel",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, []);

  const handleEditSuccess = async (formData) => {
    try {
      await editHotel(hotelData.uid || hotelData._id, formData);
      await fetchHotelData();
      onClose();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el hotel",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const hotelImage = hotelData?.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

  return (
    <Box>
      {/* Banner Principal del Hotel */}
      <Card overflow="hidden" mb={8} shadow="md" rounded="2xl" border="1px" borderColor="gray.200">
        <Box 
          position="relative" 
          h={{ base: "180px", md: "240px" }}
          bgImage={`url('${hotelImage}')`}
          bgPosition="center"
          bgSize="cover"
        >
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            bgGradient="linear(to-t, blackAlpha.800, blackAlpha.300)" 
          />
          <Flex 
            position="absolute" 
            bottom="0" 
            left="0" 
            right="0" 
            p={{ base: 4, md: 6 }} 
            justify="space-between" 
            align="flex-end"
            flexWrap="wrap"
            gap={4}
          >
            <VStack align="start" spacing={1} color="white">
              <HStack spacing={2}>
                <Badge colorScheme="teal" fontSize="sm" px={3} py={1} rounded="full">
                  {hotelData?.category || "Hotel de Categoría"}
                </Badge>
                <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} rounded="md">
                  Hotel Activo
                </Badge>
              </HStack>
              <Heading size={{ base: "md", md: "xl" }} fontWeight="black">
                {hotelData?.name || "Cargando información del hotel..."}
              </Heading>
              <HStack spacing={2} fontSize="sm" color="gray.200">
                <Icon as={FiMapPin} />
                <Text>{hotelData?.location || "Guatemala"} - {hotelData?.direction || ""}</Text>
              </HStack>
              <HStack spacing={2} pt={1} wrap="wrap">
                <Text fontSize="xs" color="gray.300">Administradores del Hotel:</Text>
                {((hotelData?.admins && hotelData.admins.length > 0) ? hotelData.admins : (hotelData?.admin ? [hotelData.admin] : [])).map((adm, i) => (
                  <Badge key={i} colorScheme="whiteAlpha" bg="whiteAlpha.300" color="white" fontSize="xs" px={2} py={0.5} rounded="md">
                    👤 {adm?.nombre || adm?.name || "Gerente"} ({adm?.email || ""})
                  </Badge>
                ))}
              </HStack>
            </VStack>

            <HStack spacing={2}>
              <Button 
                leftIcon={<FiImage />} 
                colorScheme="whiteAlpha" 
                variant="solid" 
                size="sm"
                rounded="md"
                onClick={onGalleryOpen}
              >
                Galería ({hotelData?.images?.length || 0})
              </Button>
              <Button 
                leftIcon={<FiEdit />} 
                colorScheme="teal" 
                size="sm"
                rounded="md"
                onClick={onOpen}
              >
                Editar Información
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Card>

      {/* Métricas Principales (KPIs) */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
        {/* Habitaciones Libres */}
        <Card bg="white" shadow="sm" rounded="xl" borderWidth="1px" borderColor="teal.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="bold">Habitaciones Libres</StatLabel>
                <Icon as={FiCheckCircle} color="teal.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="teal.600">
                {hotelData?.availableRooms || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                Disponibles para reservación inmediata
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Tarifa Base */}
        <Card bg="white" shadow="sm" rounded="xl" borderWidth="1px" borderColor="blue.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="bold">Tarifas por Noche</StatLabel>
                <Icon as={FiDollarSign} color="blue.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="black" color="blue.600">
                Q{hotelData?.rangeOfPrices?.min || 0} - Q{hotelData?.rangeOfPrices?.max || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                Rango de precios del hotel
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Total Habitaciones */}
        <Card bg="white" shadow="sm" rounded="xl" borderWidth="1px" borderColor="purple.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="bold">Total de Habitaciones</StatLabel>
                <Icon as={FiLayers} color="purple.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="purple.600">
                {(hotelData?.availableRooms || 0) + (hotelData?.busyRooms || 0)}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                Capacidad total del establecimiento
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* Servicios */}
        <Card bg="white" shadow="sm" rounded="xl" borderWidth="1px" borderColor="orange.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="sm" color="gray.600" fontWeight="bold">Servicios Ofrecidos</StatLabel>
                <Icon as={FiPackage} color="orange.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="orange.600">
                {hotelData?.facilities?.length || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                Comodidades e instalaciones activas
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Acciones Rápidas de Administración */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.800">
          Gestión Operativa del Hotel
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
          <Card 
            bg="white" 
            p={4} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Events")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="yellow.50" rounded="lg" color="yellow.600">
                  <FiCalendar size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Solicitudes de Eventos</Text>
                  <Text fontSize="xs" color="gray.500">Aprobar o rechazar eventos de clientes</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>

          <Card 
            bg="white" 
            p={4} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Rooms")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="teal.50" rounded="lg" color="teal.600">
                  <FiLayers size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Control de Habitaciones</Text>
                  <Text fontSize="xs" color="gray.500">Configurar tipos, precios y fotos</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>

          <Card 
            bg="white" 
            p={4} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Reservations")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="blue.50" rounded="lg" color="blue.600">
                  <FiCheckCircle size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Registro de Reservas</Text>
                  <Text fontSize="xs" color="gray.500">Ver huéspedes activos y check-outs</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Instalaciones y Servicios */}
      <Card bg="white" p={6} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="gray.800">
            Instalaciones y Facilidades Registradas
          </Heading>
          <Button size="xs" colorScheme="teal" variant="outline" onClick={onOpen}>
            Modificar Facilidades
          </Button>
        </Flex>
        <Flex gap={2} wrap="wrap">
          {hotelData?.facilities?.map((facility, index) => (
            <Badge key={index} colorScheme="teal" px={3} py={1} rounded="full" fontSize="sm">
              ✓ {facility}
            </Badge>
          ))}
        </Flex>
      </Card>

      {/* Modal Editar Hotel */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px" my="auto">
          <ModalHeader>Editar Información del Hotel</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HotelForm hotelData={hotelData} onSuccess={handleEditSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Galería */}
      <Modal isOpen={isGalleryOpen} onClose={onGalleryClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="1200px" my="auto">
          <ModalHeader>Galería de Imágenes - {hotelData?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HotelGallery images={hotelData?.images || []} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DashboardContent;
