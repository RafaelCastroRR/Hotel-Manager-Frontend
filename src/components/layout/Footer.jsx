import { 
  Box, 
  Container, 
  SimpleGrid, 
  Stack, 
  Text, 
  Flex, 
  Link, 
  Heading, 
  HStack, 
  VStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
  Icon,
  Badge
} from '@chakra-ui/react'
import { useState } from 'react'
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { BedDoubleIcon } from 'lucide-react'

const ListHeader = ({ children }) => {
  return (
    <Heading as="h4" fontSize="md" fontWeight="bold" mb={3} color="gray.800" textTransform="uppercase" letterSpacing="wide">
      {children}
    </Heading>
  )
}

function Footer() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [modalContent, setModalContent] = useState({ title: '', body: '' })

  const openLegalModal = (type) => {
    if (type === 'privacy') {
      setModalContent({
        title: 'Política de Privacidad',
        body: 'En QuickStay Guatemala nos comprometemos a proteger tus datos personales. La información recopilada al realizar reservas (nombre, correo y teléfono) se utiliza exclusivamente para la gestión de tus estancias y emisión de comprobantes. No compartimos tus datos con terceros sin tu consentimiento expreso.'
      })
    } else if (type === 'terms') {
      setModalContent({
        title: 'Términos y Condiciones del Servicio',
        body: 'Al reservar a través de QuickStay Guatemala, aceptas cumplir las normas de cada establecimiento hotelero. Las cancelaciones y modificaciones están sujetas a las políticas particulares de cada habitación y temporada. Los precios mostrados incluyen impuestos de ley aplicables en la República de Guatemala.'
      })
    } else {
      setModalContent({
        title: 'Garantía QuickStay Guatemala',
        body: 'Todos los hoteles listados en nuestra plataforma cuentan con verificación de calidad, servicio garantizado e instalaciones de primer nivel en los principales atractivos turísticos de Guatemala.'
      })
    }
    onOpen()
  }

  return (
    <Box bg="gray.100" color="gray.700" borderTop="1px" borderColor="gray.200">
      <Container as={Stack} maxW="1200px" py={{ base: 10, md: 12 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 8, md: 10 }}>
          
          {/* Col 1: Marca y Propósito */}
          <Stack spacing={4}>
            <Flex alignItems="center">
              <Box color="brand.500" display="flex" alignItems="center">
                <BedDoubleIcon size={28} />
              </Box>
              <Text fontSize="xl" fontWeight="black" ml={2} color="gray.800">
                Quick<Text as="span" color="brand.500">Stay</Text>
              </Text>
              <Badge ml={2} colorScheme="teal" fontSize="xs">GT</Badge>
            </Flex>
            <Text fontSize="sm" color="gray.600" lineHeight="tall">
              Tu portal confiable de reservas hoteleras en Guatemala. Conectamos viajeros con los mejores hoteles coloniales, resorts frente al lago y retiros en la selva maya.
            </Text>
            <HStack spacing={2} pt={2}>
              <IconButton
                as="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                icon={<FiInstagram />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                rounded="full"
              />
              <IconButton
                as="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                icon={<FiFacebook />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                rounded="full"
              />
              <IconButton
                as="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                icon={<FiTwitter />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                rounded="full"
              />
              <IconButton
                as="a"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                icon={<FiYoutube />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                rounded="full"
              />
            </HStack>
          </Stack>
          
          {/* Col 2: Destinos Destacados en Guatemala */}
          <Stack align="flex-start" spacing={2.5}>
            <ListHeader>Destinos en Guatemala</ListHeader>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Antigua" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Antigua Guatemala
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Atitlan" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Lago de Atitlán (Sololá)
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Peten" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Petén & Tikal (Flores)
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Izabal" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Río Dulce & Izabal
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Xela" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Quetzaltenango (Xela)
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Coban" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Cobán & Alta Verapaz
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels?destination=Monterrico" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Playas de Monterrico
            </Link>
          </Stack>
          
          {/* Col 3: Enlaces de Navegación del Sitio */}
          <Stack align="flex-start" spacing={2.5}>
            <ListHeader>Explorar & Reservar</ListHeader>
            <Link 
              as={RouterLink} 
              to="/" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Página Principal
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Catálogo de Hoteles
            </Link>
            <Link 
              as={RouterLink} 
              to="/events" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Eventos y Convenciones
            </Link>
            <Link 
              as={RouterLink} 
              to="/my-bookings" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Mis Reservaciones
            </Link>
            <Link 
              as={RouterLink} 
              to="/profile" 
              fontSize="sm" 
              color="gray.600" 
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Mi Perfil
            </Link>
            <Link 
              onClick={() => openLegalModal('guarantee')} 
              fontSize="sm" 
              color="gray.600" 
              cursor="pointer"
              _hover={{ color: 'brand.600', textDecoration: 'underline' }}
            >
              Garantía de Calidad
            </Link>
          </Stack>
          
          {/* Col 4: Atención & Contacto en Guatemala */}
          <Stack align="flex-start" spacing={3}>
            <ListHeader>Atención & Contacto</ListHeader>
            <HStack align="center" spacing={2.5}>
              <Icon as={FiMapPin} color="brand.500" />
              <Text fontSize="sm" color="gray.600">
                Ciudad de Guatemala, Guatemala C.A.
              </Text>
            </HStack>
            <HStack align="center" spacing={2.5}>
              <Icon as={FiPhone} color="brand.500" />
              <Text fontSize="sm" color="gray.600">
                +502 2345-6789 / 5555-0188
              </Text>
            </HStack>
            <HStack align="center" spacing={2.5}>
              <Icon as={FiMail} color="brand.500" />
              <Text fontSize="sm" color="gray.600">
                soporte@xibalbadev.xyz
              </Text>
            </HStack>
            <HStack align="center" spacing={2.5}>
              <Icon as={FiClock} color="brand.500" />
              <Text fontSize="sm" color="gray.600">
                Atención y Reservas: 24/7
              </Text>
            </HStack>
            <Box pt={2}>
              <Button
                as={RouterLink}
                to="/hotels"
                size="sm"
                colorScheme="teal"
                variant="solid"
                rounded="md"
              >
                Buscar Hoteles Ahora
              </Button>
            </Box>
          </Stack>
        </SimpleGrid>
      </Container>
      
      {/* Barra Inferior */}
      <Box py={5} borderTopWidth={1} borderColor="gray.200" bg="gray.200">
        <Container 
          maxW="1200px"
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Text fontSize="xs" color="gray.600">
            © 2026 QuickStay Guatemala. Todos los derechos reservados.
          </Text>
          <HStack spacing={6} mt={{ base: 3, md: 0 }}>
            <Link 
              onClick={() => openLegalModal('privacy')} 
              fontSize="xs" 
              color="gray.600" 
              cursor="pointer"
              _hover={{ color: 'brand.600' }}
            >
              Privacidad
            </Link>
            <Link 
              onClick={() => openLegalModal('terms')} 
              fontSize="xs" 
              color="gray.600" 
              cursor="pointer"
              _hover={{ color: 'brand.600' }}
            >
              Términos del Servicio
            </Link>
            <Link 
              as={RouterLink} 
              to="/hotels" 
              fontSize="xs" 
              color="gray.600"
              _hover={{ color: 'brand.600' }}
            >
              Mapa de Hoteles
            </Link>
          </HStack>
        </Container>
      </Box>

      {/* Modal para Privacidad / Términos */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader color="gray.800">{modalContent.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <Text color="gray.600" fontSize="sm" lineHeight="relaxed">
              {modalContent.body}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose} size="sm">
              Entendido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Footer