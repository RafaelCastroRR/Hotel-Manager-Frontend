import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Flex, 
  Select, 
  Button, 
  HStack, 
  Stack, 
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  useColorModeValue,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import HotelCard from '../components/hotels/HotelCard'
import SearchBar from '../components/common/SearchBar'
import useHotel from '../shared/hooks/useHotel'
import { useSearch } from '../shared/context/SearchContext'

const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const AVAILABLE_FACILITIES = [
  'Wifi',
  'Piscina',
  'Estacionamiento',
  'Parking Privado',
  'Recepción 24h',
  'Aire Acondicionado',
  'Calefacción',
  'Gimnasio',
  'Spa',
  'Restaurante',
  'Bar',
  'Terraza',
  'Jardín',
  'Salas de Reuniones',
  'Servicio de Limpieza',
  'Servicio de Lavandería',
  'Servicio de Concierge',
  'Habitaciones Privadas'
]

function Hotels() {
  const { getHotels } = useHotel()
  const { searchParams, updateSearch } = useSearch()
  const [hotels, setHotels] = useState([])
  const [filteredHotels, setFilteredHotels] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 3000],
    category: '',
    facilities: []
  })
  const [sortBy, setSortBy] = useState('')
  const filterBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    const fetchHotels = async () => {
      const response = await getHotels()
      setHotels(response || [])
      setFilteredHotels(response || [])
    }
    fetchHotels()
  }, [])
  
  // Aplicar filtros de forma reactiva y precisa
  useEffect(() => {
    let result = [...hotels]
    
    // 1. Filtrar por destino / nombre / dirección / categoría / facilidades (insensible a tildes y mayúsculas)
    if (searchParams.destination) {
      const target = normalizeText(searchParams.destination)
      result = result.filter(hotel => {
        const nameMatch = normalizeText(hotel.name).includes(target)
        const locationMatch = normalizeText(hotel.location).includes(target)
        const directionMatch = normalizeText(hotel.direction).includes(target)
        const categoryMatch = normalizeText(hotel.category).includes(target)
        const facilitiesMatch = Array.isArray(hotel.facilities) && hotel.facilities.some(f => normalizeText(f).includes(target))
        return nameMatch || locationMatch || directionMatch || categoryMatch || facilitiesMatch
      })
    }

    // 2. Filtrar por disponibilidad de fechas (si se especifican entrada y salida)
    if (searchParams.checkIn && searchParams.checkOut) {
      const checkInDate = new Date(searchParams.checkIn)
      const checkOutDate = new Date(searchParams.checkOut)
      const guests = parseInt(searchParams.guests || '1')
      
      const dateFiltered = result.filter(hotel => {
        if (!hotel.rooms || hotel.rooms.length === 0) return true
        return hotel.rooms.some(room => {
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
      })

      if (dateFiltered.length > 0) {
        result = dateFiltered
      }
    }

    // 3. Filtrar por rango de precios
    result = result.filter(hotel => {
      const minPrice = hotel.rangeOfPrices?.min ?? 0
      const maxPrice = hotel.rangeOfPrices?.max ?? (minPrice || 9999)
      return minPrice <= filters.priceRange[1] && maxPrice >= filters.priceRange[0]
    })

    // 4. Filtrar por categoría
    if (filters.category) {
      result = result.filter(hotel => 
        normalizeText(hotel.category) === normalizeText(filters.category)
      )
    }

    // 5. Filtrar por instalaciones (todas las seleccionadas deben estar presentes en el hotel)
    if (filters.facilities.length > 0) {
      result = result.filter(hotel => {
        if (!Array.isArray(hotel.facilities)) return false
        const hotelFacs = hotel.facilities.map(normalizeText)
        return filters.facilities.every(fac => {
          const normFac = normalizeText(fac)
          return hotelFacs.some(hf => hf === normFac || hf.includes(normFac) || normFac.includes(hf))
        })
      })
    }

    // 6. Ordenamiento
    if (sortBy) {
      switch (sortBy) {
        case 'priceAsc':
          result.sort((a, b) => (a.rangeOfPrices?.min || 0) - (b.rangeOfPrices?.min || 0))
          break
        case 'priceDesc':
          result.sort((a, b) => (b.rangeOfPrices?.max || 0) - (a.rangeOfPrices?.max || 0))
          break
        case 'ratingDesc':
          result.sort((a, b) => parseInt(b.category || 0) - parseInt(a.category || 0))
          break
        case 'nameAsc':
          result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          break
        default:
          break
      }
    }
    
    setFilteredHotels(result)
  }, [hotels, searchParams, filters, sortBy])
  
  const handlePriceChange = (values) => {
    setFilters(prev => ({
      ...prev,
      priceRange: values
    }))
  }
  
  const handleCategoryChange = (e) => {
    setFilters(prev => ({
      ...prev,
      category: e.target.value
    }))
  }
  
  const handleFacilityToggle = (facilityName) => {
    setFilters(prev => {
      const exists = prev.facilities.includes(facilityName)
      const updated = exists 
        ? prev.facilities.filter(item => item !== facilityName)
        : [...prev.facilities, facilityName]
      return {
        ...prev,
        facilities: updated
      }
    })
  }
  
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 3000],
      category: '',
      facilities: []
    })
    setSortBy('')
  }

  const clearDestination = () => {
    updateSearch({
      ...searchParams,
      destination: ''
    })
  }

  const hasActiveFilters = filters.category !== '' || 
    filters.facilities.length > 0 || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 3000 ||
    sortBy !== '' ||
    Boolean(searchParams.destination)
  
  return (
    <Box pt={20} pb={16}>
      <Box bg="gray.50" py={8} mb={8}>
        <Container maxW="1200px">
          <Heading 
            as="h1" 
            fontSize={{ base: '2xl', md: '3xl' }} 
            mb={6}
          >
            Encuentra Tu Hotel Perfecto en Guatemala
          </Heading>
          
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
        {/* Botón para mostrar/ocultar filtros en móviles */}
        <Button
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          colorScheme="teal"
          variant="outline"
          w="full"
          mb={4}
        >
          {showMobileFilters ? 'Ocultar Filtros' : 'Filtrar Hoteles (Precios, Categoría, Servicios)'}
        </Button>

        <Flex 
          flexDirection={{ base: 'column', md: 'row' }} 
          gap={8}
        >
          {/* Barra lateral de Filtros */}
          <Box 
            w={{ base: '100%', md: '300px' }} 
            flexShrink={0}
            display={{ base: showMobileFilters ? 'block' : 'none', md: 'block' }}
          >
            <Box 
              p={5} 
              borderRadius="lg" 
              bg={filterBg} 
              boxShadow="sm" 
              mb={4}
              border="1px"
              borderColor="gray.200"
            >
              <Flex justify="space-between" align="center" mb={5}>
                <Heading as="h3" fontSize="lg">
                  Filtros
                </Heading>
                {hasActiveFilters && (
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    onClick={resetFilters}
                  >
                    Restablecer
                  </Button>
                )}
              </Flex>
              
              <Stack spacing={6}>
                {/* Rango de Precios */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Rango de Precios por Noche
                  </Text>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="bold" color="brand.600">Q {filters.priceRange[0]}</Text>
                    <Text fontSize="sm" fontWeight="bold" color="brand.600">Q {filters.priceRange[1]}</Text>
                  </Flex>
                  <RangeSlider
                    min={0}
                    max={3000}
                    step={50}
                    value={filters.priceRange}
                    onChange={handlePriceChange}
                    colorScheme="teal"
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                </Box>
                
                {/* Categoría */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Categoría del Hotel
                  </Text>
                  <Select 
                    value={filters.category} 
                    onChange={handleCategoryChange}
                    size="sm"
                    rounded="md"
                  >
                    <option value="">Todas las Categorías</option>
                    <option value="5 Estrellas">5 Estrellas (Lujo)</option>
                    <option value="4 Estrellas">4 Estrellas (Superior)</option>
                    <option value="3 Estrellas">3 Estrellas (Estándar)</option>
                  </Select>
                </Box>
                
                {/* Instalaciones */}
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Servicios e Instalaciones
                  </Text>
                  <Stack spacing={2} maxH="280px" overflowY="auto" pr={1}>
                    {AVAILABLE_FACILITIES.map((facility) => (
                      <Checkbox 
                        key={facility}
                        isChecked={filters.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        colorScheme="teal"
                        size="sm"
                      >
                        {facility}
                      </Checkbox>
                    ))}
                  </Stack>
                </Box>
                
                <Button 
                  onClick={resetFilters} 
                  colorScheme="teal" 
                  variant="outline" 
                  size="sm" 
                  w="100%"
                >
                  Limpiar Filtros
                </Button>
              </Stack>
            </Box>
          </Box>
          
          {/* Cuadrícula de Hoteles */}
          <Box flex="1">
            <Flex 
              justify="space-between" 
              align={{ base: 'flex-start', sm: 'center' }} 
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
              mb={6}
            >
              <HStack spacing={2}>
                <Text fontWeight="medium" color="gray.700">
                  Mostrando {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hoteles'}
                </Text>
                {searchParams.destination && (
                  <Badge colorScheme="teal" fontSize="sm" px={2} py={0.5} rounded="md">
                    Destino: {searchParams.destination}
                  </Badge>
                )}
              </HStack>
              
              <HStack spacing={2} w={{ base: '100%', sm: 'auto' }}>
                <Text fontSize="sm" whiteSpace="nowrap">Ordenar por:</Text>
                <Select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  size="sm"
                  w={{ base: '100%', sm: '180px' }}
                  rounded="md"
                >
                  <option value="">Recomendados</option>
                  <option value="priceAsc">Precio: Menor a Mayor</option>
                  <option value="priceDesc">Precio: Mayor a Menor</option>
                  <option value="ratingDesc">Mayor Categoría</option>
                  <option value="nameAsc">Nombre A - Z</option>
                </Select>
              </HStack>
            </Flex>

            {/* Tags de Filtros Activos */}
            {hasActiveFilters && (
              <Wrap spacing={2} mb={5}>
                {searchParams.destination && (
                  <WrapItem>
                    <Tag size="md" colorScheme="teal" borderRadius="full">
                      <TagLabel>Destino: {searchParams.destination}</TagLabel>
                      <TagCloseButton onClick={clearDestination} />
                    </Tag>
                  </WrapItem>
                )}
                {filters.category && (
                  <WrapItem>
                    <Tag size="md" colorScheme="blue" borderRadius="full">
                      <TagLabel>{filters.category}</TagLabel>
                      <TagCloseButton onClick={() => setFilters(p => ({ ...p, category: '' }))} />
                    </Tag>
                  </WrapItem>
                )}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) && (
                  <WrapItem>
                    <Tag size="md" colorScheme="purple" borderRadius="full">
                      <TagLabel>Q{filters.priceRange[0]} - Q{filters.priceRange[1]}</TagLabel>
                      <TagCloseButton onClick={() => setFilters(p => ({ ...p, priceRange: [0, 3000] }))} />
                    </Tag>
                  </WrapItem>
                )}
                {filters.facilities.map(fac => (
                  <WrapItem key={fac}>
                    <Tag size="md" colorScheme="green" borderRadius="full">
                      <TagLabel>{fac}</TagLabel>
                      <TagCloseButton onClick={() => handleFacilityToggle(fac)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}
            
            {filteredHotels.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredHotels.map((hotel) => (
                  <HotelCard key={hotel.uid || hotel._id} hotel={hotel} />
                ))}
              </SimpleGrid>
            ) : (
              <Box 
                textAlign="center" 
                py={12} 
                px={6} 
                bg={filterBg} 
                borderRadius="lg" 
                boxShadow="sm"
                border="1px dashed"
                borderColor="gray.300"
              >
                <Heading as="h3" fontSize="xl" mb={2}>
                  No se encontraron hoteles
                </Heading>
                <Text color="gray.600" mb={4}>
                  {searchParams.destination 
                    ? `No hay hoteles que coincidan con '${searchParams.destination}' y los filtros seleccionados.`
                    : 'Ningún hotel coincide con los filtros aplicados.'
                  }
                </Text>
                <Button 
                  onClick={resetFilters} 
                  colorScheme="teal"
                  size="sm"
                >
                  Restablecer todos los filtros
                </Button>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default Hotels