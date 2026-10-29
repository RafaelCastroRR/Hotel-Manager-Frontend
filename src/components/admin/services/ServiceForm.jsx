/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  VStack,
  HStack,
  useDisclosure,
  useToast,
  Icon,
  Text,
  Box,
  Wrap,
  WrapItem,
  Badge,
  InputGroup,
  InputLeftAddon,
  FormHelperText,
} from '@chakra-ui/react';
import { FiPlus, FiSave, FiX, FiCheck } from 'react-icons/fi';
import { createService, updateService } from '../../../services/api';
import useHotel from '../../../shared/hooks/useHotel';

const ServiceForm = ({ refreshServices, editingService = null, onEditComplete, hotelId: initialHotelId = null }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { getHotelsByAdmin } = useHotel();
  const [hotelId, setHotelId] = useState(initialHotelId);

  const isEditing = Boolean(editingService);

  const popularPresets = [
    { name: 'Desayuno Buffet Típico', price: '120', category: 'restaurant', description: 'Huevos al gusto, frijoles volteados, plátanos fritos, queso de capas y café guatemalteco recién tostado.' },
    { name: 'Traslado Ejecutivo Aeropuerto', price: '180', category: 'other', description: 'Transporte privado y seguro en vehículo climatizado desde o hacia el aeropuerto.' },
    { name: 'Circuito Spa & Masaje Relajante', price: '350', category: 'spa', description: 'Sesión de 60 minutos con aceites esenciales naturales y circuito de relajación.' },
    { name: 'Tour Guiado y Senderismo', price: '250', category: 'event', description: 'Excursión guiada por expertos locales conociendo los atractivos principales de la zona.' },
    { name: 'Cena Romántica de 3 Tiempos', price: '450', category: 'restaurant', description: 'Menú especial para parejas con mesa privada decorada y copa de vino de bienvenida.' },
    { name: 'Paseo en Lancha / Tour Acuático', price: '400', category: 'other', description: 'Recorrido privado por los principales puntos del lago/mar con chalecos salvavidas y capitán.' },
    { name: 'Servicio de Lavandería Express', price: '85', category: 'room', description: 'Lavado, secado y planchado con entrega en habitación en menos de 6 horas.' },
    { name: 'Alquiler de Kayak o Paddleboard', price: '110', category: 'other', description: 'Uso de equipo acuático completo por 2 horas con instrucción básica de seguridad.' }
  ];

  useEffect(() => {
    const fetchHotelId = async () => {
      try {
        if (!hotelId) {
          const hotel = await getHotelsByAdmin();
          if (hotel) {
            setHotelId(hotel.uid || hotel._id);
          }
        }
      } catch (error) {
        console.error('Error al obtener el ID del hotel:', error);
      }
    };
    fetchHotelId();
  }, [hotelId]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'other',
    available: true,
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || '',
        description: editingService.description || '',
        price: editingService.price?.toString() || '',
        category: editingService.category || 'other',
        available: editingService.available ?? true,
      });
      onOpen();
    }
  }, [editingService, onOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyPreset = (preset) => {
    setFormData({
      name: preset.name,
      description: preset.description,
      price: preset.price,
      category: preset.category,
      available: true,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'other',
      available: true,
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('El nombre del servicio es obligatorio');
    if (!formData.description.trim()) errors.push('La descripción es obligatoria');
    if (!formData.price || parseFloat(formData.price) <= 0) errors.push('El precio debe ser un número mayor a 0');
    if (!formData.category) errors.push('La categoría es obligatoria');

    if (errors.length > 0) {
      toast({
        title: 'Verifica los campos',
        description: errors.join(', '),
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category || 'other',
        available: formData.available,
        hotel: hotelId
      };

      let response;
      if (isEditing) {
        response = await updateService(editingService._id, serviceData);
      } else {
        response = await createService(serviceData);
      }

      if (response?.error) {
        throw new Error(response.message || response.msg || `Error al ${isEditing ? 'actualizar' : 'crear'} el servicio`);
      }

      toast({
        title: isEditing ? '¡Servicio actualizado!' : '¡Servicio adicional creado!',
        description: `El servicio "${formData.name}" ha sido guardado exitosamente.`,
        status: 'success',
        duration: 3500,
      });

      await refreshServices?.();
      handleModalClose();
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} service:`, error);
      toast({
        title: 'Error',
        description: error.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el servicio`,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    resetForm();
    if (isEditing && onEditComplete) {
      onEditComplete();
    }
  };

  return (
    <>
      {!isEditing && (
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="teal"
          onClick={onOpen}
          shadow="sm"
        >
          Agregar Servicio Adicional
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={handleModalClose} size="xl" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="xl" overflow="hidden">
          <ModalHeader bg="teal.600" color="white" py={4}>
            {isEditing ? 'Editar Servicio Adicional' : 'Crear Nuevo Servicio Adicional'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            {/* Opciones predeterminadas y sugerencias rápidas */}
            {!isEditing && (
              <Box mb={5} p={3.5} bg="teal.50" rounded="lg" borderWidth="1px" borderColor="teal.200">
                <Text fontSize="xs" fontWeight="bold" color="teal.900" mb={1.5}>
                  Plantillas y Servicios Frecuentes (Clic para autocompletar):
                </Text>
                <Wrap spacing={2}>
                  {popularPresets.map((preset, idx) => (
                    <WrapItem key={idx}>
                      <Badge
                        as="button"
                        type="button"
                        cursor="pointer"
                        fontSize="2xs"
                        px={2.5}
                        py={1}
                        rounded="md"
                        colorScheme="teal"
                        variant={formData.name === preset.name ? "solid" : "outline"}
                        _hover={{ bg: "teal.100" }}
                        onClick={() => applyPreset(preset)}
                      >
                        + {preset.name} (Q{preset.price})
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Nombre del Servicio</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Tour en Kayak, Masaje Maya, Cena Romántica..."
                    focusBorderColor="teal.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Descripción</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe qué incluye el servicio, horarios, duración o condiciones."
                    rows={3}
                    focusBorderColor="teal.500"
                  />
                </FormControl>

                <HStack spacing={4} align="flex-start">
                  <FormControl isRequired flex={1}>
                    <FormLabel fontWeight="medium">Precio por Persona o Servicio</FormLabel>
                    <InputGroup>
                      <InputLeftAddon fontWeight="bold">Q</InputLeftAddon>
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        min="1"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="150.00"
                        focusBorderColor="teal.500"
                      />
                    </InputGroup>
                    <FormHelperText fontSize="xs">Monto exacto en Quetzales</FormHelperText>
                  </FormControl>

                  <FormControl isRequired flex={1}>
                    <FormLabel fontWeight="medium">Categoría</FormLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      focusBorderColor="teal.500"
                    >
                      <option value="restaurant">Restaurante & Alimentos</option>
                      <option value="spa">Spa & Bienestar</option>
                      <option value="room">Habitación & Confort</option>
                      <option value="event">Tours, Paseos & Eventos</option>
                      <option value="other">Transporte y Otros</option>
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl display="flex" alignItems="center" bg="gray.50" p={3} rounded="md">
                  <Box flex="1">
                    <FormLabel mb="0" fontSize="sm" fontWeight="medium">Servicio disponible para huéspedes</FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      Los huéspedes podrán añadir este servicio al momento de reservar su habitación.
                    </Text>
                  </Box>
                  <Switch
                    name="available"
                    isChecked={formData.available}
                    onChange={handleInputChange}
                    colorScheme="teal"
                    size="lg"
                  />
                </FormControl>

                <HStack spacing={3} pt={3}>
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    flex={1}
                    isDisabled={submitting}
                    leftIcon={<Icon as={FiX} />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={submitting}
                    loadingText={isEditing ? "Guardando..." : "Creando..."}
                    flex={1}
                    leftIcon={<Icon as={isEditing ? FiCheck : FiSave} />}
                  >
                    {isEditing ? "Guardar Cambios" : "Crear Servicio"}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServiceForm;
