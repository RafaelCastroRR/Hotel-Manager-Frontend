import { useState, useRef, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  Select,
  Button,
  Flex,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Card,
  IconButton,
  Text,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { FiImage, FiUser, FiMapPin, FiStar, FiDollarSign, FiHome } from "react-icons/fi";
import HotelForm from "../../hotels/HotelForm";
import HotelGallery from "./HotelGallery";
import { GenericAlert } from "../../common/GenericAlert";
import useHotel from "../../../shared/hooks/useHotel";

const HotelsContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isGalleryOpen, onOpen: onGalleryOpen, onClose: onGalleryClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const { isOpen: isUpdateAlertOpen, onOpen: onUpdateAlertOpen, onClose: onUpdateAlertClose } = useDisclosure();
  
  const cancelRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [formDataToEdit, setFormDataToEdit] = useState(null);

  const { getHotels, saveHotel, editHotel, deleteHotel, isLoading } = useHotel();
  console.log(hotels);
  const fetchHotels = async () => {
      const response = await getHotels();
      console.log(response);
      setHotels(response);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const getStatusColor = (state) => {
    return state ? "green" : "red";
  };

  const handleHotelSuccess = async (formData) => {
      await saveHotel(formData);
      onClose();
      fetchHotels();

  };

  const handleEditSuccess = async (formData) => {
      setFormDataToEdit(formData);
      onEditClose();
      onUpdateAlertOpen();
  };

  const handleViewGallery = (hotel) => {
    setSelectedHotel(hotel);
    onGalleryOpen();
  };

  const handleEditHotel = (hotel) => {
    setSelectedHotel(hotel);
    onEditOpen();
  };

  const handleDeleteHotel = (hotel) => {
    setSelectedHotel(hotel);
    onDeleteAlertOpen();
  };

  const confirmDelete = async () => {
      await deleteHotel(selectedHotel.uid);
      onDeleteAlertClose();
      fetchHotels();
  };

  const confirmUpdate = async () => {
      await editHotel(selectedHotel.uid, formDataToEdit);
      onUpdateAlertClose();
      fetchHotels();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Gestión de Hoteles</Heading>
        <Button colorScheme="blue" onClick={onOpen} isLoading={isLoading}>
          Nuevo Hotel
        </Button>
      </Flex>

      <Card>
        <CardHeader>
          <Flex gap={4} mb={4}>
            <Input
              placeholder="Buscar hoteles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW="200px"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </Select>
          </Flex>
        </CardHeader>

        <CardBody>
          <Stack spacing={4}>
            {hotels.map((hotel) => (
              <Card key={hotel.uid} variant="outline">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">{hotel.name}</Heading>
                      <Badge colorScheme={getStatusColor(hotel.state)}>
                        {hotel.state ? "Activo" : "Inactivo"}
                      </Badge>
                    </Flex>

                    <HStack spacing={8} align="flex-start" wrap="wrap">
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiMapPin />
                          <Text>{hotel.direction || hotel.location}</Text>
                        </HStack>
                        <HStack>
                          <FiStar />
                          <Text>{hotel.category}</Text>
                        </HStack>
                        <HStack>
                          <FiDollarSign />
                          <Text fontWeight="semibold" color="teal.600">
                            Tarifas: Q{hotel.rangeOfPrices?.min || 0} - Q{hotel.rangeOfPrices?.max || 0}
                          </Text>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiHome />
                          <Text fontWeight="medium">Habitaciones Libres: {hotel.availableRooms || 0}</Text>
                        </HStack>
                        <Badge colorScheme="green" px={2} py={0.5} rounded="md">
                          Disponible para Reservas
                        </Badge>
                      </VStack>

                      {/* Administradores Asignados */}
                      <VStack align="start" spacing={1.5} minW="220px">
                        <HStack>
                          <FiUser color="teal" />
                          <Text fontWeight="bold">
                            Administradores ({((hotel.admins && hotel.admins.length > 0) ? hotel.admins : (hotel.admin ? [hotel.admin] : [])).length}):
                          </Text>
                        </HStack>
                        {((hotel.admins && hotel.admins.length > 0) ? hotel.admins : (hotel.admin ? [hotel.admin] : [])).map((adminObj, idx) => (
                          <Box key={idx} pl={3} borderLeft="2px solid" borderColor="teal.400" py={0.5}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                              {adminObj?.nombre || adminObj?.name || 'Administrador'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {adminObj?.email || ''}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </HStack>

                    <Divider />

                    <Flex justify="flex-end" gap={2}>
                      <IconButton
                        icon={<FiImage />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleViewGallery(hotel)}
                        aria-label="Ver galería"
                      />
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => handleEditHotel(hotel)}
                        isLoading={isLoading}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red"
                        onClick={() => handleDeleteHotel(hotel)}
                        isLoading={isLoading}
                      >
                        Eliminar
                      </Button>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </CardBody>
      </Card>

      {/* Modal para nuevo hotel */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px" my="auto">
          <ModalHeader>Nuevo Hotel</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HotelForm onSuccess={handleHotelSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para editar hotel */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px" my="auto">
          <ModalHeader>Editar Hotel - {selectedHotel?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HotelForm 
              onSuccess={handleEditSuccess} 
              hotelData={selectedHotel}
              isEditing={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isGalleryOpen} onClose={onGalleryClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="1200px" my="auto">
          <ModalHeader>Galería de Imágenes - {selectedHotel?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HotelGallery images={selectedHotel?.images || []} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Alerta de confirmación para eliminar */}
      <GenericAlert
        isOpen={isDeleteAlertOpen}
        onClose={onDeleteAlertClose}
        cancelRef={cancelRef}
        onConfirm={confirmDelete}
        title="Eliminar Hotel"
        description={`¿Estás seguro que deseas eliminar el hotel "${selectedHotel?.name}"? Esta acción no se puede deshacer.`}
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
      />

      {/* Alerta de confirmación para actualizar */}
      <GenericAlert
        isOpen={isUpdateAlertOpen}
        onClose={onUpdateAlertClose}
        cancelRef={cancelRef}
        onConfirm={confirmUpdate}
        title="Confirmar Actualización"
        description="¿Estás seguro que deseas actualizar la información del hotel?"
        confirmButtonText="Confirmar"
        confirmButtonColor="blue"
      />
    </Box>
  );
};

export default HotelsContent; 