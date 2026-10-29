import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Input,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import EventCard from "../components/events/EventCard";
import EventForm from "../components/events/EventForm";
import { useEvent } from "../shared/hooks/useEvent";

function Events() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userEvents, setUserEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const toast = useToast();
  const { createEvent, getMyEvents } = useEvent();

  const fetchEvents = async () => {
    try {
      const events = await getMyEvents();
      setUserEvents(events);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (eventData, hotelId) => {
    const response = await createEvent(eventData, hotelId);
    if (response) {
      fetchEvents();
      onClose();
    }
  };

  const filteredEvents = userEvents.filter((event) => {
    const matchesSearch = event.nombre_evento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "" || event.tipo_evento === selectedType;
    return matchesSearch && matchesType;
  });

  const activeEvents = filteredEvents.filter((event) => event.estado !== false);
  const approvedEvents = activeEvents.filter((event) => event.aprobacion === "APROBADO");
  const pendingEvents = activeEvents.filter((event) => !event.aprobacion || event.aprobacion === "PENDIENTE");
  const cancelledEvents = filteredEvents.filter((event) => event.estado === false || event.aprobacion === "RECHAZADO");

  const eventTypes = [
    { value: "", label: "Todos los tipos" },
    { value: "Wedding", label: "Boda" },
    { value: "Conference", label: "Conferencia" },
    { value: "Birthday", label: "Cumpleaños" },
    { value: "Gala", label: "Gala" },
    { value: "Corporate", label: "Corporativo" },
    { value: "Graduation", label: "Graduación" },
    { value: "Anniversary", label: "Aniversario" },
  ];

  return (
    <Box pt={24} pb={16}>
      <Container maxW="1200px">
        <Box mb={8}>
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} mb={3}>
            Mis Eventos
          </Heading>
          <Text color="gray.600">
            Gestiona tus eventos especiales y celebra tus momentos más importantes
          </Text>
        </Box>

        <Flex justify="space-between" align="center" mb={6}>
          <Flex gap={4} flex={1} mr={4}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              maxW="200px"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Flex>
          <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={onOpen}>
            Crear Nuevo Evento
          </Button>
        </Flex>

        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>Todos Activos ({activeEvents.length})</Tab>
            <Tab>Aprobados ({approvedEvents.length})</Tab>
            <Tab>En Revisión ({pendingEvents.length})</Tab>
            <Tab>Cancelados / Rechazados ({cancelledEvents.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Todos Activos */}
            <TabPanel px={0}>
              {activeEvents.length === 0 ? (
                <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="lg">
                  <Heading as="h3" fontSize="lg" mb={2}>
                    No tienes eventos activos
                  </Heading>
                  <Text color="gray.600">
                    Crea tu primer evento haciendo clic en el botón &quot;Crear Nuevo Evento&quot;
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {activeEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onEventUpdated={fetchEvents}
                    />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Aprobados */}
            <TabPanel px={0}>
              {approvedEvents.length === 0 ? (
                <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="lg">
                  <Heading as="h3" fontSize="lg" mb={2}>
                    No tienes eventos aprobados todavía
                  </Heading>
                  <Text color="gray.600">
                    Los eventos aprobados por el hotel aparecerán aquí.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {approvedEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onEventUpdated={fetchEvents}
                    />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* En Revisión */}
            <TabPanel px={0}>
              {pendingEvents.length === 0 ? (
                <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="lg">
                  <Heading as="h3" fontSize="lg" mb={2}>
                    No tienes eventos en revisión
                  </Heading>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {pendingEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onEventUpdated={fetchEvents}
                    />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Cancelados / Rechazados */}
            <TabPanel px={0}>
              {cancelledEvents.length === 0 ? (
                <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="lg">
                  <Heading as="h3" fontSize="lg" mb={2}>
                    No tienes eventos cancelados o rechazados
                  </Heading>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {cancelledEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onEventUpdated={fetchEvents}
                    />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Modal para crear evento */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <EventForm onSuccess={handleCreateEvent} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Events;
