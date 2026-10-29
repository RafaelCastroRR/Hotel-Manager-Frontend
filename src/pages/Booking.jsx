import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  Grid, 
  GridItem, 
  FormControl, 
  FormLabel, 
  Select, 
  Divider, 
  Icon, 
  VStack, 
  HStack, 
  useToast,
  Stack,
  Card,
  CardBody,
  Spinner,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  useBreakpointValue,
  Badge
} from '@chakra-ui/react'
import { FiUsers, FiClock, FiAlertCircle, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import useHotel from '../shared/hooks/useHotel'
import useAuthStore from '../shared/stores/authStore'
import { useReservation } from '../shared/hooks/useReservation'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import es from 'date-fns/locale/es'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

function Booking() {
  // Declaración estricta de TODOS los hooks al inicio del componente
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { getHotelById } = useHotel()
  const { isAuthenticated } = useAuthStore()
  const { saveReservation } = useReservation()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const monthsShown = useBreakpointValue({ base: 1, md: 2 }) || 1

  const [hotel, setHotel] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [bookingData, setBookingData] = useState({
    checkInDate: null,
    checkOutDate: null,
    guests: 1,
    services: []
  })

  // Inicialización segura de fechas por defecto
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(12, 0, 0, 0)
    
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(12, 0, 0, 0)

    let initialCheckIn = tomorrow
    let initialCheckOut = dayAfter
    let initialGuests = 1

    if (location.state) {
      const { checkIn, checkOut, guests } = location.state
      if (checkIn) {
        const d = new Date(checkIn)
        if (!isNaN(d.getTime())) initialCheckIn = d
      }
      if (checkOut) {
        const d = new Date(checkOut)
        if (!isNaN(d.getTime())) initialCheckOut = d
      }
      if (guests) {
        const g = parseInt(guests)
        if (!isNaN(g) && g > 0) initialGuests = g
      }
    }

    // Asegurar que checkOut sea posterior a checkIn
    if (initialCheckOut <= initialCheckIn) {
      const nextDay = new Date(initialCheckIn)
      nextDay.setDate(nextDay.getDate() + 1)
      initialCheckOut = nextDay
    }

    setBookingData(prev => ({
      ...prev,
      checkInDate: initialCheckIn,
      checkOutDate: initialCheckOut,
      guests: initialGuests
    }))
  }, [location.state])

  // Carga de hotel y habitación
  useEffect(() => {
    let isMounted = true
    const fetchHotel = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getHotelById(hotelId)
        
        if (!isMounted) return

        if (!response) {
          setError('No se pudo encontrar la información del hotel solicitado.')
          setLoading(false)
          return
        }

        setHotel(response)
        const rooms = response.rooms || []
        const matchedRoom = rooms.find(r => 
          String(r._id) === String(roomId) || 
          String(r.uid) === String(roomId)
        )

        if (matchedRoom) {
          setSelectedRoom(matchedRoom)
        } else if (rooms.length > 0) {
          setSelectedRoom(rooms[0])
        } else {
          setError('Este hotel no tiene habitaciones registradas actualmente.')
        }
      } catch (err) {
        console.error('Error al cargar información del hotel para reserva:', err)
        if (isMounted) setError('Error al conectar con el servidor para obtener la habitación.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchHotel()
    return () => { isMounted = false }
  }, [hotelId, roomId])

  const getDisabledDates = () => {
    if (!selectedRoom?.nonAvailability || !Array.isArray(selectedRoom.nonAvailability)) return []
    
    return selectedRoom.nonAvailability.flatMap(period => {
      if (!period?.start || !period?.end) return []
      const start = dayjs(period.start)
      const end = dayjs(period.end)
      const dates = []
      let current = start
      
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        dates.push(new Date(current.toDate()))
        current = current.add(1, 'day')
      }
      
      return dates
    })
  }

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1
    const checkIn = dayjs(bookingData.checkInDate)
    const checkOut = dayjs(bookingData.checkOutDate)
    const diff = checkOut.diff(checkIn, 'day')
    return diff > 0 ? diff : 1
  }

  const handleDateChange = (dates) => {
    const [start, end] = dates
    setBookingData(prev => ({
      ...prev,
      checkInDate: start,
      checkOutDate: end
    }))
  }

  const handleGuestsChange = (e) => {
    setBookingData(prev => ({
      ...prev,
      guests: parseInt(e.target.value) || 1
    }))
  }

  const handleServicesChange = (selectedServices) => {
    setBookingData(prev => ({
      ...prev,
      services: selectedServices.map(serviceId => ({
        service: serviceId
      }))
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast({
        title: 'Inicio de sesión requerido',
        description: 'Debes iniciar sesión con tu cuenta para completar tu reserva.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      })
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      toast({
        title: 'Selecciona las fechas',
        description: 'Por favor selecciona la fecha de entrada y salida para tu estadía.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      })
      return
    }

    try {
      setIsSubmitting(true)
      const hotelIdentifier = hotel?.uid || hotel?._id || hotelId
      const roomIdentifier = selectedRoom?._id || selectedRoom?.uid || roomId

      const res = await saveReservation({ 
        hotel: hotelIdentifier, 
        room: roomIdentifier,
        checkInDate: bookingData.checkInDate.toISOString(),
        checkOutDate: bookingData.checkOutDate.toISOString(),
        services: bookingData.services,
        guests: bookingData.guests
      })

      if (res && !res.error) {
        navigate('/my-bookings')
      }
    } catch (err) {
      console.error('Error al enviar la reserva:', err)
      toast({
        title: 'Error de reserva',
        description: 'No se pudo completar la reserva. Por favor intenta de nuevo.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estilos limpios para el calendario
  const customDatePickerStyles = {
    '.react-datepicker': {
      fontFamily: 'inherit',
      border: '1px solid',
      borderColor: 'gray.200',
      borderRadius: 'lg',
      boxShadow: 'sm',
      overflow: 'hidden',
      maxWidth: '100%',
    },
    '.react-datepicker__header': {
      bg: 'teal.500',
      borderBottom: 'none',
      color: 'white',
      py: 3,
    },
    '.react-datepicker__current-month': {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 'md',
      mb: 2,
    },
    '.react-datepicker__day-name': {
      color: 'white',
      fontWeight: 'semibold',
      width: { base: '2rem', sm: '2.4rem' },
    },
    '.react-datepicker__day': {
      width: { base: '2rem', sm: '2.4rem' },
      lineHeight: { base: '2rem', sm: '2.4rem' },
      borderRadius: 'md',
      m: 0.5,
      _hover: {
        bg: 'teal.100',
        color: 'teal.800',
      },
    },
    '.react-datepicker__day--selected, .react-datepicker__day--in-range': {
      bg: 'teal.500 !important',
      color: 'white !important',
      fontWeight: 'bold',
    },
    '.react-datepicker__day--range-start, .react-datepicker__day--range-end': {
      bg: 'teal.600 !important',
      color: 'white !important',
    },
    '.react-datepicker__day--disabled': {
      color: 'gray.300 !important',
      cursor: 'not-allowed',
      _hover: {
        bg: 'transparent !important',
      },
    },
  }

  // Renders condicionales (DESPUÉS de que todos los hooks han sido ejecutados arriba)
  if (loading) {
    return (
      <Box pt={24} pb={16}>
        <Container maxW="1200px">
          <Stack spacing={4} align="center" justify="center" minH="400px">
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text color="gray.600" fontSize="lg">Cargando detalles de tu reserva...</Text>
          </Stack>
        </Container>
      </Box>
    )
  }

  if (error || !hotel || !selectedRoom) {
    return (
      <Box pt={24} pb={16}>
        <Container maxW="1200px">
          <Stack spacing={5} align="center" justify="center" minH="400px" textAlign="center">
            <Icon as={FiAlertCircle} w={14} h={14} color="red.500" />
            <Heading size="md" color="red.600">
              {error || 'No se encontró la información del hotel o habitación.'}
            </Heading>
            <Text color="gray.600" maxW="500px">
              Es posible que la habitación ya no esté disponible o el enlace sea incorrecto.
            </Text>
            <Button colorScheme="teal" onClick={() => navigate('/hotels')} leftIcon={<FiArrowLeft />}>
              Volver al Catálogo de Hoteles
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  const roomPrice = selectedRoom.price_per_night ?? selectedRoom.price ?? 0
  const nights = calculateNights()
  const roomTotal = nights * roomPrice
  const servicesTotal = bookingData.services.reduce((total, { service: serviceId }) => {
    const service = hotel?.services?.find(s => String(s._id) === String(serviceId))
    return total + (service?.price || 0)
  }, 0)
  const grandTotal = roomTotal + servicesTotal
  const roomCapacity = Math.max(1, selectedRoom.capacity || 1)

  return (
    <Box pt={24} pb={16} bg="gray.50" minH="100vh">
      <Container maxW="1200px">
        <HStack mb={6} spacing={3}>
          <Button 
            variant="ghost" 
            size="sm" 
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate(`/hotels/${hotelId}`)}
          >
            Volver al Hotel
          </Button>
          <Badge colorScheme="teal" px={2} py={1} rounded="md">
            Paso Final de Reserva
          </Badge>
        </HStack>

        <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} mb={8}>
          Completar Reservación
        </Heading>

        <Grid templateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={8}>
          {/* Formulario de Reserva */}
          <GridItem>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm" rounded="lg">
              <CardBody p={{ base: 5, md: 8 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="md" mb={1}>Selecciona tus Fechas</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Elige la fecha de llegada y salida en el calendario
                      </Text>
                    </Box>

                    {/* Selector de Fechas */}
                    <FormControl>
                      <Box sx={customDatePickerStyles} overflowX="auto" pb={2}>
                        <DatePicker
                          selectsRange={true}
                          startDate={bookingData.checkInDate}
                          endDate={bookingData.checkOutDate}
                          onChange={handleDateChange}
                          minDate={new Date()}
                          excludeDates={getDisabledDates()}
                          inline
                          locale={es}
                          monthsShown={monthsShown}
                          dateFormat="dd/MM/yyyy"
                        />
                      </Box>
                    </FormControl>

                    {/* Selector de Huéspedes */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Número de Huéspedes</FormLabel>
                      <Select 
                        value={bookingData.guests}
                        onChange={handleGuestsChange}
                        rounded="md"
                        bg="white"
                      >
                        {[...Array(roomCapacity)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Huésped' : 'Huéspedes'} (Capacidad máx: {roomCapacity})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  
                    {/* Servicios Adicionales */}
                    {hotel?.services && hotel.services.length > 0 && (
                      <FormControl>
                        <FormLabel fontWeight="medium">Servicios Adicionales Disponibles</FormLabel>
                        <CheckboxGroup colorScheme="teal" onChange={handleServicesChange}>
                          <Stack spacing={2.5} bg="gray.50" p={4} rounded="md" borderWidth="1px" borderColor="gray.200">
                            {hotel.services.map(service => (
                              <Checkbox key={service._id} value={service._id}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontSize="sm" fontWeight="medium">{service.name}</Text>
                                  <Badge colorScheme="purple">Q {service.price}</Badge>
                                </HStack>
                              </Checkbox>
                            ))}
                          </Stack>
                        </CheckboxGroup>
                      </FormControl>
                    )}
                    
                    <Button 
                      type="submit" 
                      colorScheme="teal" 
                      size="lg"
                      isLoading={isSubmitting}
                      loadingText="Procesando tu reserva..."
                      rounded="md"
                    >
                      Confirmar Reserva
                    </Button>
                  </Stack>
                </form>
              </CardBody>
            </Card>
          </GridItem>
          
          {/* Resumen de la Reserva */}
          <GridItem>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} position={{ base: 'static', lg: 'sticky' }} top="100px" shadow="sm" rounded="lg">
              <CardBody p={{ base: 5, md: 6 }}>
                <VStack spacing={5} align="stretch">
                  <Heading size="md" color="gray.800">Resumen de la Estancia</Heading>
                  
                  {/* Información del Hotel */}
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color="teal.600">{hotel?.name}</Text>
                    <Text color="gray.600" fontSize="sm" mt={1}>{hotel?.direction || hotel?.location}</Text>
                  </Box>
                  
                  <Divider />
                  
                  {/* Información de la Habitación */}
                  <Box>
                    <Text fontWeight="semibold" fontSize="md" color="gray.800">{selectedRoom?.type}</Text>
                    <HStack spacing={4} mt={2}>
                      <HStack color="gray.600" fontSize="sm">
                        <Icon as={FiUsers} color="teal.500" />
                        <Text>{bookingData.guests} {bookingData.guests === 1 ? 'Huésped' : 'Huéspedes'}</Text>
                      </HStack>
                      <HStack color="gray.600" fontSize="sm">
                        <Icon as={FiClock} color="teal.500" />
                        <Text>{nights} {nights === 1 ? 'Noche' : 'Noches'}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Desglose de Precios */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.600">Precio por noche:</Text>
                      <Text fontSize="sm" fontWeight="medium">Q {roomPrice.toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.600">Total noches ({nights}):</Text>
                      <Text fontSize="sm" fontWeight="medium">Q {roomTotal.toLocaleString()}</Text>
                    </HStack>
                    
                    {bookingData.services.length > 0 && (
                      <>
                        <Divider my={2} />
                        <Text fontWeight="semibold" fontSize="xs" color="gray.500" textTransform="uppercase" mb={2}>
                          Servicios Adicionales:
                        </Text>
                        {bookingData.services.map(({ service: serviceId }) => {
                          const service = hotel?.services?.find(s => String(s._id) === String(serviceId))
                          return (
                            <HStack key={serviceId} justify="space-between" mb={1.5}>
                              <Text fontSize="sm" color="gray.600">{service?.name || 'Servicio'}</Text>
                              <Text fontSize="sm" fontWeight="medium">Q {(service?.price || 0).toLocaleString()}</Text>
                            </HStack>
                          )
                        })}
                      </>
                    )}
                    
                    <Divider my={3} />
                    
                    <HStack justify="space-between" pt={1}>
                      <Box>
                        <Text fontSize="md" fontWeight="bold">Total a Pagar</Text>
                        <Text fontSize="xs" color="gray.500">Impuestos de ley incluidos</Text>
                      </Box>
                      <Text fontSize="2xl" fontWeight="black" color="teal.600">
                        Q {grandTotal.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>

                  <Box bg="teal.50" p={3} rounded="md" borderWidth="1px" borderColor="teal.100">
                    <HStack align="flex-start" spacing={2}>
                      <Icon as={FiCheck} color="teal.500" mt={0.5} />
                      <Text fontSize="xs" color="teal.800">
                        Confirmación instantánea. Sin cargos ocultos en tu reserva con QuickStay Guatemala.
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default Booking