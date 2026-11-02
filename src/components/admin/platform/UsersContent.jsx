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
  Button,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Stack,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { Card } from "@chakra-ui/react";
import useUsers from "../../../shared/hooks/useUsers";
import { useRef } from "react";

const UsersContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getUsers, updateUser, deleteUser } = useUsers();
  const cancelRef = useRef();
  
  // Para el modal de confirmación de eliminación
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const users = await getUsers();
    console.log(users)
    setUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // crear/editar usuario
  const [editingUser, setEditingUser] = useState(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("user");
  
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

  // modal para editar usuario
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormName(user.nombre);
    setFormEmail(user.email);
    setFormRole(user.role);
    onOpen();
  };

  // Guardar usuario (crear o editar)
  const handleSave = async () => {
    if (editingUser) {
      try {
        const updatedUserData = {
          nombre: formName,
          email: formEmail,
          role: formRole
        };
        
        await updateUser(editingUser._id, updatedUserData);
        await fetchUsers(); // Recargar la lista de usuarios
        onClose();
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        // Aquí podrías agregar una notificación de error si lo deseas
      }
    }
    onClose();
  };

  // Abrir modal de confirmación de eliminación
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    onDeleteOpen();
  };

  // Eliminar usuario
  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete._id);
      await fetchUsers(); // Recargar la lista de usuarios
      setUserToDelete(null);
      onDeleteClose();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      // Aquí podrías agregar una notificación de error si lo deseas
    }
  };

  // Filtrado (Funcional)
  const filteredUsers = users?.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user._id?.toString().includes(searchTermLower) ||
      user.nombre?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      getRoleLabel(user.role)?.toLowerCase().includes(searchTermLower);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  console.log(users)

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
          <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers?.map((user) => (
              <Tr key={user.id}>
                <Td>{user._id}</Td>
                <Td>{user.nombre}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge colorScheme={getRoleColor(user.role)} fontSize="sm" px={2} py={1} borderRadius="md">
                    {getRoleLabel(user.role)}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    mr={2}
                    onClick={() => handleEditClick(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Eliminar
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table></Box>
      </Card>

      {/* Modal para crear/editar usuario */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  placeholder="Nombre completo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Rol</FormLabel>
                <Select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="ADMIN_ROLE">Administrador</option>
                  <option value="MANAGER_ROLE">Admin de Hotel</option>
                  <option value="USER_ROLE">Usuario</option>
                </Select>
              </FormControl>
              <Button colorScheme="blue" mr={3} onClick={handleSave}>
                Guardar
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Usuario
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro que deseas eliminar al usuario{" "}
              <b>{userToDelete?.nombre}</b>? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UsersContent;
