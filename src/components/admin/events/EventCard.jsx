import {
  Box,
  Badge,
  Text,
  HStack,
  IconButton,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { FiEye, FiEdit, FiTrash2, FiCheck, FiX, FiUser, FiCalendar, FiClock } from "react-icons/fi";
import PropTypes from "prop-types";
import { useState } from "react";
import EventForm from "../../events/EventForm";
import { GenericAlert } from "../../common/GenericAlert";

const EventCard = ({ event, onEdit, onDelete, onDetails, onApprove }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const eventTypes = [
    { value: "Wedding", label: "Boda" },
    { value: "Conference", label: "Conferencia" },
    { value: "Birthday", label: "Cumpleaños" },
    { value: "Gala", label: "Gala" },
    { value: "Corporate", label: "Corporativo" },
    { value: "Graduation", label: "Graduación" },
    { value: "Anniversary", label: "Aniversario" },
  ];

  const getTypeColorScheme = (type) => {
    switch (type) {
      case "Conference": return "blue";
      case "Wedding": return "purple";
      case "Birthday": return "green";
      case "Gala": return "orange";
      case "Corporate": return "teal";
      case "Graduation": return "pink";
      case "Anniversary": return "yellow";
      default: return "gray";
    }
  };

  const getApprovalBadge = () => {
    const estado = event.aprobacion || "PENDIENTE";
    switch (estado) {
      case "APROBADO":
        return <Badge colorScheme="green" px={2.5} py={0.5} rounded="full">Aprobado</Badge>;
      case "RECHAZADO":
        return <Badge colorScheme="red" px={2.5} py={0.5} rounded="full">Rechazado</Badge>;
      case "PENDIENTE":
      default:
        return <Badge colorScheme="yellow" px={2.5} py={0.5} rounded="full">Pendiente de Aprobación</Badge>;
    }
  };

  const handleEditSubmit = (data) => {
    setFormData(data);
    setIsAlertOpen(true);
  };

  const handleEditSuccess = async () => {
    if (!formData) return;
    try {
      await onEdit(event._id, formData);
      setIsEditOpen(false);
      setIsAlertOpen(false);
      setFormData(null);
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
    }
  };

  return (
    <>
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="xl"
        bg="white"
        _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
        transition="all 0.2s ease-in-out"
        borderColor={event.aprobacion === "PENDIENTE" ? "yellow.300" : "gray.200"}
        position="relative"
      >
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Box flex="1" mr={2}>
            <Text fontSize="lg" fontWeight="bold" color="blue.800" noOfLines={1}>
              {event.nombre_evento}
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme={getTypeColorScheme(event.tipo_evento)} px={2} py={0.5} borderRadius="md" fontSize="xs">
                {eventTypes.find(type => type.value === event.tipo_evento)?.label || event.tipo_evento}
              </Badge>
              {getApprovalBadge()}
            </HStack>
          </Box>
        </Flex>

        <Text fontSize="sm" color="gray.600" mb={3} noOfLines={2}>
          {event.descripcion || "Sin descripción."}
        </Text>

        <VStack spacing={1.5} align="stretch" mb={4} bg="gray.50" p={3} rounded="md">
          <HStack color="gray.700" fontSize="xs">
            <Icon as={FiCalendar} color="teal.500" />
            <Text><strong>Fecha:</strong> {new Date(event.fecha).toLocaleDateString()} {new Date(event.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </HStack>
          {event.user && (
            <HStack color="gray.700" fontSize="xs">
              <Icon as={FiUser} color="teal.500" />
              <Text><strong>Cliente:</strong> {event.user.nombre || event.user.name || event.user.email || "Usuario registrado"}</Text>
            </HStack>
          )}
        </VStack>

        {/* Acciones de Aprobación por el Gerente */}
        <Box pt={2} borderTop="1px" borderColor="gray.100">
          <Flex justify="space-between" align="center" gap={2}>
            <HStack spacing={1.5}>
              {event.aprobacion !== "APROBADO" && (
                <Button
                  size="xs"
                  colorScheme="green"
                  leftIcon={<FiCheck />}
                  onClick={() => onApprove && onApprove(event._id, "APROBADO")}
                >
                  Aprobar
                </Button>
              )}
              {event.aprobacion !== "RECHAZADO" && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FiX />}
                  onClick={() => onApprove && onApprove(event._id, "RECHAZADO")}
                >
                  Rechazar
                </Button>
              )}
            </HStack>

            <HStack spacing={1}>
              <IconButton
                aria-label="Ver detalles"
                icon={<FiEye />}
                size="xs"
                colorScheme="blue"
                variant="ghost"
                onClick={() => onDetails(event._id)}
              />
              <IconButton
                aria-label="Editar evento"
                icon={<FiEdit />}
                size="xs"
                colorScheme="yellow"
                variant="ghost"
                onClick={() => setIsEditOpen(true)}
              />
              <IconButton
                aria-label="Eliminar evento"
                icon={<FiTrash2 />}
                size="xs"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(event._id)}
              />
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <EventForm 
              onSuccess={handleEditSubmit}
              eventData={{
                name: event.nombre_evento,
                description: event.descripcion,
                date: new Date(event.fecha).toISOString().slice(0, 16),
                type: event.tipo_evento,
                assignedResources: event.recursos_asignados || [],
                additionalServices: event.servicios_adicionales || []
              }}
              isAdmin={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Alerta de Confirmación */}
      <GenericAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Confirmar Edición"
        description="¿Estás seguro de que deseas guardar los cambios en este evento?"
        confirmButtonText="Guardar"
        confirmButtonColor="blue"
        onConfirm={handleEditSuccess}
      />
    </>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre_evento: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    fecha: PropTypes.string.isRequired,
    tipo_evento: PropTypes.string,
    aprobacion: PropTypes.string,
    recursos_asignados: PropTypes.arrayOf(PropTypes.string),
    servicios_adicionales: PropTypes.arrayOf(PropTypes.string),
    user: PropTypes.object,
    hotel_id: PropTypes.any
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired,
  onApprove: PropTypes.func
};

export default EventCard;
