import { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex, 
  Button, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Badge, 
  Image, 
  Grid, 
  GridItem, 
  VStack, 
  HStack, 
  Icon, 
  Divider, 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  useToast,
  Stack,
  FormControl,
  FormLabel,
  Select,
  CheckboxGroup,
  Checkbox
} from '@chakra-ui/react'
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiUserCheck, 
  FiEdit, 
  FiXCircle,
  FiList,
  FiDownload
} from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { useReservation } from '../shared/hooks/useReservation'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import es from 'date-fns/locale/es'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import InvoiceTemplate from '../components/admin/invoices/InvoiceTemplate'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

function BookingCard({ booking, onReservationUpdate }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isServicesOpen, onOpen: onServicesOpen, onClose: onServicesClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure()
  const { editReservation, deleteReservation } = useReservation()
  const toast = useToast()
  const componentRef = useRef()
  
  const [editData, setEditData] = useState({
    checkInDate: new Date(booking.checkInDate),
    checkOutDate: new Date(booking.checkOutDate),
    guests: booking.guests,
    services: booking.services?.map(service => ({
      service: service.service._id,
      quantity: service.quantity
    })) || []
  })

  const getDisabledDates = () => {
    if (!booking.room?.nonAvailability) return [];
    
    return booking.room.nonAvailability.flatMap(period => {
      const start = dayjs(period.start);
      const end = dayjs(period.end);
      const dates = [];
      let current = start;
      
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        dates.push(new Date(current));
        current = current.add(1, 'day');
      }
      
      return dates;
    });
  };

  const calculateNights = () => {
    if (!editData.checkInDate || !editData.checkOutDate) return 0;
    const checkIn = dayjs(editData.checkInDate);
    const checkOut = dayjs(editData.checkOutDate);
    return checkOut.diff(checkIn, 'day');
  }

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setEditData(prev => ({
      ...prev,
      checkInDate: start,
      checkOutDate: end
    }));
  };

  const handleGuestsChange = (e) => {
    setEditData(prev => ({
      ...prev,
      guests: e.target.value
    }));
  };

  const handleServicesChange = (selectedServices) => {
    setEditData(prev => ({
      ...prev,
      services: selectedServices.map(serviceId => ({
        service: serviceId,
        quantity: 1
      }))
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const reservationData = {
        checkInDate: editData.checkInDate.toISOString(),
        checkOutDate: editData.checkOutDate.toISOString(),
        guests: editData.guests,
        services: editData.services
      };

      await editReservation(booking._id, reservationData);
      onReservationUpdate();
      onEditClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.msg || 'No se pudo actualizar tu reserva',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkIn = new Date(booking.checkInDate)
  const checkOut = new Date(booking.checkOutDate)
  const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  
  const getStatusBadge = () => {
    switch(booking.status) {
      case 'active':
        return <Badge colorScheme="green">Activa</Badge>
      case 'completed':
        return <Badge colorScheme="blue">Completada</Badge>
      case 'cancelled':
        return <Badge colorScheme="red">Cancelada</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }
  
  const [isCancelling, setIsCancelling] = useState(false)
  
  const handleCancelBooking = () => {
    deleteReservation(booking._id)
    onReservationUpdate();
    onClose()
  }

  const generatePDF = async () => {
    if (!componentRef.current) return;

    try {
      // Transformar los datos de la reserva al formato esperado por InvoiceTemplate
      const invoiceData = {
        _id: booking._id,
        Date: new Date().toISOString(),
        reservation: {
          user: {
            nombre: booking.user?.nombre || 'Usuario',
            email: booking.user?.email || 'email@ejemplo.com',
            _id: booking.user?._id || booking._id
          },
          hotel: {
            name: booking.hotel?.name || 'Hotel',
            direction: booking.hotel?.direction || 'Dirección del hotel',
            location: booking.hotel?.location || 'Ubicación del hotel',
            category: booking.hotel?.category || 'Categoría'
          },
          room: {
            type: booking.room?.type || 'Tipo de habitación',
            capacity: booking.room?.capacity || 2
          },
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status
        },
        nights: Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
        roomPricePerNight: booking.room?.price_per_night || 0,
        roomTotal: (booking.room?.price_per_night || 0) * Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
        services: booking.services?.map(service => ({
          name: service.service?.name || 'Servicio',
          price: service.service?.price || 0,
          total: (service.service?.price || 0) * (service.quantity || 1)
        })) || [],
        total_pagar: (booking.room?.price_per_night || 0) * Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)) + 
          (booking.services?.reduce((total, service) => total + ((service.service?.price || 0) * (service.quantity || 1)), 0) || 0)
      };

      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Factura-Reserva-${booking._id.slice(-8)}.pdf`);
      
      onInvoiceClose();
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF de la factura",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateTotal = () => {
    const roomTotal = (booking.room?.price_per_night || 0) * nights;
    const servicesTotal = booking.services?.reduce((total, service) => {
      const servicePrice = service.service?.price || 0;
      const quantity = service.quantity || 1;
      return total + (servicePrice * quantity);
    }, 0) || 0;
    return roomTotal + servicesTotal;
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      boxShadow="sm"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'md'
      }}
    >
      <Grid templateColumns={{ base: '1fr', md: '250px 1fr' }}>
        <GridItem>
          <Image 
            src={booking.hotel.images[0]} 
            alt={booking.hotel.name} 
            h="100%" 
            w="100%" 
            objectFit="cover" 
          />
        </GridItem>
        
        <GridItem p={5}>
          <Flex 
            justify="space-between" 
            align={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            mb={3}
          >
            <Box>
              <Heading as="h3" fontSize="lg" mb={1}>
                {booking.hotel.name}
              </Heading>
              
              <Flex align="center" mb={2}>
                <Icon as={FiMapPin} color="gray.500" mr={1} />
                <Text fontSize="sm" color="gray.600">
                  {booking.hotel.location}
                </Text>
              </Flex>
            </Box>
            
            {getStatusBadge()}
          </Flex>
          
          <Divider my={3} />
          
          <Grid 
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={4}
            mb={4}
          >
            <VStack align="flex-start" spacing={1}>
              <Text fontWeight="medium" fontSize="sm" color="gray.500">
                Tipo de Habitación
              </Text>
              <Text fontWeight="medium">
                {booking.room.type}
              </Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <Icon as={FiCalendar} color="gray.500" size="sm" />
                <Text fontWeight="medium" fontSize="sm" color="gray.500">
                  Check-in
                </Text>
              </HStack>
              <Text fontWeight="medium">
                {formatDate(booking.checkInDate)}
              </Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1}>
              <HStack>
                <Icon as={FiCalendar} color="gray.500" size="sm" />
                <Text fontWeight="medium" fontSize="sm" color="gray.500">
                  Check-out
                </Text>
              </HStack>
              <Text fontWeight="medium">
                {formatDate(booking.checkOutDate)}
              </Text>
            </VStack>
          </Grid>
          
          <HStack spacing={3} mt={2} wrap="wrap">
            <Flex align="center">
              <Icon as={FiClock} color="gray.500" mr={2} />
              <Text fontSize="sm">
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </Text>
            </Flex>
            
            <Flex align="center">
              <Icon as={FiUserCheck} color="gray.500" mr={2} />
              <Text fontSize="sm">
                {booking.guests} Huéspedes
              </Text>
            </Flex>
          </HStack>
          
          <Divider my={3} />
          
          <Flex 
            justify="space-between" 
            align={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">
                Total: ${calculateTotal()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Habitación: ${booking.room?.price_per_night * nights}
                {booking.services?.length > 0 && ` + Servicios: $${booking.services?.reduce((total, service) => {
                  const servicePrice = service.service?.price || 0;
                  const quantity = service.quantity || 1;
                  return total + (servicePrice * quantity);
                }, 0)}`}
              </Text>
            </VStack>
            
            <HStack spacing={3} mt={{ base: 3, md: 0 }}>
              <Button
                size="sm"
                leftIcon={<FiList />}
                variant="outline"
                colorScheme="purple"
                onClick={onServicesOpen}
              >
                Servicios
              </Button>
              {booking.status === 'active' && (
                <>
                  <Button 
                    size="sm" 
                    leftIcon={<FiEdit />} 
                    variant="outline" 
                    colorScheme="teal"
                    onClick={onEditOpen}
                  >
                    Modificar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    leftIcon={<FiXCircle />} 
                    colorScheme="red" 
                    variant="outline"
                    onClick={onOpen}
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {booking.status === 'completed' && (
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  variant="outline"
                  colorScheme="blue"
                  onClick={onInvoiceOpen}
                >
                  Descargar Factura
                </Button>
              )}
            </HStack>
          </Flex>
        </GridItem>
      </Grid>
      
      {/* Modal de Servicios Adicionales */}
      <Modal isOpen={isServicesOpen} onClose={onServicesClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Servicios Adicionales</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {booking.services && booking.services.length > 0 ? (
              <VStack align="start" spacing={4}>
                {booking.services.map((service) => (
                  <Box key={service._id} w="100%" p={3} borderWidth="1px" borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{service.service.name}</Text>
                        <Text fontSize="sm" color="gray.600">{service.service.description}</Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="medium">${service.service.price} c/u</Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">No hay servicios adicionales para esta reserva.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onServicesClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modificar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={6}>
                {/* Fechas */}
                <FormControl isRequired>
                  <FormLabel>Selecciona tus fechas</FormLabel>
                  <Box>
                    <DatePicker
                      selected={editData.checkInDate}
                      onChange={handleDateChange}
                      startDate={editData.checkInDate}
                      endDate={editData.checkOutDate}
                      selectsRange
                      inline
                      minDate={new Date()}
                      excludeDates={getDisabledDates()}
                      monthsShown={2}
                      locale={es}
                      dateFormat="dd/MM/yyyy"
                      showPopperArrow={false}
                      calendarStartDay={1}
                    />
                  </Box>
                </FormControl>
                
                {/* Huéspedes */}
                <FormControl isRequired>
                  <FormLabel>Número de Huéspedes</FormLabel>
                  <Select
                    name="guests"
                    value={editData.guests}
                    onChange={handleGuestsChange}
                  >
                    {[...Array(booking.room?.capacity || 0)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              
                {/* Servicios Adicionales */}
                <FormControl>
                  <FormLabel>Servicios Adicionales</FormLabel>
                  <CheckboxGroup 
                    colorScheme="teal" 
                    onChange={handleServicesChange}
                    defaultValue={editData.services.map(s => s.service)}
                  >
                    <Stack spacing={2}>
                      {booking.hotel?.services?.map(service => (
                        <Checkbox 
                          key={service._id} 
                          value={service._id}
                          isChecked={editData.services.some(s => s.service === service._id)}
                        >
                          {service.name} - ${service.price}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                {/* Resumen de la Reserva */}
                <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <VStack spacing={4} align="stretch">
                    <Heading size="sm">Resumen de la Reserva</Heading>
                    
                    <HStack justify="space-between">
                      <Text>Precio por noche</Text>
                      <Text>${booking.room.price_per_night}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Noches</Text>
                      <Text>{calculateNights()}</Text>
                    </HStack>
                    
                    {editData.services.length > 0 && (
                      <>
                        <Divider />
                        <Text fontWeight="medium">Servicios Adicionales:</Text>
                        {editData.services.map(({ service: serviceId }) => {
                          const service = booking.hotel?.services?.find(s => s._id === serviceId);
                          return (
                            <HStack key={serviceId} justify="space-between">
                              <Text fontSize="sm">{service?.name}</Text>
                              <Text fontSize="sm">${service?.price}</Text>
                            </HStack>
                          );
                        })}
                      </>
                    )}
                    
                    <Divider />
                    <HStack justify="space-between" fontWeight="bold">
                      <Text>Total</Text>
                      <Text color="teal.500">
                        ${calculateNights() * (booking.room.price_per_night || 0) + 
                          editData.services.reduce((total, { service: serviceId }) => {
                            const service = booking.hotel?.services?.find(s => s._id === serviceId);
                            return total + (service?.price || 0);
                          }, 0)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Stack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancelar
            </Button>
            <Button colorScheme="teal" onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmación de Cancelación */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancelar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Estás seguro que deseas cancelar tu reserva en <b>{booking.hotel.name}</b> para <b>{formatDate(booking.checkInDate)}</b>?
            </Text>
            {checkIn <= new Date() && (
              <Text mt={4} color="red.500">
                Ten en cuenta que esta reserva está dentro del período de cancelación de 24 horas y puede estar sujeta a cargos.
              </Text>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Mantener Reserva
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleCancelBooking}
              isLoading={isCancelling}
              loadingText="Cancelando"
            >
              Sí, Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Factura */}
      <Modal isOpen={isInvoiceOpen} onClose={onInvoiceClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vista Previa de Factura</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {(() => {
              const invoiceData = {
                _id: booking._id,
                Date: new Date().toISOString(),
                reservation: {
                  user: {
                    nombre: booking.user?.nombre || 'Usuario',
                    email: booking.user?.email || 'email@ejemplo.com',
                    _id: booking.user?._id || booking._id
                  },
                  hotel: {
                    name: booking.hotel?.name || 'Hotel',
                    direction: booking.hotel?.direction || 'Dirección del hotel',
                    location: booking.hotel?.location || 'Ubicación del hotel',
                    category: booking.hotel?.category || 'Categoría'
                  },
                  room: {
                    type: booking.room?.type || 'Tipo de habitación',
                    capacity: booking.room?.capacity || 2
                  },
                  checkInDate: booking.checkInDate,
                  checkOutDate: booking.checkOutDate,
                  status: booking.status
                },
                nights: Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
                roomPricePerNight: booking.room?.price_per_night || 0,
                roomTotal: (booking.room?.price_per_night || 0) * Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)),
                services: booking.services?.map(service => ({
                  name: service.service?.name || 'Servicio',
                  price: service.service?.price || 0,
                  total: (service.service?.price || 0) * (service.quantity || 1)
                })) || [],
                total_pagar: (booking.room?.price_per_night || 0) * Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)) + 
                  (booking.services?.reduce((total, service) => total + ((service.service?.price || 0) * (service.quantity || 1)), 0) || 0)
              };
              return <InvoiceTemplate ref={componentRef} data={invoiceData} />;
            })()}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={generatePDF}>
              Descargar PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

function MyBookings() {
  const [reservations, setReservations] = useState([])
  const { getReservationsByUser } = useReservation()
  const fetchReservations = async () => {
    const response = await getReservationsByUser()
    setReservations(Array.isArray(response) ? response : [])
  }
  
  useEffect(() => {
    fetchReservations()
  }, [])

  const safeReservations = Array.isArray(reservations) ? reservations : []
  const activeBookings = safeReservations.filter(booking => booking.status === 'active')
  const completedBookings = safeReservations.filter(booking => booking.status === 'completed')
  const cancelledBookings = safeReservations.filter(booking => booking.status === 'cancelled')
  
  return (
    <Box pt={24} pb={16}>
      <Container maxW="1200px">
        <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} mb={2}>
          Mis Reservas
        </Heading>
        
        <Text color="gray.600" mb={8}>
          Gestiona tus estancias activas y revisa tus reservas anteriores
        </Text>
        
        <Tabs colorScheme="teal" isLazy>
          <TabList mb={6}>
            <Tab fontWeight="medium">Activas ({activeBookings.length})</Tab>
            <Tab fontWeight="medium">Completadas ({completedBookings.length})</Tab>
            <Tab fontWeight="medium">Canceladas ({cancelledBookings.length})</Tab>
          </TabList>
          
          <TabPanels>
            {/* Active Bookings */}
            <TabPanel px={0}>
              {activeBookings.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Heading as="h3" fontSize="lg" mb={4}>
                    No hay reservas activas
                  </Heading>
                  <Text color="gray.600" mb={6}>
                    No tienes ninguna estancia activa. ¿Listo para planear tu próximo viaje?
                  </Text>
                  <Button 
                    as={RouterLink} 
                    to="/hotels"
                    colorScheme="teal"
                  >
                    Buscar Hoteles
                  </Button>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {activeBookings.map(booking => (
                    <BookingCard 
                      key={booking.uid || booking._id || booking.id} 
                      booking={booking} 
                      onReservationUpdate={fetchReservations}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>
            
            {/* Completed Bookings */}
            <TabPanel px={0}>
              {completedBookings.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Heading as="h3" fontSize="lg" mb={4}>
                    No hay reservas completadas
                  </Heading>
                  <Text color="gray.600" mb={6}>
                    Aún no tienes estancias completadas.
                  </Text>
                  <Button 
                    as={RouterLink} 
                    to="/hotels"
                    colorScheme="teal"
                  >
                    Buscar Hoteles
                  </Button>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {completedBookings.map(booking => (
                    <BookingCard 
                      key={booking.uid || booking._id || booking.id} 
                      booking={booking} 
                      onReservationUpdate={fetchReservations}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>
            
            {/* Cancelled Bookings */}
            <TabPanel px={0}>
              {cancelledBookings.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Heading as="h3" fontSize="lg" mb={4}>
                    No hay reservas canceladas
                  </Heading>
                  <Text color="gray.600">
                    No tienes reservas canceladas.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {cancelledBookings.map(booking => (
                    <BookingCard 
                      key={booking.uid || booking._id || booking.id} 
                      booking={booking} 
                      onReservationUpdate={fetchReservations}
                    />
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  )
}

export default MyBookings