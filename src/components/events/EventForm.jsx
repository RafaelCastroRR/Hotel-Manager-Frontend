/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  useToast,
  Grid,
  GridItem,
  Checkbox,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Text,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import useHotel from '../../shared/hooks/useHotel';
import PropTypes from 'prop-types';

const EventForm = ({ onSuccess, eventData = null, isAdmin = false }) => {
  const isEdit = Boolean(eventData);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const { getHotels } = useHotel();

  // Servicios personalizados adicionales ingresados por el usuario
  const [customServices, setCustomServices] = useState([]);
  const [newCustomService, setNewCustomService] = useState('');

  const serviceOptions = [
    { value: 'Catering', label: 'Catering' },
    { value: 'Decoración', label: 'Decoración' },
    { value: 'Música en vivo', label: 'Música en vivo' },
    { value: 'Fotografía', label: 'Fotografía' },
    { value: 'Videografía', label: 'Videografía' },
    { value: 'Animación', label: 'Animación' },
    { value: 'Seguridad', label: 'Seguridad' },
    { value: 'Valet Parking', label: 'Valet Parking' },
    { value: 'Transporte', label: 'Transporte' },
  ];

  const suggestedExtras = [
    'Proyector y Sonido Profesional',
    'Barra Libre de Cócteles',
    'Luces LED y Efectos',
    'Mesa de Dulces y Postres',
    'Maestro de Ceremonias',
    'Traducción Simultánea'
  ];

  const resourceOptions = [
    { value: 'Sala Principal', label: 'Sala Principal' },
    { value: 'Sala de Conferencias', label: 'Sala de Conferencias' },
    { value: 'Jardín', label: 'Jardín' },
    { value: 'Terraza', label: 'Terraza' },
    { value: 'Salón VIP', label: 'Salón VIP' },
    { value: 'Sala de Reuniones', label: 'Sala de Reuniones' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: eventData || {
      name: '',
      description: '',
      date: '',
      hotel: '',
      assignedResources: [],
      additionalServices: [],
      type: '',
    },
  });

  useEffect(() => {
    if (eventData) {
      const predValues = new Set(serviceOptions.map(s => s.value));
      const incomingServices = eventData.additionalServices || [];
      
      const predMatches = incomingServices.filter(s => predValues.has(s));
      const customMatches = incomingServices.filter(s => !predValues.has(s));

      setCustomServices(customMatches);

      const formattedData = {
        name: eventData.name || '',
        description: eventData.description || '',
        date: eventData.date ? (eventData.date.includes('T') ? eventData.date.slice(0, 16) : eventData.date) : '',
        hotel: eventData.hotel || '',
        assignedResources: eventData.assignedResources || [],
        additionalServices: predMatches,
        type: eventData.type || ''
      };
      
      Object.keys(formattedData).forEach(key => {
        setValue(key, formattedData[key]);
      });
    }
  }, [eventData, setValue]);

  const fetchHotels = useCallback(async () => {
    try {
      const hotelsData = await getHotels();
      setHotels(hotelsData || []);
    } catch (err) {
      console.error('Error al cargar hoteles:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los hoteles',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleAddCustomService = (serviceToAdd = null) => {
    const textToAdd = (typeof serviceToAdd === 'string' ? serviceToAdd : newCustomService).trim();
    if (!textToAdd) return;

    if (customServices.some(s => s.toLowerCase() === textToAdd.toLowerCase())) {
      toast({
        title: 'Servicio ya agregado',
        description: `El servicio "${textToAdd}" ya está en tu lista de servicios adicionales.`,
        status: 'info',
        duration: 2500,
        isClosable: true,
      });
      setNewCustomService('');
      return;
    }

    setCustomServices(prev => [...prev, textToAdd]);
    setNewCustomService('');
  };

  const handleRemoveCustomService = (serviceToRemove) => {
    setCustomServices(prev => prev.filter(s => s !== serviceToRemove));
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Combinar servicios predeterminados seleccionados con los personalizados
      const selectedPredetermined = Array.isArray(data.additionalServices) 
        ? data.additionalServices 
        : (data.additionalServices ? [data.additionalServices] : []);
        
      const allAdditionalServices = Array.from(new Set([...selectedPredetermined, ...customServices]));

      const formattedData = {
        nombre_evento: data.name,
        descripcion: data.description,
        fecha: data.date,
        recursos_asignados: data.assignedResources || [],
        servicios_adicionales: allAdditionalServices,
        tipo_evento: data.type,
        hotel_id: isAdmin ? eventData?.hotel : data.hotel
      };

      if (onSuccess) {
        await onSuccess(formattedData, formattedData.hotel_id);
      }
    } catch (err) {
      console.error('Error al guardar evento:', err);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el evento',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hotels.length === 0) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem colSpan={2}>
          <FormControl isRequired isInvalid={errors.name}>
            <FormLabel fontWeight="medium">Nombre del Evento</FormLabel>
            <Input
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres',
                },
              })}
              placeholder="Ej: Conferencia Nacional de Innovación / Boda Colonial"
              focusBorderColor="teal.500"
            />
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl isRequired isInvalid={errors.description}>
            <FormLabel fontWeight="medium">Descripción</FormLabel>
            <Textarea
              {...register('description', {
                required: 'La descripción es obligatoria',
                minLength: {
                  value: 10,
                  message: 'La descripción debe tener al menos 10 caracteres',
                },
              })}
              placeholder="Detalla los objetivos, cantidad estimada de personas o requerimientos específicos de tu evento."
              rows={3}
              focusBorderColor="teal.500"
            />
            <FormErrorMessage>
              {errors.description && errors.description.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl isRequired isInvalid={errors.type}>
            <FormLabel fontWeight="medium">Tipo de Evento</FormLabel>
            <Select
              {...register('type', {
                required: 'Debe seleccionar un tipo de evento',
              })}
              focusBorderColor="teal.500"
            >
              <option value="">Seleccione un tipo</option>
              <option value="Wedding">Boda</option>
              <option value="Conference">Conferencia</option>
              <option value="Birthday">Cumpleaños</option>
              <option value="Gala">Gala</option>
              <option value="Corporate">Corporativo</option>
              <option value="Graduation">Graduación</option>
              <option value="Anniversary">Aniversario</option>
              <option value="Exhibition">Exposición / Feria</option>
            </Select>
            <FormErrorMessage>
              {errors.type && errors.type.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl isRequired isInvalid={errors.date}>
            <FormLabel fontWeight="medium">Fecha y Hora del Evento</FormLabel>
            <Input
              type="datetime-local"
              {...register('date', {
                required: 'La fecha es obligatoria',
              })}
              focusBorderColor="teal.500"
            />
            <FormErrorMessage>
              {errors.date && errors.date.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        {!isAdmin && (
          <GridItem colSpan={2}>
            <FormControl isRequired isInvalid={errors.hotel}>
              <FormLabel fontWeight="medium">Hotel Sede</FormLabel>
              <Select
                {...register('hotel', {
                  required: 'Debe seleccionar un hotel',
                })}
                focusBorderColor="teal.500"
              >
                <option value="">Seleccione el hotel para tu evento</option>
                {hotels.map(hotel => (
                  <option key={hotel.uid || hotel._id} value={hotel.uid || hotel._id}>
                    {hotel.name} - {hotel.location}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.hotel && errors.hotel.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
        )}

        {/* Recursos del Hotel */}
        <GridItem colSpan={2}>
          <FormControl isInvalid={errors.assignedResources}>
            <FormLabel fontWeight="medium">Espacios y Recursos Solicitados</FormLabel>
            <SimpleGrid columns={[2, 3]} spacing={2.5} bg="gray.50" p={3} rounded="md" borderWidth="1px" borderColor="gray.200">
              {resourceOptions.map(resource => (
                <Checkbox
                  key={resource.value}
                  {...register('assignedResources')}
                  value={resource.value}
                  colorScheme="teal"
                >
                  <Text fontSize="sm">{resource.label}</Text>
                </Checkbox>
              ))}
            </SimpleGrid>
            <FormErrorMessage>
              {errors.assignedResources && errors.assignedResources.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        {/* Servicios Adicionales (Predeterminados y Personalizados) */}
        <GridItem colSpan={2}>
          <FormControl isInvalid={errors.additionalServices}>
            <HStack justify="space-between" mb={1}>
              <FormLabel fontWeight="medium" mb={0}>Servicios Adicionales</FormLabel>
              <Badge colorScheme="teal" variant="subtle">Predeterminados + Personalizados</Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" mb={2}>
              Selecciona los servicios estándar o escribe cualquier requerimiento especial para tu evento:
            </Text>

            {/* Opciones Predeterminadas */}
            <SimpleGrid columns={[2, 3]} spacing={2.5} bg="gray.50" p={3} rounded="md" borderWidth="1px" borderColor="gray.200">
              {serviceOptions.map(service => (
                <Checkbox
                  key={service.value}
                  {...register('additionalServices')}
                  value={service.value}
                  colorScheme="teal"
                >
                  <Text fontSize="sm">{service.label}</Text>
                </Checkbox>
              ))}
            </SimpleGrid>

            {/* Agregar Servicios Adicionales Personalizados */}
            <Box mt={3} p={3.5} bg="teal.50" rounded="md" borderWidth="1px" borderColor="teal.200">
              <Text fontSize="xs" fontWeight="bold" color="teal.800" mb={2}>
                Agregar otro servicio personalizado:
              </Text>
              
              <HStack spacing={2}>
                <Input
                  size="sm"
                  bg="white"
                  placeholder="Ej: Pantalla Gigante LED, Fuegos artificiales, etc."
                  value={newCustomService}
                  onChange={(e) => setNewCustomService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomService();
                    }
                  }}
                  focusBorderColor="teal.500"
                />
                <Button
                  size="sm"
                  colorScheme="teal"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={() => handleAddCustomService()}
                  px={4}
                >
                  Agregar
                </Button>
              </HStack>

              {/* Sugerencias Rápidas */}
              <Box mt={2.5}>
                <Text fontSize="2xs" color="gray.600" mb={1} textTransform="uppercase" fontWeight="semibold">
                  Sugerencias rápidas:
                </Text>
                <Wrap spacing={1.5}>
                  {suggestedExtras.map((extra, idx) => (
                    <WrapItem key={idx}>
                      <Badge
                        as="button"
                        type="button"
                        cursor="pointer"
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                        rounded="md"
                        colorScheme="teal"
                        variant="outline"
                        _hover={{ bg: "teal.100" }}
                        onClick={() => handleAddCustomService(extra)}
                      >
                        + {extra}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              {/* Lista de Servicios Personalizados Agregados */}
              {customServices.length > 0 && (
                <Box mt={3} pt={2} borderTopWidth="1px" borderColor="teal.200">
                  <Text fontSize="xs" fontWeight="semibold" color="teal.900" mb={1.5}>
                    Servicios adicionales agregados ({customServices.length}):
                  </Text>
                  <Wrap spacing={2}>
                    {customServices.map((service, index) => (
                      <WrapItem key={index}>
                        <Tag size="md" colorScheme="teal" borderRadius="full" variant="solid">
                          <TagLabel fontSize="xs">{service}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveCustomService(service)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Box>

            <FormErrorMessage>
              {errors.additionalServices && errors.additionalServices.message}
            </FormErrorMessage>
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            width="full"
            isLoading={isLoading}
            loadingText="Guardando evento..."
            shadow="md"
          >
            {isEdit ? 'Actualizar Evento' : 'Solicitar / Crear Evento'}
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
};

EventForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  eventData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    hotel: PropTypes.string,
    assignedResources: PropTypes.arrayOf(PropTypes.string),
    additionalServices: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string
  }),
  isAdmin: PropTypes.bool
};

export default EventForm;
