import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Flex, 
  Button, 
  Stack, 
  Badge,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon,
  IconButton,
  ModalHeader
} from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiMapPin, FiUsers, FiDollarSign, FiCheck, FiImage } from 'react-icons/fi'
import useHotel from '../shared/hooks/useHotel'
import SearchBar from '../components/common/SearchBar'
import { useSearch } from '../shared/context/SearchContext'

function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getHotelById } = useHotel()
  const { searchParams } = useSearch()
  const [hotel, setHotel] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isRoomGalleryOpen, onOpen: onRoomGalleryOpen, onClose: onRoomGalleryClose } = useDisclosure()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showAllImages, setShowAllImages] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState([])
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  useEffect(() => {
    let isMounted = true
    const fetchHotel = async () => {
      try {
        const response = await getHotelById(id)
        if (isMounted) {
          setHotel(response)
        }
      } catch (error) {
        console.error('Error al cargar el hotel:', error)
      }
    }
    fetchHotel()
    return () => { isMounted = false }
  }, [id])

  // Filtrar habitaciones cuando cambien los parámetros de búsqueda o el hotel
  useEffect(() => {
    if (hotel) {
      if (searchParams.checkIn && searchParams.checkOut) {
        const checkInDate = new Date(searchParams.checkIn)
        const checkOutDate = new Date(searchParams.checkOut)
        const guests = parseInt(searchParams.guests || '1')
        
        const availableRooms = (hotel.rooms || []).filter(room => {
          if (room.capacity < guests) return false
          if (!room.nonAvailability || room.nonAvailability.length === 0) return true
          
          return !room.nonAvailability.some(period => {
            const periodStart = new Date(period.start)
            const periodEnd = new Date(period.end)
            return (
              (checkInDate >= periodStart && checkInDate < periodEnd) ||
              (checkOutDate > periodStart && checkOutDate <= periodEnd) ||
              (checkInDate <= periodStart && checkOutDate >= periodEnd)
            )
          })
        })
        
        setFilteredRooms(availableRooms.length > 0 ? availableRooms : (hotel.rooms || []))
      } else {
        setFilteredRooms(hotel.rooms || [])
      }
    }
  }, [hotel, searchParams])
  
  if (!hotel) {
    return (
      <Box pt={24} pb={16}>
        <Container maxW="1200px">
          <Text fontSize="lg" color="gray.600">Cargando detalles del hotel...</Text>
        </Container>
      </Box>
    )
  }
  
  const hotelImages = hotel.images || []
  const displayedImages = showAllImages ? hotelImages : hotelImages.slice(0, 5)
  const remainingImages = Math.max(0, hotelImages.length - 5)
  
  const handleRoomSelect = (room) => {
    const hotelIdentifier = hotel.uid || hotel._id || id
    const roomIdentifier = room._id || room.uid
    navigate(`/booking/${hotelIdentifier}/${roomIdentifier}`, {
      state: {
        checkIn: searchParams.checkIn || null,
        checkOut: searchParams.checkOut || null,
        guests: searchParams.guests || 1
      }
    })
  }

  const handleRoomGalleryOpen = (room) => {
    setSelectedRoom(room)
    onRoomGalleryOpen()
  }
  
  return (
    <Box pt={20} pb={16}>
      {/* Barra de búsqueda */}
      <Box bg="gray.50" py={8} mb={8}>
        <Container maxW="1200px">
          <Box 
            bg="white" 
            p={5} 
            borderRadius="lg" 
            boxShadow="sm"
          >
            <SearchBar />
          </Box>
        </Container>
      </Box>

      <Container maxW="1200px">
        {/* Hotel Header */}
        <Box mb={8}>
          <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} mb={2}>
            {hotel.name}
          </Heading>
          <Flex align="center" gap={2} mb={4}>
            <Badge colorScheme="teal" fontSize="sm">
              {hotel.category}
            </Badge>
            <Text color="gray.600" fontSize="sm">
              <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
              {hotel.location} - {hotel.direction}
            </Text>
          </Flex>
        </Box>

        {/* Image Gallery */}
        {hotelImages.length > 0 && (
          <Box mb={8}>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Box 
                gridColumn={{ base: '1', md: 'span 2' }} 
                gridRow={{ base: '1', md: 'span 2' }}
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                onClick={onOpen}
              >
                <Image 
                  src={hotelImages[0]} 
                  alt={hotel.name}
                  w="full"
                  h="400px"
                  objectFit="cover"
                />
              </Box>
              {displayedImages.slice(1, 5).map((image, index) => (
                <Box 
                  key={index} 
                  borderRadius="lg" 
                  overflow="hidden"
                  cursor="pointer"
                  onClick={onOpen}
                  position="relative"
                >
                  <Image 
                    src={image} 
                    alt={`${hotel.name} - Imagen ${index + 2}`}
                    w="full"
                    h="190px"
                    objectFit="cover"
                  />
                  {index === 3 && remainingImages > 0 && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="blackAlpha.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="xl"
                      fontWeight="bold"
                    >
                      +{remainingImages} fotos
                    </Box>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          {/* Main Content */}
          <Box flex="1">
            {/* Description */}
            <Box mb={8}>
              <Heading as="h2" fontSize="xl" mb={4}>
                Descripción
              </Heading>
              <Text color="gray.600" lineHeight="tall">
                {hotel.description}
              </Text>
            </Box>

            {/* Facilities */}
            {hotel.facilities && hotel.facilities.length > 0 && (
              <Box mb={8}>
                <Heading as="h2" fontSize="xl" mb={4}>
                  Servicios e Instalaciones
                </Heading>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                  {hotel.facilities.map((facility, index) => (
                    <Flex key={index} align="center" gap={2}>
                      <FiCheck color="teal" />
                      <Text>{facility}</Text>
                    </Flex>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Services */}
            {hotel.services && hotel.services.length > 0 && (
              <Box mb={8}>
                <Heading as="h2" fontSize="xl" mb={4}>
                  Servicios Adicionales del Hotel
                </Heading>
                <List spacing={3}>
                  {hotel.services.map((service) => (
                    <ListItem key={service._id}>
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={2}>
                          <ListIcon as={FiCheck} color="teal.500" />
                          <Box>
                            <Text fontWeight="medium">{service.name}</Text>
                            <Text fontSize="sm" color="gray.600">{service.description}</Text>
                          </Box>
                        </Flex>
                        <Badge colorScheme="purple">Q {service.price}</Badge>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Rooms */}
            <Box mb={8}>
              <Heading as="h2" fontSize="xl" mb={4}>
                Habitaciones Disponibles
              </Heading>
              {filteredRooms.length === 0 ? (
                <Text color="gray.600">
                  No hay habitaciones disponibles para los criterios seleccionados.
                </Text>
              ) : (
                <Stack spacing={4}>
                  {filteredRooms.map((room) => (
                    <Box 
                      key={room._id || room.uid}
                      p={5} 
                      bg={bgColor} 
                      borderRadius="lg" 
                      borderWidth="1px"
                      borderColor={borderColor}
                      _hover={{ borderColor: 'teal.500', shadow: 'sm' }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading as="h4" fontSize="lg">
                          {room.type}
                        </Heading>
                        <Badge colorScheme="green">
                          Disponible
                        </Badge>
                      </Flex>
                      <Stack spacing={2} mb={4}>
                        <Flex align="center" gap={2}>
                          <FiUsers />
                          <Text>Capacidad: {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}</Text>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <FiDollarSign />
                          <Text fontWeight="semibold" color="teal.600">
                            Precio por noche: Q {(room.price_per_night ?? room.price ?? 0).toLocaleString()}
                          </Text>
                        </Flex>
                      </Stack>
                      <Flex gap={2}>
                        <Button 
                          colorScheme="teal" 
                          onClick={() => handleRoomSelect(room)}
                          flex="1"
                        >
                          Reservar
                        </Button>
                        {room.images && room.images.length > 0 && (
                          <IconButton
                            aria-label="Ver galería"
                            icon={<FiImage />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleRoomGalleryOpen(room)}
                          />
                        )}
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
          
          {/* Sidebar */}
          <Box w={{ base: 'full', lg: '300px' }} flexShrink={0}>
            <Box 
              p={6} 
              bg={bgColor} 
              borderRadius="lg" 
              borderWidth="1px"
              borderColor={borderColor}
              position="sticky"
              top="100px"
              shadow="sm"
            >
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="medium" mb={1} color="gray.600">
                    Rango de Tarifas
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                    Q {hotel.rangeOfPrices?.min || 0} - Q {hotel.rangeOfPrices?.max || 0}
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="medium" mb={2} color="gray.600">
                    Disponibilidad
                  </Text>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">Habitaciones Libres:</Text>
                    <Badge colorScheme="green" fontSize="sm" px={2.5} py={0.5} rounded="md">
                      {hotel.availableRooms ?? 0} libres
                    </Badge>
                  </Flex>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Flex>
      </Container>
      
      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} p={4}>
              {hotelImages.map((image, index) => (
                <Box 
                  key={index} 
                  borderRadius="lg" 
                  overflow="hidden"
                >
                  <Image 
                    src={image} 
                    alt={`${hotel.name} - Imagen ${index + 1}`}
                    w="full"
                    h="300px"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de galería de habitación */}
      <Modal isOpen={isRoomGalleryOpen} onClose={onRoomGalleryClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Galería de Imágenes - {selectedRoom?.type}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} p={4}>
              {selectedRoom?.images?.map((image, index) => (
                <Box 
                  key={index} 
                  borderRadius="lg" 
                  overflow="hidden"
                >
                  <Image 
                    src={image} 
                    alt={`Habitación ${selectedRoom?.type} - Imagen ${index + 1}`}
                    w="full"
                    h="300px"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default HotelDetail