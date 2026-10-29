import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  Flex, 
  Badge, 
  Input,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import SearchBar from '../components/common/SearchBar'
import HotelCard from '../components/hotels/HotelCard'
import TestimonialCard from '../components/testimonials/TestimonialCard'
import { testimonials } from '../data/testimonials'
import { useState, useEffect } from 'react'
import useHotel from '../shared/hooks/useHotel'
import { useSearch } from '../shared/context/SearchContext'

function Home() {
  const heroTextWidth = useBreakpointValue({ base: '100%', md: '80%', lg: '65%' })
  const { getHotels } = useHotel()
  const { searchParams } = useSearch()
  const [hotels, setHotels] = useState([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const toast = useToast()

  useEffect(() => {
    const fetchHotels = async () => {
      const response = await getHotels()
      setHotels(response || [])
    }
    fetchHotels()
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      toast({
        title: "Correo no válido",
        description: "Por favor ingresa un correo electrónico válido.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      })
      return
    }

    toast({
      title: "¡Suscripción exitosa!",
      description: "Gracias por unirte. Recibirás las mejores ofertas y promociones de hoteles en Guatemala.",
      status: "success",
      duration: 4000,
      isClosable: true,
    })
    setNewsletterEmail('')
  }

  const featuredHotels = hotels.slice(0, 4)
  
  return (
    <Box>
      <Box 
        position="relative" 
        minH={{ base: '750px', md: '600px', lg: '650px' }} 
        py={{ base: 24, md: 16 }}
        bgImage="url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920')"
        bgPosition="center"
        bgSize="cover"
        bgRepeat="no-repeat"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0
        }}
      >
        <Container 
          maxW="1200px" 
          h="100%" 
          position="relative" 
          zIndex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Badge 
            alignSelf="flex-start" 
            px={3} 
            py={1} 
            bg="brand.500" 
            color="white" 
            fontWeight="medium" 
            fontSize="sm" 
            borderRadius="full"
            mb={4}
          >
            Hoteles y Resorts en Guatemala
          </Badge>
          
          <Box maxW={heroTextWidth}>
            <Heading 
              as="h1" 
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} 
              color="white" 
              fontWeight="bold"
              lineHeight="1.2"
              mb={4}
            >
              Descubre Tu Destino Perfecto en Guatemala
            </Heading>
            
            <Text 
              fontSize={{ base: 'md', md: 'lg' }} 
              color="white" 
              mb={6}
            >
              Lujo, confort y cultura ancestral te esperan en los destinos más hermosos de Guatemala. Reserva tu estancia hoy.
            </Text>
          </Box>
          
          <Box 
            bg="white" 
            p={5} 
            borderRadius="lg" 
            boxShadow="md" 
            mt={4}
            maxW={{ base: '100%', lg: '95%' }}
          >
            <SearchBar />
          </Box>
        </Container>
      </Box>

      <Box py={16} bg="gray.50">
        <Container maxW="1200px">
          <Heading 
            as="h2" 
            fontSize={{ base: '2xl', md: '3xl' }} 
            mb={3} 
            textAlign="center"
          >
            Destinos Destacados
          </Heading>
          
          <Text 
            textAlign="center" 
            fontSize="md" 
            color="gray.600" 
            maxW="800px" 
            mx="auto" 
            mb={12}
          >
            Descubre nuestra selección de hoteles excepcionales en Antigua, Atitlán, Petén y todo el país, con atención de primera clase y experiencias inolvidables.
          </Text>
          
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={8}>
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.uid || hotel._id} hotel={hotel} />
            ))}
          </SimpleGrid>
          
          <Flex justify="center" mt={10}>
            <Button 
              as={RouterLink} 
              to="/hotels"
              rightIcon={<FiArrowRight />} 
              variant="outline" 
              colorScheme="teal"
            >
              Ver Todos los Hoteles
            </Button>
          </Flex>
        </Container>
      </Box>
      
      <Box py={16} bg="gray.50">
        <Container maxW="1200px">
          <Heading 
            as="h2" 
            fontSize={{ base: '2xl', md: '3xl' }} 
            mb={3} 
            textAlign="center"
          >
            Lo Que Dicen Nuestros Huéspedes
          </Heading>
          
          <Text 
            textAlign="center" 
            fontSize="md" 
            color="gray.600" 
            maxW="800px" 
            mx="auto" 
            mb={12}
          >
            Descubre por qué los viajeros eligen QuickStay Guatemala para hospedarse en sus aventuras y descansos.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Sección Mantente Inspirado con Formulario Funcional */}
      <Box py={16} bg="navy.900" color="white">
        <Container maxW="1200px">
          <Box 
            textAlign="center" 
            maxW="800px" 
            mx="auto"
          >
            <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }} mb={4}>
              Mantente Inspirado
            </Heading>
            
            <Text fontSize="md" mb={8} color="gray.300">
              Únete a nuestra comunidad de viajeros y sé el primero en descubrir nuevos destinos, ofertas exclusivas e inspiración para tus próximas vacaciones en Guatemala.
            </Text>
            
            <Box as="form" onSubmit={handleSubscribe} maxW="520px" mx="auto">
              <Flex 
                flexDirection={{ base: 'column', sm: 'row' }}
                gap={3}
              >
                <Input 
                  placeholder="Ingresa tu correo electrónico" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  bg="white" 
                  color="gray.800" 
                  _placeholder={{ color: 'gray.500' }}
                  size="lg"
                  rounded="md"
                />
                <Button 
                  type="submit"
                  bg="brand.500" 
                  color="white"
                  _hover={{ bg: 'brand.600' }} 
                  size="lg"
                  minW={{ sm: '150px' }}
                  rounded="md"
                >
                  Suscribirse
                </Button>
              </Flex>
            </Box>
            
            <Text fontSize="xs" color="gray.400" mt={4}>
              Al suscribirte, consientes recibir novedades y promociones de hoteles en Guatemala. Puedes cancelar tu suscripción en cualquier momento.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Home