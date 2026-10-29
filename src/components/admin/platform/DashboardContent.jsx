import { 
  Box, 
  SimpleGrid, 
  Heading, 
  Text,
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  HStack,
  VStack,
  Badge,
  Icon,
  Button,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { 
  FiHome, 
  FiUsers, 
  FiTrendingUp, 
  FiBookmark, 
  FiArrowRight, 
  FiCheckCircle, 
  FiShield, 
  FiMapPin 
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import useStats from "../../../shared/hooks/useStats";
import useUsers from "../../../shared/hooks/useUsers";
import useHotel from "../../../shared/hooks/useHotel";
import { useEffect, useState } from "react";

const DashboardContent = ({ setActiveNavItem }) => {
  const { stats, loading: statsLoading } = useStats();
  const { getUsers, isLoading: usersLoading } = useUsers();
  const { getHotels } = useHotel();
  const cardBg = useColorModeValue('white', 'gray.700');
  const [chartData, setChartData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hotelsList, setHotelsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, hotels] = await Promise.all([
          getUsers(),
          getHotels()
        ]);
        setTotalUsers(Array.isArray(users) ? users.length : 0);
        setHotelsList(Array.isArray(hotels) ? hotels : []);
      } catch (e) {
        console.error("Error al cargar datos del superadmin:", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (stats?.hotelOccupancy) {
      const occupancyData = stats.hotelOccupancy.map(hotel => ({
        name: hotel.name ? (hotel.name.length > 18 ? hotel.name.substring(0, 16) + '...' : hotel.name) : 'Hotel',
        ocupacion: Math.round(hotel.porcentOccupied || 0)
      }));
      setChartData(occupancyData);
    }
  }, [stats]);

  if (statsLoading || usersLoading) {
    return (
      <Flex justify="center" align="center" minH="350px">
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Flex>
    );
  }

  const activeHotelsCount = hotelsList.length || stats?.hotels?.length || 0;
  const totalBookingsCount = stats?.totalBookings || 0;
  const avgOccupancy = stats?.averageOccupancy || 0;

  return (
    <Box>
      {/* Header del Super Admin */}
      <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontWeight="black" color="gray.800">
              Panel de Control de Plataforma
            </Heading>
            <Badge colorScheme="purple" fontSize="xs" px={2.5} py={0.5} rounded="md">
              Super Admin
            </Badge>
          </HStack>
          <Text color="gray.600" fontSize="sm">
            Monitoreo en tiempo real de la red hotelera, usuarios y reservas de QuickStay Guatemala.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button 
            size="sm" 
            colorScheme="teal" 
            leftIcon={<FiHome />}
            onClick={() => setActiveNavItem && setActiveNavItem("Hoteles")}
          >
            Gestionar Hoteles
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            colorScheme="purple" 
            leftIcon={<FiUsers />}
            onClick={() => setActiveNavItem && setActiveNavItem("Usuarios")}
          >
            Usuarios & Roles
          </Button>
        </HStack>
      </Flex>
      
      {/* KPIs Globales */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
        <Card bg={cardBg} shadow="sm" rounded="xl" borderWidth="1px" borderColor="teal.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                  Hoteles Afiliados
                </StatLabel>
                <Icon as={FiHome} color="teal.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="teal.600">
                {activeHotelsCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.500" mb={0}>
                En toda la República de Guatemala
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} shadow="sm" rounded="xl" borderWidth="1px" borderColor="blue.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                  Reservaciones Totales
                </StatLabel>
                <Icon as={FiBookmark} color="blue.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="blue.600">
                {totalBookingsCount}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.500" mb={0}>
                Procesadas en la plataforma
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} shadow="sm" rounded="xl" borderWidth="1px" borderColor="purple.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                  Ocupación Promedio
                </StatLabel>
                <Icon as={FiTrendingUp} color="purple.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="purple.600">
                {avgOccupancy}%
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.500" mb={0}>
                Rendimiento de ocupación global
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} shadow="sm" rounded="xl" borderWidth="1px" borderColor="green.100">
          <CardBody p={5}>
            <Stat>
              <Flex justify="space-between" align="center" mb={2}>
                <StatLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                  Usuarios Registrados
                </StatLabel>
                <Icon as={FiUsers} color="green.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="3xl" fontWeight="black" color="green.600">
                {totalUsers}
              </StatNumber>
              <StatHelpText fontSize="xs" color="gray.500" mb={0}>
                Clientes, gerentes y administradores
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Gráfico de Ocupación y Accesos Rápidos */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        {/* Gráfico de Barras */}
        <Card bg={cardBg} p={5} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm" gridColumn={{ base: "1", lg: "span 2" }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="md" color="gray.800">Tasa de Ocupación por Hotel</Heading>
              <Text fontSize="xs" color="gray.500">Porcentaje de ocupación actual de habitaciones</Text>
            </Box>
            <Badge colorScheme="teal" px={2} py={1} rounded="md">Métrica en Vivo</Badge>
          </Flex>
          <Box height="300px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Ocupación']} />
                <Bar dataKey="ocupacion" name="Ocupación" fill="#319795" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Panel Lateral de Atajos de Administración */}
        <VStack spacing={4} align="stretch">
          <Card 
            bg="white" 
            p={5} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Hoteles")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="teal.50" rounded="lg" color="teal.600">
                  <FiHome size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Directorio de Hoteles</Text>
                  <Text fontSize="xs" color="gray.500">Crear hoteles, editar tarifas y fotos</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>

          <Card 
            bg="white" 
            p={5} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'purple.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Usuarios")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="purple.50" rounded="lg" color="purple.600">
                  <FiUsers size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Gestión de Usuarios</Text>
                  <Text fontSize="xs" color="gray.500">Asignar Gerentes y permisos</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>

          <Card 
            bg="white" 
            p={5} 
            rounded="xl" 
            borderWidth="1px" 
            borderColor="gray.200" 
            shadow="sm"
            _hover={{ borderColor: 'blue.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => setActiveNavItem && setActiveNavItem("Reportes")}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box p={3} bg="blue.50" rounded="lg" color="blue.600">
                  <FiTrendingUp size={22} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md">Reportes y Finanzas</Text>
                  <Text fontSize="xs" color="gray.500">Descargar estados de cuenta e informes</Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Card>
        </VStack>
      </SimpleGrid>

      {/* Lista de Hoteles Registrados */}
      <Card bg={cardBg} p={5} rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="md" color="gray.800">Hoteles Activos en la Red</Heading>
            <Text fontSize="xs" color="gray.500">Listado consolidado de propiedades registradas en Guatemala</Text>
          </Box>
          <Button 
            size="xs" 
            colorScheme="teal" 
            variant="outline"
            onClick={() => setActiveNavItem && setActiveNavItem("Hoteles")}
          >
            Ver Catálogo Completo
          </Button>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Nombre del Hotel</Th>
                <Th>Ubicación</Th>
                <Th>Categoría</Th>
                <Th>Habitaciones Libres</Th>
                <Th>Tarifas Base</Th>
                <Th>Estado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {hotelsList.slice(0, 6).map((hotel) => (
                <Tr key={hotel.uid || hotel._id}>
                  <Td fontWeight="bold" color="gray.800">{hotel.name}</Td>
                  <Td color="gray.600">
                    <HStack spacing={1}>
                      <Icon as={FiMapPin} color="teal.500" boxSize={3} />
                      <Text fontSize="xs">{hotel.location}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="teal" fontSize="xs">{hotel.category}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="green" fontSize="xs">
                      {hotel.availableRooms ?? 0} libres
                    </Badge>
                  </Td>
                  <Td fontSize="xs" fontWeight="semibold">
                    Q{hotel.rangeOfPrices?.min || 0} - Q{hotel.rangeOfPrices?.max || 0}
                  </Td>
                  <Td>
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">Operando</Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default DashboardContent;
