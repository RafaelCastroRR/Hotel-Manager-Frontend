import { useState, useEffect} from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { Card } from "@chakra-ui/react";
import useUsers from "../../../shared/hooks/useUsers";
import useHotel from "../../../shared/hooks/useHotel";
import { useToast } from "@chakra-ui/react";
const UsersContent = () => {
  const { getActiveUsersByHotel } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const { getHotelsByAdmin } = useHotel();
  const toast = useToast();
  const fetchUsers = async () => {
    try {
      const hotelData = await getHotelsByAdmin();
      console.log('Hotel cargado:', hotelData);
      
      if (hotelData?.uid) {
        const activeUsers = await getActiveUsersByHotel(hotelData.uid);
        console.log('Usuarios activos:', activeUsers);
        setUsers(activeUsers);
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrado
  const filteredUsers = users?.filter(userData => {
    const user = userData.user;
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user._id?.toString().includes(searchTermLower) ||
      user.nombre?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      getRoleLabel(user.role)?.toLowerCase().includes(searchTermLower);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'teal';
      case 'MANAGER_ROLE':
        return 'orange';
      case 'USER_ROLE':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN_ROLE':
        return 'Administrador';
      case 'MANAGER_ROLE':
        return 'Admin de Hotel';
      case 'USER_ROLE':
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Gestión de Usuarios</Heading>
      </Flex>

      <Card>
        <Flex gap={4} mb={4} direction={{ base: "column", sm: "row" }}>
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW={{ base: "full", sm: "300px" }}
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">Todos los roles</option>
            <option value="ADMIN_ROLE">Administrador</option>
            <option value="MANAGER_ROLE">Admin de Hotel</option>
            <option value="USER_ROLE">Usuario</option>
          </Select>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th w="10%">ID</Th>
                <Th w="15%">Nombre</Th>
                <Th w="20%">Email</Th>
                <Th w="10%">Rol</Th>
                <Th w="12%">Entrada</Th>
                <Th w="12%">Salida</Th>
                <Th w="8%">Huéspedes</Th>
                <Th w="8%">Reservas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers?.map((userData) => {
                const user = userData.user;
                return (
                  <Tr key={user._id}>
                    <Td isTruncated>{user._id}</Td>
                    <Td isTruncated>{user.nombre}</Td>
                    <Td isTruncated>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleColor(user.role)} fontSize="sm" px={2} py={1} borderRadius="md">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </Td>
                    <Td>{new Date(userData.checkInDate).toLocaleDateString()}</Td>
                    <Td>{new Date(userData.checkOutDate).toLocaleDateString()}</Td>
                    <Td>{userData.guests}</Td>
                    <Td>
                      <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="md">
                        {userData.totalReservations}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default UsersContent;
