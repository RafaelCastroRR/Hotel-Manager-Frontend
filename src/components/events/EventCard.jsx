import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Icon,
  VStack,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiClock, FiMapPin, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import PropTypes from "prop-types";
import { useEvent } from "../../shared/hooks/useEvent";
import { useDisclosure } from "@chakra-ui/react";
import EventForm from "./EventForm";
import { GenericAlert } from "../common/GenericAlert";
import { useState } from "react";

function EventCard({ event, onEventUpdated }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const toast = useToast();
  const { cancelEvent, editEvent } = useEvent();
  const [formData, setFormData] = useState(null);
  const {
    _id,
    nombre_evento,
    descripcion,
    fecha,
    tipo_evento,
    recursos_asignados,
    servicios_adicionales,
    hotel_id,
    estado,
  } = event;

  const cardBg = useColorModeValue("white", "gray.800");
  const badgeBg = useColorModeValue("brand.500", "brand.400");

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const getEventTypeLabel = (type) => {
    const types = {
      Wedding: "Boda",
      Conference: "Conferencia",
      Birthday: "Cumpleaños",
      Gala: "Gala",
      Corporate: "Corporativo",
      Graduation: "Graduación",
      Anniversary: "Aniversario",
    };
    return types[type] || type;
  };

  const handleCancelEvent = async () => {
    try {
      const response = await cancelEvent(_id);
      if (response) {
        toast({
          title: "Evento cancelado",
          description: "El evento ha sido cancelado exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        if (onEventUpdated) {
          onEventUpdated();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar el evento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = (data) => {
    console.log('Datos del formulario recibidos:', data);
    setFormData(data);
    onAlertOpen();
  };

  const handleEditSuccess = async () => {
    console.log('Datos del formulario en handleEditSuccess:', formData);
    
    if (!formData) {
      console.error('No hay datos del formulario');
      return;
    }

    try {
      console.log(formData)
      const response = await editEvent(_id, formData);
      
      if (response) {
        onEditClose();
        onAlertClose();
        setFormData(null);
        if (onEventUpdated) {
          onEventUpdated();
        }
      }
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAlertConfirm = () => {
    console.log('Confirmando edición con datos:', formData);
    handleEditSuccess();
  };

  const handleAlertClose = () => {
    console.log('Cerrando alerta');
    onAlertClose();
  };

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={cardBg}
        boxShadow="md"
        transition="all 0.3s"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "lg",
        }}
      >
        <Box p={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading as="h3" fontSize="lg" noOfLines={1}>
              {nombre_evento}
            </Heading>
            <Badge
              px={2}
              py={1}
              bg={badgeBg}
              color="white"
              borderRadius="full"
              fontSize="xs"
            >
              {getEventTypeLabel(tipo_evento)}
            </Badge>
          </Flex>

          {/* Estado de Aprobación por el Manager del Hotel */}
          <Box mb={3}>
            {event.aprobacion === 'APROBADO' ? (
              <Badge colorScheme="green" px={2.5} py={1} rounded="md" fontSize="xs">
                ✓ Confirmado por el Hotel
              </Badge>
            ) : event.aprobacion === 'RECHAZADO' ? (
              <Badge colorScheme="red" px={2.5} py={1} rounded="md" fontSize="xs">
                ✕ No Disponible / Rechazado
              </Badge>
            ) : (
              <Badge colorScheme="yellow" px={2.5} py={1} rounded="md" fontSize="xs">
                ⏳ Pendiente de Aprobación del Hotel
              </Badge>
            )}
          </Box>

          <Text color="gray.600" fontSize="sm" mb={3} noOfLines={2}>
            {descripcion}
          </Text>

          {(!event.aprobacion || event.aprobacion === 'PENDIENTE') && (
            <Text fontSize="xs" color="yellow.800" bg="yellow.50" p={2} rounded="md" mb={3} borderLeft="3px solid" borderColor="yellow.400">
              El gerente del hotel revisará tu solicitud para confirmar el espacio y recursos.
            </Text>
          )}

          <VStack spacing={2} align="stretch" mb={3}>
            <Flex align="center">
              <Icon as={FiMapPin} color="gray.500" mr={2} boxSize={4} />
              <Text fontSize="sm">
                {hotel_id?.name || "Hotel no especificado"}
              </Text>
            </Flex>

            <Flex align="center">
              <Icon as={FiClock} color="gray.500" mr={2} boxSize={4} />
              <Text fontSize="sm">{formatDate(fecha)}</Text>
            </Flex>
          </VStack>

          <Flex
            justify="space-between"
            align="center"
            mt={2}
            pt={2}
            borderTopWidth={1}
          >
            <Text fontSize="sm" color="gray.500">
              {recursos_asignados.length} recursos •{" "}
              {servicios_adicionales.length} servicios
            </Text>
            <Flex gap={2}>
              <Button
                leftIcon={<FiEye />}
                colorScheme="teal"
                variant="outline"
                size="sm"
                onClick={onOpen}
              >
                Ver Detalles
              </Button>
              {estado !== false && (
                <>
                  <Button
                    leftIcon={<FiEdit2 />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={onEditOpen}
                  >
                    Editar
                  </Button>
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEvent}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Modal de Detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">{nombre_evento}</Heading>
              <Badge
                px={2}
                py={1}
                bg={badgeBg}
                color="white"
                borderRadius="full"
                fontSize="sm"
              >
                {getEventTypeLabel(tipo_evento)}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Descripción
                </Text>
                <Text color="gray.600">{descripcion}</Text>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>
                  Detalles del Evento
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Hotel
                    </Text>
                    <Text>{hotel_id?.name || "Hotel no especificado"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Fecha y Hora
                    </Text>
                    <Text>{formatDate(fecha)}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>
                  Recursos Asignados
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  {recursos_asignados.map((recurso, index) => (
                    <Text key={index} fontSize="sm">
                      • {recurso}
                    </Text>
                  ))}
                </SimpleGrid>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>
                  Servicios Adicionales
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  {servicios_adicionales.map((servicio, index) => (
                    <Text key={index} fontSize="sm">
                      • {servicio}
                    </Text>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <EventForm 
              onSuccess={handleEditSubmit}
              eventData={{
                name: nombre_evento,
                description: descripcion,
                date: new Date(fecha).toISOString().slice(0, 16),
                type: tipo_evento,
                hotel: hotel_id?.uid,
                assignedResources: recursos_asignados || [],
                additionalServices: servicios_adicionales || []
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Alerta de Confirmación */}
      <GenericAlert
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        title="Confirmar Edición"
        description="¿Estás seguro de que deseas guardar los cambios en este evento?"
        confirmButtonText="Guardar"
        confirmButtonColor="blue"
        onConfirm={handleAlertConfirm}
      />
    </>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre_evento: PropTypes.string.isRequired,
    descripcion: PropTypes.string.isRequired,
    fecha: PropTypes.string.isRequired,
    tipo_evento: PropTypes.string.isRequired,
    recursos_asignados: PropTypes.arrayOf(PropTypes.string).isRequired,
    servicios_adicionales: PropTypes.arrayOf(PropTypes.string).isRequired,
    hotel_id: PropTypes.shape({
      uid: PropTypes.string,
      name: PropTypes.string,
    }),
    estado: PropTypes.bool,
  }).isRequired,
  onEventUpdated: PropTypes.func,
};

export default EventCard;
