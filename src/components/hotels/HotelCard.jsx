/* eslint-disable react/prop-types */
import { 
  Box, 
  Image, 
  Heading, 
  Text, 
  Flex, 
  Badge, 
  Button, 
  HStack, 
  Icon, 
  useColorModeValue
} from '@chakra-ui/react'
import { FiStar, FiMapPin } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../shared/context/SearchContext'

function HotelCard({ hotel }) {
  const navigate = useNavigate()
  const { searchParams } = useSearch()
  const {
    uid,
    name,
    location,
    rangeOfPrices,
    category,
    images,
    rooms,
    bestSeller
  } = hotel

  const rating = parseInt(category)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const hotelId = uid || hotel._id

  // Calcular precio mínimo exacto (la habitación más barata real del hotel)
  const roomPrices = Array.isArray(rooms) 
    ? rooms.map(r => (typeof r === 'object' ? (r.price_per_night ?? r.price) : null)).filter(p => typeof p === 'number' && p > 0)
    : []
  const minPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : (rangeOfPrices?.min || 0)
  const maxPrice = roomPrices.length > 0 ? Math.max(...roomPrices) : (rangeOfPrices?.max || minPrice)
  
  const handleReserve = () => {
    const params = new URLSearchParams()
    if (searchParams.destination) params.set('destination', searchParams.destination)
    if (searchParams.checkIn) params.set('checkIn', searchParams.checkIn)
    if (searchParams.checkOut) params.set('checkOut', searchParams.checkOut)
    if (searchParams.guests) params.set('guests', searchParams.guests)

    const searchString = params.toString()
    navigate(`/hotels/${hotelId}${searchString ? `?${searchString}` : ''}`)
  }
  
  return (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      bg={cardBg} 
      boxShadow="md" 
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-4px)', 
        boxShadow: 'lg' 
      }}
    >
      <Box position="relative">
        <Image 
          src={images[0]} 
          alt={name} 
          h="200px" 
          w="100%" 
          objectFit="cover" 
        />
        
        {bestSeller && (
          <Badge 
            position="absolute" 
            top={3} 
            left={3} 
            bg="accent.500" 
            color="white" 
            fontSize="xs" 
            fontWeight="medium" 
            px={2} 
            py={1} 
            borderRadius="full"
          >
            Best Seller
          </Badge>
        )}
        
        <Flex 
          position="absolute" 
          bottom={3} 
          right={3} 
          bg="white" 
          color="accent.500" 
          p={1} 
          borderRadius="md" 
          alignItems="center" 
          boxShadow="sm"
        >
          <Icon as={FiStar} mr={1} />
          <Text fontWeight="bold" fontSize="sm">
            {rating}
          </Text>
        </Flex>
      </Box>
      
      <Box p={4}>
        <Heading 
          fontSize="lg" 
          fontWeight="bold" 
          isTruncated 
          mb={1}
        >
          {name}
        </Heading>
        
        <Flex align="center" mb={2}>
          <Icon as={FiMapPin} color="gray.500" fontSize="sm" mr={1} />
          <Text color="gray.500" fontSize="sm">
            {location}
          </Text>
        </Flex>
        
        <HStack spacing={2} mb={3}>
          <Text fontSize="xs" color="gray.500">{rooms.length} habitaciones</Text>
        </HStack>
        
        <Flex justify="space-between" align="center" mt={3}>
          <Box>
            <Text fontSize="xs" color="gray.500">
              Desde
            </Text>
            <Flex align="baseline">
              <Text fontSize="xl" fontWeight="black" color="brand.500">
                Q {minPrice.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.500" ml={1}>
                /noche
              </Text>
            </Flex>
          </Box>
          
          <Button 
            onClick={handleReserve}
            size="sm" 
            colorScheme="teal" 
            variant="outline"
          >
            Reservar
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default HotelCard