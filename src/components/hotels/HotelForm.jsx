/* eslint-disable react/prop-types */
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Image,
    SimpleGrid,
    Checkbox,
    useToast,
    HStack,
    Grid,
    GridItem,
    IconButton,
    VStack,
    FormErrorMessage,
  } from '@chakra-ui/react';
  import { useForm } from 'react-hook-form';
  import { useState, useEffect } from 'react';
  import { FiPlus, FiX } from 'react-icons/fi';
  import AdminSearch from './AdminSearch';
  
  const HotelForm = ({ hotelData = null, onSuccess }) => {
    const isEdit = Boolean(hotelData);
    const toast = useToast();
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const facilitiesOptions = [
      { value: "Wifi", label: "Wifi" },
      { value: "Piscina", label: "Piscina" },
      { value: "Estacionamiento", label: "Estacionamiento" },
      { value: "Parking Privado", label: "Parking Privado" },
      { value: "Recepción 24h", label: "Recepción 24h" },
      { value: "Calefacción", label: "Calefacción" },
      { value: "Aire Acondicionado", label: "Aire Acondicionado" },
      { value: "Habitaciones Privadas", label: "Habitaciones Privadas" },
      { value: "Servicios Premium", label: "Servicios Premium" },
      { value: "Gimnasio", label: "Gimnasio" },
      { value: "Spa", label: "Spa" },
      { value: "Restaurante", label: "Restaurante" },
      { value: "Bar", label: "Bar" },
      { value: "Terraza", label: "Terraza" },
      { value: "Jardín", label: "Jardín" },
      { value: "Salas de Reuniones", label: "Salas de Reuniones" },
      { value: "Servicio de Limpieza", label: "Servicio de Limpieza" },
      { value: "Servicio de Lavandería", label: "Servicio de Lavandería" },
      { value: "Servicio de Concierge", label: "Servicio de Concierge" },
      { value: "Servicio de Traslado", label: "Servicio de Traslado" },
      { value: "Caja Fuerte", label: "Caja Fuerte" },
      { value: "Ascensor", label: "Ascensor" },
      { value: "Acceso para Discapacitados", label: "Acceso para Discapacitados" },
      { value: "Mascotas Permitidas", label: "Mascotas Permitidas" },
    ];

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
      watch,
      setValue,
    } = useForm({
      defaultValues: {
        name: '',
        direction: '',
        location: '',
        category: '',
        rangeOfPrices: {
          min: '',
          max: '',
        },
        facilities: [],
      },
    });
  
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
  
    const minPrice = watch('rangeOfPrices.min');
    const maxPrice = watch('rangeOfPrices.max');
  
    useEffect(() => {
      if (hotelData) {
        reset({
          name: hotelData.name,
          direction: hotelData.direction,
          location: hotelData.location || '',
          category: hotelData.category,
          rangeOfPrices: {
            min: hotelData.rangeOfPrices?.min || '',
            max: hotelData.rangeOfPrices?.max || '',
          },
          facilities: hotelData.facilities || [],
        });
        // Extraer solo los nombres de archivo de las URLs
        const imageUrls = hotelData.images || [];
        setExistingImages(imageUrls);
        
        if (hotelData.admin) {
          setSelectedAdmin({
            id: hotelData.admin._id || hotelData.admin,
            nombre: hotelData.admin.nombre || '',
            email: hotelData.admin.email || ''
          });
        }
      }
    }, [hotelData, reset]);

    useEffect(() => {
      // Limpiar las URLs anteriores antes de crear nuevas
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      const urls = newImages.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);

      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    }, [newImages]);
  
    const onSubmit = async (data) => {
      try {
        if (!selectedAdmin) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un administrador',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          return;
        }

        const formData = new FormData();

        // Datos básicos
        formData.append('name', data.name);
        formData.append('direction', data.direction);
        formData.append('location', data.location);
        formData.append('category', data.category);
        formData.append('admin', selectedAdmin.id || selectedAdmin._id);

        // Datos que necesitan ser serializados
        const rangeOfPrices = {
          min: data.rangeOfPrices.min,
          max: data.rangeOfPrices.max
        };
        formData.append('rangeOfPrices', JSON.stringify(rangeOfPrices));

        // Asegurarse de que facilities sea un array
        const facilities = Array.isArray(data.facilities) ? data.facilities : [];
        formData.append('facilities', JSON.stringify(facilities));

        // Imágenes nuevas
        newImages.forEach(img => formData.append('images', img));

        // Si estamos editando, agregar información sobre las imágenes
        if (isEdit) {
          // Enviar cada imagen existente como un campo separado
          existingImages.forEach((img, index) => {
            formData.append(`existingImages[${index}]`, img);
          });
          
          // Enviar las imágenes eliminadas
          if (deletedImages.length > 0) {
            console.log('Imágenes a eliminar:', deletedImages);
            deletedImages.forEach((img, index) => {
              formData.append(`deletedImages[${index}]`, img);
            });
          }
        }

        if (onSuccess) onSuccess(formData);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error al guardar el hotel',
          description: err.response?.data?.msg || 'Ocurrió un error inesperado',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    };
  
    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
    };
  
    const removeExistingImage = (url) => {
      console.log('Eliminando imagen:', url);
      setExistingImages((imgs) => imgs.filter((img) => img !== url));
      setDeletedImages((prev) => [...prev, url]);
      console.log('Imágenes eliminadas actualizadas:', [...deletedImages, url]);
    };

    const removeNewImage = (index) => {
      // Revocar la URL de la imagen que se está eliminando
      URL.revokeObjectURL(previewUrls[index]);
      
      setNewImages(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
  
    return (
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel>Nombre</FormLabel>
              <Input
                {...register('name', {
                  required: 'El nombre del hotel es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres',
                  },
                  maxLength: {
                    value: 100,
                    message: 'El nombre no puede exceder los 100 caracteres',
                  },
                })}
                placeholder="Ingrese el nombre del hotel"
              />
              <FormErrorMessage>
                {errors.name && errors.name.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isRequired isInvalid={errors.direction}>
              <FormLabel>Dirección</FormLabel>
              <Textarea
                {...register('direction', {
                  required: 'La dirección del hotel es obligatoria',
                  minLength: {
                    value: 10,
                    message: 'La dirección debe tener al menos 10 caracteres',
                  },
                  maxLength: {
                    value: 200,
                    message: 'La dirección no puede exceder los 200 caracteres',
                  },
                })}
                placeholder="Ingrese la dirección completa del hotel"
              />
              <FormErrorMessage>
                {errors.direction && errors.direction.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isRequired isInvalid={errors.location}>
              <FormLabel>Ubicación</FormLabel>
              <Input
                {...register('location', {
                  required: 'La ubicación del hotel es obligatoria',
                  minLength: {
                    value: 3,
                    message: 'La ubicación debe tener al menos 3 caracteres',
                  },
                  maxLength: {
                    value: 100,
                    message: 'La ubicación no puede exceder los 100 caracteres',
                  },
                })}
                placeholder="Ingrese la ubicación del hotel (ciudad, país)"
              />
              <FormErrorMessage>
                {errors.location && errors.location.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isRequired isInvalid={errors.category}>
              <FormLabel>Categoría</FormLabel>
              <Select
                {...register('category', {
                  required: 'Debe seleccionar una categoría para el hotel',
                })}
              >
                <option value="">Selecciona una categoría</option>
                <option value="1 Estrella">1 Estrella</option>
                <option value="2 Estrellas">2 Estrellas</option>
                <option value="3 Estrellas">3 Estrellas</option>
                <option value="4 Estrellas">4 Estrellas</option>
                <option value="5 Estrellas">5 Estrellas</option>
              </Select>
              <FormErrorMessage>
                {errors.category && errors.category.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={errors.rangeOfPrices?.min || errors.rangeOfPrices?.max}>
              <FormLabel>Rango de Precios</FormLabel>
              <HStack>
                <Input
                  type="number"
                  placeholder="Precio mínimo"
                  {...register('rangeOfPrices.min', {
                    min: {
                      value: 0,
                      message: 'El precio mínimo no puede ser negativo',
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Solo se permiten números enteros',
                    },
                  })}
                />
                <Input
                  type="number"
                  placeholder="Precio máximo"
                  {...register('rangeOfPrices.max', {
                    min: {
                      value: 0,
                      message: 'El precio máximo no puede ser negativo',
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Solo se permiten números enteros',
                    },
                    validate: (value) => {
                      if (minPrice && value && Number(value) <= Number(minPrice)) {
                        return 'El precio máximo debe ser mayor que el mínimo';
                      }
                      return true;
                    },
                  })}
                />
              </HStack>
              <FormErrorMessage>
                {errors.rangeOfPrices?.min?.message || errors.rangeOfPrices?.max?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isRequired isInvalid={!selectedAdmin}>
              <FormLabel>Administrador</FormLabel>
              <AdminSearch
                onSelect={(admin) => {
                  setSelectedAdmin(admin);
                }}
                selectedAdmin={selectedAdmin}
              />
              <FormErrorMessage>
                {!selectedAdmin && 'Debe seleccionar un administrador para el hotel'}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isInvalid={errors.facilities}>
              <FormLabel>Instalaciones</FormLabel>
              <SimpleGrid columns={[2, 3, 4]} spacing={2}>
                {facilitiesOptions.map((facility) => (
                  <Checkbox
                    key={facility.value}
                    {...register('facilities')}
                    value={facility.value}
                  >
                    {facility.label}
                  </Checkbox>
                ))}
              </SimpleGrid>
              <FormErrorMessage>
                {errors.facilities && errors.facilities.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl >
              <FormLabel>Imágenes</FormLabel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    display="none"
                    id="image-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="image-upload"
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    variant="outline"
                    w="full"
                  >
                    Agregar Imágenes
                  </Button>
                </Box>

                {(existingImages.length > 0 || previewUrls.length > 0) && (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                    {existingImages.map((img, index) => (
                      <Box key={`existing-${index}`} position="relative">
                        <Image
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          borderRadius="lg"
                          objectFit="cover"
                          h="150px"
                          w="full"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => removeExistingImage(img)}
                        />
                      </Box>
                    ))}
                    {previewUrls.map((url, index) => (
                      <Box key={`new-${index}`} position="relative">
                        <Image
                          src={url}
                          alt={`Nueva imagen ${index + 1}`}
                          borderRadius="lg"
                          objectFit="cover"
                          h="150px"
                          w="full"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => removeNewImage(index)}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
              <FormErrorMessage>
                {existingImages.length + newImages.length === 0 && 'Debe agregar al menos una imagen del hotel'}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Button 
              colorScheme="teal" 
              type="submit" 
              w="full"
              isDisabled={Object.keys(errors).length > 0 || !selectedAdmin || existingImages.length + newImages.length === 0}
            >
              {isEdit ? 'Actualizar Hotel' : 'Crear Hotel'}
            </Button>
          </GridItem>
        </Grid>
      </Box>
    );
  };


  
export default HotelForm;
  