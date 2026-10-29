import { useState, useEffect } from "react";
import {
  Box,
  Spinner,
  Flex,
  Divider,
  Text,
  useToast,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  Badge,
  HStack,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import useHotelEvents from "../../../shared/hooks/useHotelEvents";

import EventsHeader from "./EventsHeader";
import EventCard from "./EventCard";
import EventFormModal from "./EventFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EventDetailsModal from "./EventDetailsModal";

const EventsContent = () => {
  const {
    events,
    loading,
    hotelId,
    hotel,
    createEvent,
    updateEvent,
    updateEventApproval,
    deleteEvent,
    getEventDetails,
    eventDetails,
    fetchEvents,
  } = useHotelEvents();

  const toast = useToast();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalTab, setApprovalTab] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("Todos los Eventos");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre_evento: "",
    descripcion: "",
    fecha: "",
    recursos_asignados: [],
    tipo_evento: "",
    estado: true,
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [deleteTargetEventId, setDeleteTargetEventId] = useState(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

  useEffect(() => {
    let list = [...events];

    // Filtro por pestaña de aprobación
    if (approvalTab !== "TODOS") {
      list = list.filter(e => (e.aprobacion || "PENDIENTE") === approvalTab);
    }

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.nombre_evento.toLowerCase().includes(term) ||
          (e.descripcion && e.descripcion.toLowerCase().includes(term)) ||
          (e.tipo_evento && e.tipo_evento.toLowerCase().includes(term)) ||
          (e.user?.nombre && e.user.nombre.toLowerCase().includes(term))
      );
    }

    // Filtro por tipo de evento
    if (typeFilter) {
      list = list.filter((e) => e.tipo_evento === typeFilter);
    }

    // Ordenamiento
    list.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.fecha) - new Date(b.fecha);
        case "date-desc":
          return new Date(b.fecha) - new Date(a.fecha);
        case "name":
          return a.nombre_evento.localeCompare(b.nombre_evento);
        default:
          return 0;
      }
    });

    setFilteredEvents(list);
  }, [events, searchTerm, approvalTab, typeFilter, sortBy]);

  const pendingCount = events.filter(e => (e.aprobacion || "PENDIENTE") === "PENDIENTE").length;
  const approvedCount = events.filter(e => e.aprobacion === "APROBADO").length;
  const rejectedCount = events.filter(e => e.aprobacion === "RECHAZADO").length;

  const openAddEventModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      nombre_evento: "",
      descripcion: "",
      fecha: "",
      recursos_asignados: [],
      tipo_evento: "",
      estado: true,
    });
    setEditingEventId(null);
  };

  const handleSubmit = async (eventId, formattedData) => {
    if (!formattedData.nombre_evento || !formattedData.fecha) {
      toast({
        title: "Campos obligatorios",
        description: "Nombre del evento y fecha son obligatorios.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let success;
    if (eventId) {
      success = await updateEvent(eventId, formattedData);
    } else {
      success = await createEvent(formattedData);
    }

    if (success) {
      fetchEvents(hotelId);
      closeFormModal();
    }
  };

  const openDeleteConfirmation = (eventId) => {
    setDeleteTargetEventId(eventId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetEventId(null);
  };

  const handleDelete = async () => {
    if (deleteTargetEventId) {
      const success = await deleteEvent(deleteTargetEventId);
      if (success) {
        fetchEvents(hotelId);
      }
      closeDeleteModal();
    }
  };

  const openDetailsModal = async (eventId) => {
    setSelectedEventForDetails(eventId);
    await getEventDetails(eventId);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEventForDetails(null);
  };

  return (
    <Box mt={2} p={{ base: 4, md: 6 }}>
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="2xl" fontWeight="black" color="gray.800">
            Gestión y Aprobación de Eventos
          </Text>
          <Text fontSize="sm" color="gray.600">
            Revisa, aprueba o rechaza las solicitudes de eventos realizadas por clientes para tu hotel.
          </Text>
        </Box>
      </Flex>

      {/* Tarjetas de Resumen de Aprobación */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="yellow.200" rounded="lg">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="yellow.700" fontWeight="bold">Pendientes de Aprobación</StatLabel>
              <StatNumber color="yellow.500" fontSize="3xl">{pendingCount}</StatNumber>
              <Text fontSize="xs" color="gray.500">Requieren tu confirmación</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="green.200" rounded="lg">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="green.700" fontWeight="bold">Eventos Aprobados</StatLabel>
              <StatNumber color="green.500" fontSize="3xl">{approvedCount}</StatNumber>
              <Text fontSize="xs" color="gray.500">Confirmados y reservados</Text>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200" rounded="lg">
          <CardBody p={4}>
            <Stat>
              <StatLabel color="gray.700" fontWeight="bold">Total de Solicitudes</StatLabel>
              <StatNumber color="blue.600" fontSize="3xl">{events.length}</StatNumber>
              <Text fontSize="xs" color="gray.500">Histórico del hotel</Text>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Pestañas de Aprobación */}
      <Tabs 
        variant="soft-rounded" 
        colorScheme="teal" 
        mb={5}
        onChange={(index) => {
          const map = ["TODOS", "PENDIENTE", "APROBADO", "RECHAZADO"];
          setApprovalTab(map[index] || "TODOS");
        }}
      >
        <TabList gap={2} flexWrap="wrap">
          <Tab fontWeight="semibold">Todos ({events.length})</Tab>
          <Tab fontWeight="semibold">
            Pendientes
            {pendingCount > 0 && (
              <Badge ml={2} colorScheme="yellow" rounded="full" px={2}>
                {pendingCount}
              </Badge>
            )}
          </Tab>
          <Tab fontWeight="semibold">Aprobados ({approvedCount})</Tab>
          <Tab fontWeight="semibold">Rechazados ({rejectedCount})</Tab>
        </TabList>
      </Tabs>

      <EventsHeader
        searchTerm={searchTerm}
        handleSearch={setSearchTerm}
        statusFilter={statusFilter}
        handleStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        handleTypeFilter={setTypeFilter}
        sortBy={sortBy}
        handleSort={setSortBy}
        onAddEvent={openAddEventModal}
      />

      {loading ? (
        <Flex justify="center" align="center" minH="250px">
          <Spinner size="xl" thickness="4px" speed="0.7s" color="teal.500" />
        </Flex>
      ) : filteredEvents.length === 0 ? (
        <Card bg="white" p={8} textAlign="center" rounded="lg" borderWidth="1px" borderColor="gray.200">
          <Text color="gray.500" fontSize="md">
            No se encontraron eventos en este criterio de búsqueda o estado de aprobación.
          </Text>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={handleSubmit}
              onDelete={openDeleteConfirmation}
              onDetails={openDetailsModal}
              onApprove={updateEventApproval}
            />
          ))}
        </SimpleGrid>
      )}

      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        form={form}
        editingEventId={editingEventId}
        onSuccess={handleSubmit}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        eventDetails={eventDetails}
        loadingDetails={loading}
      />
    </Box>
  );
};

export default EventsContent;
