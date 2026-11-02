import { useState, useEffect } from "react";
import {
  Box,
  Flex,
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
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
  useDisclosure,
  useToast,
  Stack,
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  Divider,
  List,
  ListItem,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiUser,
} from "react-icons/fi";
import { useReservation } from "../../../shared/hooks/useReservation";
import useUsers from "../../../shared/hooks/useUsers";
import useHotel from "../../../shared/hooks/useHotel";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useInvoices } from "../../../shared/hooks/useInvoices";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const ReservationsContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState(reservations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState("date-asc");
  const { getReservations, editReservation, saveReservation } = useReservation();
  const { getUsers } = useUsers();
  const { getHotelsByAdmin } = useHotel();
  const [hotel, setHotel] = useState(null);
  const toast = useToast();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isNewModalOpen, onOpen: onNewModalOpen, onClose: onNewModalClose } = useDisclosure();
  const [editData, setEditData] = useState(null);
  const [newReservationData, setNewReservationData] = useState({
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    guests: 1,
    services: [],
    userId: '',
    roomId: '',
  });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const { createInvoice } = useInvoices();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!hotel?.uid) return;
      
      const reservations = await getReservations();
      if (reservations) {
        const hotelReservations = reservations.filter(reservation => 
          reservation.hotel.uid === hotel.uid
        );
        setReservations(hotelReservations);
        setFilteredReservations(hotelReservations);
      }
    };
    fetchReservations();
  }, [hotel]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        console.log(users)
        setAllUsers(users);
      } catch {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelData = await getHotelsByAdmin();
        console.log('Hotel cargado:', hotelData);
        if (hotelData?.rooms) {
          console.log('Habitaciones del hotel:', hotelData.rooms.length);
          hotelData.rooms.forEach(room => {
            console.log('Habitación:', {
              id: room._id,
              type: room.type,
              nonAvailabilityCount: room.nonAvailability?.length || 0
            });
          });
        }
        setHotel(hotelData);
      } catch (error) {
        console.error('Error al cargar el hotel:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del hotel",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchHotel();
  }, []);

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleEditClick = (reservation) => {
    setSelectedReservation(reservation);
    setEditData({
      checkInDate: new Date(reservation.checkInDate),
      checkOutDate: new Date(reservation.checkOutDate),
      guests: reservation.guests,
      services: reservation.services?.map(service => ({
        service: service.service._id,
        quantity: service.quantity
      })) || []
    });
    onEditModalOpen();
  };

  const handleCompleteReservation = async (reservation) => {
    try {
      await editReservation(reservation._id, { status: 'completed' });
      
      await createInvoice({ reservationId: reservation._id});
      const updatedReservations = await getReservations();
      if (updatedReservations) {
        const hotelReservations = updatedReservations.filter(res => 
          res.hotel.uid === hotel.uid
        );
        setReservations(hotelReservations);
        setFilteredReservations(hotelReservations);
      }

    } catch {
      toast({
        title: "Error",
        description: "No se pudo completar la reserva",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteReservation = async () => {
    try {
      await editReservation(selectedReservation._id, { status: 'cancelled' });
      toast({
        title: "Reserva cancelada",
        description: "La reserva se ha cancelado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteModalClose();
      const updatedReservations = await getReservations();
      if (updatedReservations) {
        const hotelReservations = updatedReservations.filter(res => 
          res.hotel.uid === hotel.uid
        );
        setReservations(hotelReservations);
        setFilteredReservations(hotelReservations);
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setEditData(prev => ({
      ...prev,
      checkInDate: start,
      checkOutDate: end
    }));
  };

  const handleGuestsChange = (e) => {
    setEditData(prev => ({
      ...prev,
      guests: parseInt(e.target.value)
    }));
  };

  const handleServicesChange = (selectedServices) => {
    setEditData(prev => ({
      ...prev,
      services: selectedServices.map(serviceId => ({
        service: serviceId,
        quantity: 1
      }))
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservationData = {
        checkInDate: editData.checkInDate.toISOString(),
        checkOutDate: editData.checkOutDate.toISOString(),
        guests: editData.guests,
        services: editData.services
      };

      await editReservation(selectedReservation._id, reservationData);
      toast({
        title: "Reserva actualizada",
        description: "La reserva se ha actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditModalClose();
      const updatedReservations = await getReservations();
      if (updatedReservations) {
        const hotelReservations = updatedReservations.filter(res => 
          res.hotel.uid === hotel.uid
        );
        setReservations(hotelReservations);
        setFilteredReservations(hotelReservations);
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateNights = () => {
    if (!editData?.checkInDate || !editData?.checkOutDate) return 0;
    const checkIn = dayjs(editData.checkInDate);
    const checkOut = dayjs(editData.checkOutDate);
    return checkOut.diff(checkIn, 'day');
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterReservations(value, statusFilter, sortBy);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterReservations(searchTerm, status, sortBy);
  };

  const handleSort = (value) => {
    setSortBy(value);
    filterReservations(searchTerm, statusFilter, value);
  };

  const filterReservations = (search, status, sort) => {
    let filtered = reservations;

    if (search) {
      filtered = filtered.filter(reservation => 
        reservation.user.nombre.toLowerCase().includes(search.toLowerCase()) ||
        reservation.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "Todas") {
      filtered = filtered.filter(reservation => reservation.status === status.toLowerCase());
    }

    filtered.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return new Date(a.checkInDate) - new Date(b.checkInDate);
        case "date-desc":
          return new Date(b.checkInDate) - new Date(a.checkInDate);
        case "name":
          return a.user.nombre.localeCompare(b.user.nombre);
        default:
          return 0;
      }
    });

    setFilteredReservations(filtered);
  };

  const handleNewReservation = () => {
    setNewReservationData({
      checkInDate: new Date(),
      checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      guests: 1,
      services: [],
      userId: '',
      roomId: '',
    });
    setUserSearchTerm('');
    setSearchResults([]);
    onNewModalOpen();
  };

  const handleUserSearch = (value) => {
    setUserSearchTerm(value);
    if (value.length >= 3) {
      const filtered = allUsers.filter(user => 
        user.nombre.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user) => {
    console.log('Usuario seleccionado:', user);
    setNewReservationData(prev => ({
      ...prev,
      userId: user._id
    }));
    setUserSearchTerm(user.nombre);
    setSearchResults([]);
  };

  const handleNewDateChange = (dates) => {
    const [start, end] = dates;
    
    console.log('Fechas seleccionadas:', { start, end });
    
    // Actualizar el estado con las nuevas fechas
    setNewReservationData(prev => ({
      ...prev,
      checkInDate: start,
      checkOutDate: end
    }));
    
    // Solo filtrar habitaciones si tenemos ambas fechas válidas
    if (start && end && hotel?.rooms) {
      console.log('Total de habitaciones en el hotel:', hotel.rooms.length);
      
      const available = hotel.rooms.filter(room => {
        console.log('Evaluando habitación:', {
          roomId: room._id,
          type: room.type,
          nonAvailabilityCount: room.nonAvailability?.length || 0
        });

        // Verificar si hay fechas no disponibles que se solapan
        const hasNonAvailability = room.nonAvailability?.some(period => {
          const periodStart = new Date(period.start);
          const periodEnd = new Date(period.end);
          
          const hasOverlap = (
            (start < periodEnd && end > periodStart) || // Solapamiento parcial
            (start >= periodStart && end <= periodEnd) || // Reserva dentro del rango
            (start <= periodStart && end >= periodEnd) // Reserva dentro del rango seleccionado
          );

          if (hasOverlap) {
            console.log('Habitación con período no disponible:', {
              roomId: room._id,
              periodStart: periodStart,
              periodEnd: periodEnd
            });
          }

          return hasOverlap;
        });

        if (hasNonAvailability) {
          console.log('Habitación no disponible por período:', room._id);
          return false;
        }

        // Verificar si hay reservas activas que se solapan
        const hasActiveReservations = room.reservations?.some(reservation => {
          if (reservation.status !== 'active') {
            return false;
          }

          const resStart = new Date(reservation.checkInDate);
          const resEnd = new Date(reservation.checkOutDate);

          const hasOverlap = (
            (start < resEnd && end > resStart) || // Solapamiento parcial
            (start >= resStart && end <= resEnd) || // Reserva dentro del rango
            (start <= resStart && end >= resEnd) // Reserva dentro del rango seleccionado
          );

          if (hasOverlap) {
            console.log('Habitación con reserva activa:', {
              roomId: room._id,
              reservationStart: resStart,
              reservationEnd: resEnd
            });
          }

          return hasOverlap;
        });

        if (hasActiveReservations) {
          console.log('Habitación no disponible por reserva activa:', room._id);
          return false;
        }

        console.log('Habitación disponible:', room._id);
        return true;
      });

      console.log('Habitaciones disponibles final:', available.length);
      setAvailableRooms(available);
    } else {
      console.log('No se pueden filtrar habitaciones:', {
        hasStart: !!start,
        hasEnd: !!end,
        hasHotel: !!hotel,
        hasRooms: !!(hotel?.rooms)
      });
      setAvailableRooms([]);
    }
  };

  const handleNewRoomChange = (e) => {
    console.log('Habitación seleccionada:', e.target.value);
    setNewReservationData(prev => ({
      ...prev,
      roomId: e.target.value
    }));
  };

  const handleNewReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newReservationData.userId) {
        toast({
          title: "Error",
          description: "Debes seleccionar un usuario",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!hotel?.uid) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del hotel",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      console.log('Estado actual del formulario:', {
        userId: newReservationData.userId,
        roomId: newReservationData.roomId,
        hotel: hotel.uid,
        checkInDate: newReservationData.checkInDate,
        checkOutDate: newReservationData.checkOutDate,
        guests: newReservationData.guests
      });
      
      // Asegurarnos de que los datos estén en el formato correcto
      const reservationData = {
        userId: newReservationData.userId,
        hotel: hotel.uid,
        room: newReservationData.roomId,
        checkInDate: newReservationData.checkInDate.toISOString(),
        checkOutDate: newReservationData.checkOutDate.toISOString(),
        guests: newReservationData.guests,
        services: newReservationData.services || []
      };

      console.log('Datos formateados para enviar:', reservationData);
      
      const response = await saveReservation(reservationData);
      console.log('Respuesta del servidor:', response);

      if (response.error) {
        throw new Error(response.e.response?.data?.message || 'Error al crear la reservación');
      }

      toast({
        title: "Reserva creada",
        description: "La reserva se ha creado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onNewModalClose();
      const updatedReservations = await getReservations();
      if (updatedReservations) {
        const hotelReservations = updatedReservations.filter(res => 
          res.hotel.uid === hotel.uid
        );
        setReservations(hotelReservations);
        setFilteredReservations(hotelReservations);
      }
    } catch (error) {
      console.error('Error al crear la reservación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateNewNights = () => {
    if (!newReservationData.checkInDate || !newReservationData.checkOutDate) return 0;
    const checkIn = dayjs(newReservationData.checkInDate);
    const checkOut = dayjs(newReservationData.checkOutDate);
    return checkOut.diff(checkIn, 'day');
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <InputGroup w="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar reservaciones..." 
              borderRadius="md"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiFilter />} variant="outline">
              Estado: {statusFilter}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleStatusFilter("Todas")}>Todas</MenuItem>
              <MenuItem onClick={() => handleStatusFilter("Active")}>Activas</MenuItem>
              <MenuItem onClick={() => handleStatusFilter("Completed")}>Completadas</MenuItem>
              <MenuItem onClick={() => handleStatusFilter("Cancelled")}>Canceladas</MenuItem>
            </MenuList>
          </Menu>
          <Select 
            placeholder="Ordenar por" 
            w="180px"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="date-asc">Fecha Check-in (Asc)</option>
            <option value="date-desc">Fecha Check-in (Desc)</option>
            <option value="name">Nombre del Huésped</option>
          </Select>
        </HStack>
        <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={handleNewReservation}>
          Nueva Reservación
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID Reservación</Th>
              <Th>Huésped</Th>
              <Th>Habitación</Th>
              <Th>Check-in</Th>
              <Th>Check-out</Th>
              <Th>Servicios</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredReservations.map((reservation) => (
              <Tr key={reservation._id}>
                <Td>RES-{reservation._id.slice(-8)}</Td>
                <Td>
                  <HStack>
                    <Box>
                      <Text fontWeight="medium">{reservation.user.nombre}</Text>
                      <Text fontSize="xs">{reservation.user.email}</Text>
                    </Box>
                  </HStack>
                </Td>
                <Td>
                  <Box>
                    <Text>{reservation.room.type}</Text>
                    <Text fontSize="xs">${reservation.room.price_per_night}/noche</Text>
                  </Box>
                </Td>
                <Td>{new Date(reservation.checkInDate).toLocaleDateString()}</Td>
                <Td>{new Date(reservation.checkOutDate).toLocaleDateString()}</Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    {reservation.services.map((service) => (
                      <Badge key={service._id} colorScheme="purple">
                        {service.service.name}
                      </Badge>
                    ))}
                  </VStack>
                </Td>
                <Td>
                  <Badge colorScheme={
                    reservation.status === "active" ? "green" :
                    reservation.status === "completed" ? "blue" : "red"
                  }>
                    {reservation.status === "active" ? "Activa" :
                     reservation.status === "completed" ? "Completada" : "Cancelada"}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton 
                      aria-label="Ver detalles" 
                      icon={<FiEye />} 
                      size="sm" 
                      colorScheme="blue" 
                      variant="ghost"
                      onClick={() => handleViewDetails(reservation)}
                    />
                    {reservation.status === "active" && (
                      <>
                        <IconButton 
                          aria-label="Completar reservación" 
                          icon={<FiCheckCircle />} 
                          size="sm" 
                          colorScheme="green" 
                          variant="ghost"
                          onClick={() => handleCompleteReservation(reservation)}
                        />
                        <IconButton 
                          aria-label="Editar reservación" 
                          icon={<FiEdit />} 
                          size="sm" 
                          colorScheme="yellow" 
                          variant="ghost"
                          onClick={() => handleEditClick(reservation)}
                        />
                        <IconButton 
                          aria-label="Eliminar reservación" 
                          icon={<FiTrash2 />} 
                          size="sm" 
                          colorScheme="red" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            onDeleteModalOpen();
                          }}
                        />
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles de la Reservación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReservation && (
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Información del Huésped</Text>
                      <Text>Nombre: {selectedReservation.user.nombre}</Text>
                      <Text>Email: {selectedReservation.user.email}</Text>
                      <Text>Rol: {selectedReservation.user.role}</Text>
                      <Text>Estado: {selectedReservation.user.estado ? "Activo" : "Inactivo"}</Text>
                      <Text>Fecha de registro: {new Date(selectedReservation.user.createdAt).toLocaleDateString()}</Text>
                    </Box>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Detalles de la Habitación</Text>
                      <Text>Tipo: {selectedReservation.room.type}</Text>
                      <Text>Capacidad: {selectedReservation.room.capacity} personas</Text>
                      <Text>Precio por noche: ${selectedReservation.room.price_per_night}</Text>
                      <Text>Estado: {selectedReservation.room.available ? "Disponible" : "No Disponible"}</Text>
                      <Text>ID: {selectedReservation.room.uid}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Fechas</Text>
                      <Text>Check-in: {new Date(selectedReservation.checkInDate).toLocaleDateString()}</Text>
                      <Text>Check-out: {new Date(selectedReservation.checkOutDate).toLocaleDateString()}</Text>
                      <Text>Creada: {new Date(selectedReservation.createdAt).toLocaleDateString()}</Text>
                      <Text>Última actualización: {new Date(selectedReservation.updatedAt).toLocaleDateString()}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Servicios Adicionales</Text>
                      <VStack align="start" spacing={2}>
                        {selectedReservation.services.map((service) => (
                          <HStack key={service._id}>
                            <Text>{service.service.name}</Text>
                            <Badge colorScheme="purple">x{service.quantity}</Badge>
                            <Text>(${service.service.price} c/u)</Text>
                            <Text fontSize="xs" color="gray.500">{service.service.description}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancelar Reservación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Estás seguro que deseas cancelar la reservación de <b>{selectedReservation?.user.nombre}</b> para <b>{selectedReservation && new Date(selectedReservation.checkInDate).toLocaleDateString()}</b>?
            </Text>
            {selectedReservation && new Date(selectedReservation.checkInDate) <= new Date() && (
              <Text mt={4} color="red.500">
                Ten en cuenta que esta reserva está dentro del período de cancelación de 24 horas y puede estar sujeta a cargos.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onDeleteModalClose}>
              Mantener Reserva
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteReservation}
            >
              Sí, Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modificar Reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editData && (
              <form onSubmit={handleEditSubmit}>
                <Stack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Selecciona las fechas</FormLabel>
                    <Box>
                      <DatePicker
                        selected={editData.checkInDate}
                        onChange={handleDateChange}
                        startDate={editData.checkInDate}
                        endDate={editData.checkOutDate}
                        selectsRange
                        inline
                        minDate={new Date()}
                        monthsShown={1}
                        locale={es}
                        dateFormat="dd/MM/yyyy"
                        showPopperArrow={false}
                        calendarStartDay={1}
                      />
                    </Box>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Número de Huéspedes</FormLabel>
                    <Select
                      name="guests"
                      value={editData.guests}
                      onChange={handleGuestsChange}
                    >
                      {[...Array(selectedReservation?.room?.capacity || 0)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'Huésped' : 'Huéspedes'}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                
                  <FormControl>
                    <FormLabel>Servicios Adicionales</FormLabel>
                    <CheckboxGroup 
                      colorScheme="teal" 
                      onChange={handleServicesChange}
                      defaultValue={editData.services.map(s => s.service)}
                    >
                      <Stack spacing={2}>
                        {selectedReservation?.hotel?.services?.map(service => (
                          <Checkbox 
                            key={service._id} 
                            value={service._id}
                            isChecked={editData.services.some(s => s.service === service._id)}
                          >
                            {service.name} - ${service.price}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold">Resumen de la Reserva</Text>
                      
                      <HStack justify="space-between">
                        <Text>Precio por noche</Text>
                        <Text>${selectedReservation?.room?.price_per_night}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Noches</Text>
                        <Text>{calculateNights()}</Text>
                      </HStack>
                      
                      {editData.services.length > 0 && (
                        <>
                          <Divider />
                          <Text fontWeight="medium">Servicios Adicionales:</Text>
                          {editData.services.map(({ service: serviceId }) => {
                            const service = selectedReservation?.hotel?.services?.find(s => s._id === serviceId);
                            return (
                              <HStack key={serviceId} justify="space-between">
                                <Text fontSize="sm">{service?.name}</Text>
                                <Text fontSize="sm">${service?.price}</Text>
                              </HStack>
                            );
                          })}
                        </>
                      )}
                      
                      <Divider />
                      <HStack justify="space-between" fontWeight="bold">
                        <Text>Total</Text>
                        <Text color="teal.500">
                          ${calculateNights() * (selectedReservation?.room?.price_per_night || 0) + 
                            editData.services.reduce((total, { service: serviceId }) => {
                              const service = selectedReservation?.hotel?.services?.find(s => s._id === serviceId);
                              return total + (service?.price || 0);
                            }, 0)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Stack>
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="teal" onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isNewModalOpen} onClose={onNewModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Reservación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleNewReservationSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Buscar Usuario</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiUser} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                    />
                  </InputGroup>
                  {searchResults.length > 0 && (
                    <List
                      mt={2}
                      borderWidth="1px"
                      borderRadius="md"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {searchResults.map((user) => (
                        <ListItem
                          key={user._id}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => handleUserSelect(user)}
                        >
                          <Text fontWeight="medium">{user.nombre}</Text>
                          <Text fontSize="sm" color="gray.600">{user.email}</Text>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {newReservationData.userId && (
                    <Text mt={2} color="green.500">
                      Usuario seleccionado: {userSearchTerm}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Selecciona las fechas</FormLabel>
                  <Box>
                    <DatePicker
                      selected={newReservationData.checkInDate}
                      onChange={handleNewDateChange}
                      startDate={newReservationData.checkInDate}
                      endDate={newReservationData.checkOutDate}
                      selectsRange
                      inline
                      minDate={new Date()}
                      monthsShown={1}
                      locale={es}
                      dateFormat="dd/MM/yyyy"
                      showPopperArrow={false}
                      calendarStartDay={1}
                      onChangeRaw={(e) => e.preventDefault()}
                    />
                  </Box>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Seleccionar Habitación</FormLabel>
                  {availableRooms.length > 0 ? (
                    <Select
                      placeholder="Selecciona una habitación"
                      value={newReservationData.roomId}
                      onChange={handleNewRoomChange}
                      isRequired
                    >
                      {availableRooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.type} - ${room.price_per_night}/noche - Capacidad: {room.capacity} personas
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Text color="gray.500">
                      No hay habitaciones disponibles para las fechas seleccionadas
                    </Text>
                  )}
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Número de Huéspedes</FormLabel>
                  <Select
                    name="guests"
                    value={newReservationData.guests}
                    onChange={(e) => {
                      setNewReservationData(prev => ({
                        ...prev,
                        guests: parseInt(e.target.value)
                      }));
                    }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Servicios Adicionales</FormLabel>
                  <CheckboxGroup 
                    colorScheme="teal" 
                    onChange={(selectedServices) => {
                      setNewReservationData(prev => ({
                        ...prev,
                        services: selectedServices.map(serviceId => ({
                          service: serviceId,
                          quantity: 1
                        }))
                      }));
                    }}
                  >
                    <Stack spacing={2}>
                      {hotel?.services?.map(service => (
                        <Checkbox 
                          key={service._id} 
                          value={service._id}
                        >
                          {service.name} - ${service.price}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold">Resumen de la Reserva</Text>
                    
                    {newReservationData.roomId && (
                      <>
                        <HStack justify="space-between">
                          <Text>Precio por noche</Text>
                          <Text>${availableRooms.find(r => r._id === newReservationData.roomId)?.price_per_night || 0}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>Noches</Text>
                          <Text>{calculateNewNights()}</Text>
                        </HStack>
                        
                        {newReservationData.services.length > 0 && (
                          <>
                            <Divider />
                            <Text fontWeight="medium">Servicios Adicionales:</Text>
                            {newReservationData.services.map(({ service: serviceId }) => {
                              const service = hotel?.services?.find(s => s._id === serviceId);
                              return (
                                <HStack key={serviceId} justify="space-between">
                                  <Text fontSize="sm">{service?.name}</Text>
                                  <Text fontSize="sm">${service?.price}</Text>
                                </HStack>
                              );
                            })}
                          </>
                        )}
                        
                        <Divider />
                        <HStack justify="space-between" fontWeight="bold">
                          <Text>Total</Text>
                          <Text color="teal.500">
                            ${calculateNewNights() * (availableRooms.find(r => r._id === newReservationData.roomId)?.price_per_night || 0) + 
                              newReservationData.services.reduce((total, { service: serviceId }) => {
                                const service = hotel?.services?.find(s => s._id === serviceId);
                                return total + (service?.price || 0);
                              }, 0)}
                          </Text>
                        </HStack>
                      </>
                    )}
                  </VStack>
                </Box>
              </Stack>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNewModalClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={handleNewReservationSubmit}
            >
              Crear Reservación
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReservationsContent; 