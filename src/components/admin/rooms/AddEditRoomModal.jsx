import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  useToast,
  SimpleGrid,
  Box,
  IconButton,
  Text,
  Badge,
  HStack,
  Wrap,
  WrapItem,
  Divider,
} from "@chakra-ui/react";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";
import useAuthStore from "../../../shared/stores/authStore";
import useHotel from "../../../shared/hooks/useHotel";

const ROOM_TYPE_PRESETS = [
  "Habitación Estándar",
  "Habitación Deluxe King",
  "Master Suite con Vista",
  "Bungalow Familiar",
  "Cabaña Ecológica Panorámica",
  "Suite Colonial con Chimenea",
  "Villa Familiar Frente al Mar",
];

const ROOM_AMENITIES_OPTIONS = [
  "Cama King / Queen",
  "Baño Privado con Ducha",
  "Aire Acondicionado",
  "Wifi de Alta Velocidad",
  "Balcón con Vista",
  "TV Smart Streaming",
  "Jacuzzi / Tina",
  "Minibar y Cafetera",
];

const AddEditRoomModal = ({ isOpen, onClose, roomToEdit, onSave }) => {
  const [newRoom, setNewRoom] = useState({
    type: "",
    capacity: 2,
    price_per_night: 500,
  });
  const [hotelId, setHotelId] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const toast = useToast();
  const { user } = useAuthStore();
  const { getHotelsByAdmin } = useHotel();

  const isEditing = !!roomToEdit;

  useEffect(() => {
    const fetchHotelId = async () => {
      try {
        const hotelResponse = await getHotelsByAdmin();
        if (hotelResponse && !hotelResponse.error) {
          setHotelId(hotelResponse.uid || hotelResponse._id);
        }
      } catch (error) {
        console.error("Error al obtener el hotel:", error);
      }
    };

    if (isOpen && !isEditing) {
      fetchHotelId();
    }
  }, [isOpen, isEditing, user?.id]);

  useEffect(() => {
    if (isEditing && roomToEdit) {
      setNewRoom({
        type: roomToEdit.type || "",
        capacity: roomToEdit.capacity || 2,
        price_per_night: roomToEdit.price_per_night || 0,
      });
      setExistingImages(roomToEdit.images || []);
    } else {
      setNewRoom({ type: "", capacity: 2, price_per_night: 500 });
      setExistingImages([]);
      setSelectedAmenities([]);
    }
  }, [isOpen, isEditing, roomToEdit]);

  useEffect(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const urls = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeExistingImage = (url) => {
    setExistingImages((imgs) => imgs.filter((img) => img !== url));
    setDeletedImages((prev) => [...prev, url]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    if (
      !newRoom.type.trim() ||
      newRoom.capacity <= 0 ||
      newRoom.price_per_night <= 0
    ) {
      toast({
        title: "Campos incompletos",
        description: "Ingresa el tipo de habitación, capacidad válida y tarifa por noche mayor a 0.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('type', newRoom.type.trim());
    formData.append('capacity', Number(newRoom.capacity));
    formData.append('price_per_night', Number(newRoom.price_per_night));
    formData.append('hotel_id', isEditing ? roomToEdit.hotel_id : hotelId);

    if (isEditing) {
      existingImages.forEach((img, index) => {
        formData.append(`existingImages[${index}]`, img);
      });
      if (deletedImages.length > 0) {
        deletedImages.forEach((img, index) => {
          formData.append(`deletedImages[${index}]`, img);
        });
      }
    }

    newImages.forEach(img => formData.append('images', img));

    const success = await onSave(isEditing ? (roomToEdit.uid || roomToEdit._id) : null, formData);
    if (success) {
      setNewImages([]);
      setPreviewUrls([]);
      if (!isEditing) {
        setExistingImages([]);
      }
      toast({
        title: isEditing ? "Habitación actualizada" : "Habitación creada exitosamente",
        description: `Tarifa establecida en Q${newRoom.price_per_night} por noche.`,
        status: "success",
        duration: 3500,
        isClosable: true,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent rounded="xl">
        <ModalHeader borderBottom="1px" borderColor="gray.100" color="gray.800">
          {isEditing ? "Editar Habitación" : "Registrar Nueva Habitación"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Tipo de Habitación */}
            <FormControl isRequired>
              <FormLabel fontWeight="semibold">Tipo o Nombre de la Habitación</FormLabel>
              <Input
                value={newRoom.type}
                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                placeholder="Ej: Habitación Deluxe King, Suite Familiar..."
                rounded="md"
              />
              <Text fontSize="xs" color="gray.500" mt={1.5} mb={2}>
                Sugerencias rápidas:
              </Text>
              <Wrap spacing={1.5}>
                {ROOM_TYPE_PRESETS.map((preset) => (
                  <WrapItem key={preset}>
                    <Badge 
                      colorScheme={newRoom.type === preset ? "teal" : "gray"}
                      cursor="pointer"
                      onClick={() => setNewRoom({ ...newRoom, type: preset })}
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                    >
                      + {preset}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </FormControl>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {/* Capacidad */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Capacidad de Huéspedes</FormLabel>
                <NumberInput
                  min={1}
                  max={12}
                  value={newRoom.capacity}
                  onChange={(val) => setNewRoom({ ...newRoom, capacity: parseInt(val) || 1 })}
                  rounded="md"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Capacidad máxima recomendada
                </Text>
              </FormControl>

              {/* Precio por noche en Quetzales */}
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Precio por Noche (Q - Quetzales)</FormLabel>
                <NumberInput
                  min={100}
                  step={50}
                  value={newRoom.price_per_night}
                  onChange={(val) => setNewRoom({ ...newRoom, price_per_night: parseInt(val) || 0 })}
                  rounded="md"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="teal.600" mt={1} fontWeight="medium">
                  {newRoom.price_per_night > 0 ? `Q ${newRoom.price_per_night.toLocaleString()} por noche` : 'Tarifa requerida'}
                </Text>
              </FormControl>
            </SimpleGrid>

            {/* Comodidades destacadas */}
            <Box bg="gray.50" p={4} rounded="lg" borderWidth="1px" borderColor="gray.200">
              <Text fontWeight="semibold" fontSize="sm" mb={2}>
                Comodidades Incluidas en la Habitación:
              </Text>
              <Wrap spacing={2}>
                {ROOM_AMENITIES_OPTIONS.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <WrapItem key={amenity}>
                      <Badge
                        colorScheme={isSelected ? "teal" : "gray"}
                        variant={isSelected ? "solid" : "outline"}
                        cursor="pointer"
                        onClick={() => toggleAmenity(amenity)}
                        px={2.5}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                      >
                        {isSelected && <FiCheck style={{ display: 'inline', marginRight: '4px' }} />}
                        {amenity}
                      </Badge>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>

            <Divider />

            {/* Fotos de la Habitación */}
            <FormControl>
              <FormLabel fontWeight="semibold">Fotos de la Habitación</FormLabel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Input
                    type="file"
                    accept="image/*,.webp"
                    multiple
                    onChange={handleImageChange}
                    display="none"
                    id="room-image-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="room-image-upload"
                    leftIcon={<FiPlus />}
                    colorScheme="teal"
                    variant="outline"
                    w="full"
                    cursor="pointer"
                  >
                    Seleccionar Fotos desde tu Dispositivo
                  </Button>
                </Box>

                {(existingImages.length > 0 || previewUrls.length > 0) && (
                  <SimpleGrid columns={[2, 3, 4]} spacing={3}>
                    {existingImages.map((img, index) => (
                      <Box key={`existing-${index}`} position="relative" rounded="lg" overflow="hidden" shadow="sm">
                        <Image
                          src={img}
                          alt={`Foto ${index + 1}`}
                          objectFit="cover"
                          h="120px"
                          w="full"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1.5}
                          right={1.5}
                          onClick={() => removeExistingImage(img)}
                          aria-label="Eliminar foto"
                        />
                      </Box>
                    ))}
                    {previewUrls.map((url, index) => (
                      <Box key={`new-${index}`} position="relative" rounded="lg" overflow="hidden" shadow="sm">
                        <Image
                          src={url}
                          alt={`Nueva foto ${index + 1}`}
                          objectFit="cover"
                          h="120px"
                          w="full"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1.5}
                          right={1.5}
                          onClick={() => removeNewImage(index)}
                          aria-label="Eliminar foto"
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.100">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSubmit}>
            {isEditing ? "Guardar Cambios" : "Crear Habitación"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

AddEditRoomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  roomToEdit: PropTypes.shape({
    uid: PropTypes.string,
    _id: PropTypes.string,
    type: PropTypes.string,
    capacity: PropTypes.number,
    price_per_night: PropTypes.number,
    hotel_id: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
  onSave: PropTypes.func.isRequired,
};

export default AddEditRoomModal;
