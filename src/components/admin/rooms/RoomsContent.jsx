import { useState, useCallback, useEffect } from "react";
import {
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Grid,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiSearch, FiFilter, FiRefreshCw, FiPlus } from "react-icons/fi";

import useRooms from "../../../shared/hooks/userRooms";
import RoomCard from "./RoomCard";
import AddEditRoomModal from "./AddEditRoomModal";
import RoomDetailsModal from "./RoomDetailsModal";
import ConfirmationModal from "./ConfirmationModal";

const RoomsContent = () => {
  const {
    loading,
    getRooms,
    createNewRoom,
    editRoom,
    toggleRoom
  } = useRooms();

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("Todas");
  const [typeFilter, setTypeFilter] = useState("Todos los Tipos");
  const [stateFilter, setStateFilter] = useState("Todas");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [roomInQuestion, setRoomInQuestion] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { isOpen: isAddEditModalOpen, onOpen: onOpenAddEditModal, onClose: onCloseAddEditModal } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onOpenDetailModal, onClose: onCloseDetailModal } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onOpenConfirm, onClose: onCloseConfirm } = useDisclosure();

  const toast = useToast();

  const fetchRooms = useCallback(async () => {
    const roomsData = await getRooms();
    setRooms(roomsData);
    setFilteredRooms(roomsData);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...rooms];

    
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.uid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de disponibilidad (available)
    if (availabilityFilter !== "Todas") {
      filtered = filtered.filter(room => {
        if (availabilityFilter === "Activadas") return room.available;
        if (availabilityFilter === "Desactivadas") return !room.available;
        return true;
      });
    }

    // Aplicar filtro de tipo
    if (typeFilter !== "Todos los Tipos") {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    // Aplicar filtro de estado (state)
    if (stateFilter !== "Todas") {
      filtered = filtered.filter(room => {
        if (stateFilter === "Activas") return room.state;
        if (stateFilter === "Inactivas") return !room.state;
        return true;
      });
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, availabilityFilter, typeFilter, stateFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleAvailabilityFilter = (value) => {
    setAvailabilityFilter(value);
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
  };

  const handleStateFilter = (value) => {
    setStateFilter(value);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedRoom(null);
    onOpenAddEditModal();
  };

  const handleOpenEditModal = (room) => {
    if (!room.available) {
      toast({
        title: "No se puede editar",
        description: "No se puede editar una habitación que no está disponible.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsEditing(true);
    setSelectedRoom(room);
    onOpenAddEditModal();
  };

  const handleSaveRoom = async (uid, roomData) => {
    try {
      let response;
      if (uid) {
        response = await editRoom(uid, roomData);
        if (response.error) {
          toast({
            title: "Error al editar",
            description: "No se pudo editar la habitación. Por favor, intente nuevamente.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        toast({
          title: "Habitación actualizada",
          description: "La habitación se ha actualizado correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await createNewRoom(roomData);
        if (response.error) {
          toast({
            title: "Error al crear",
            description: "No se pudo crear la habitación. Por favor, intente nuevamente.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return false;
        }
        toast({
          title: "Habitación creada",
          description: "La habitación se ha creado correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchRooms();
      return true;
    } catch (error) {
      console.error("Error al guardar la habitación:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    onOpenDetailModal();
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === "toggleState") {
        console.log("Habitación a modificar:", roomInQuestion);
        const response = await toggleRoom(roomInQuestion.uid, !roomInQuestion.available);
        console.log("Respuesta del servidor:", response);
        if (response.error) {
          toast({
            title: "Error",
            description: "No se pudo cambiar el estado de la habitación.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          await fetchRooms();
        }
      }
      onCloseConfirm();
    } catch (error) {
      console.error("Error al realizar la acción:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={{ base: 0, md: 2 }}>
      <HStack justify="space-between" mb={6} flexWrap="wrap">
        <HStack spacing={3} flexWrap="wrap">
          <InputGroup w={{ base: "full", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar habitaciones..."
              borderRadius="md"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline">
              Disponibilidad: {availabilityFilter}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleAvailabilityFilter("Todas")}>
                Todas
              </MenuItem>
              <MenuItem onClick={() => handleAvailabilityFilter("Activadas")}>
                Disponibles
              </MenuItem>
              <MenuItem onClick={() => handleAvailabilityFilter("Desactivadas")}>
                No Disponibles
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline">
              Tipo: {typeFilter}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleTypeFilter("Todos los Tipos")}>
                Todos los Tipos
              </MenuItem>
              <MenuItem onClick={() => handleTypeFilter("Deluxe")}>
                Deluxe
              </MenuItem>
              <MenuItem onClick={() => handleTypeFilter("Suite")}>
                Suite
              </MenuItem>
              <MenuItem onClick={() => handleTypeFilter("Estándar")}>
                Estándar
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline">
              Estado: {stateFilter}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleStateFilter("Todas")}>
                Todas
              </MenuItem>
              <MenuItem onClick={() => handleStateFilter("Activas")}>
                Activadas
              </MenuItem>
              <MenuItem onClick={() => handleStateFilter("Inactivas")}>
                Desactivadas
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <HStack spacing={3} mt={{ base: 4, md: 0 }}>
          <Button
            colorScheme="blue"
            leftIcon={<FiRefreshCw />}
            onClick={fetchRooms}
            isLoading={loading}
          >
            Recargar Habitaciones
          </Button>
          <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={handleOpenAddModal}>
            Crear Habitación
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Cargando habitaciones...</Text>
      ) : filteredRooms.length === 0 ? (
        <Text fontSize="lg" textAlign="center" py={10} color="gray.500">
          No hay habitaciones disponibles.
        </Text>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.uid}
              room={room}
              onViewDetails={handleViewDetails}
              onEdit={handleOpenEditModal}
              onToggleState={(room) => {
                setRoomInQuestion(room);
                setActionType("toggleState");
                onOpenConfirm();
              }}
            />
          ))}
        </Grid>
      )}

      <AddEditRoomModal
        isOpen={isAddEditModalOpen}
        onClose={onCloseAddEditModal}
        roomToEdit={selectedRoom}
        onSave={handleSaveRoom}
      />

      <RoomDetailsModal
        isOpen={isDetailModalOpen}
        onClose={onCloseDetailModal}
        room={selectedRoom}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        actionType={actionType}
        roomInQuestion={roomInQuestion}
        onConfirm={handleConfirmAction}
        roomState={rooms.find(r => r.uid === roomInQuestion?.uid)?.state}
      />
    </Box>
  );
};

export default RoomsContent;
