/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  useToast,
  Icon,
  Text,
  Box,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { deleteService } from '../../../services/api';
import ServiceForm from './ServiceForm';

const ServicesList = ({ services, refreshServices }) => {
  const toast = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const handleDelete = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de que deseas desactivar este servicio adicional?')) {
      return;
    }
    setDeletingId(serviceId);
    try {
      const response = await deleteService(serviceId);
      
      if (response?.error) {
        throw new Error(response.message || response.msg || 'Error al eliminar el servicio');
      }

      toast({
        title: 'Servicio desactivado',
        description: 'El servicio ha sido removido exitosamente.',
        status: 'success',
        duration: 2500,
      });
      refreshServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error al eliminar',
        description: error.message || 'El servicio no existe o ya fue eliminado',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
  };

  const handleEditComplete = () => {
    setEditingService(null);
    refreshServices();
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'restaurant':
        return <Badge colorScheme="orange">Restaurante</Badge>;
      case 'spa':
        return <Badge colorScheme="purple">Spa & Relax</Badge>;
      case 'room':
        return <Badge colorScheme="blue">Habitación</Badge>;
      case 'event':
        return <Badge colorScheme="teal">Tour / Evento</Badge>;
      default:
        return <Badge colorScheme="gray">Otros</Badge>;
    }
  };

  if (!Array.isArray(services) || services.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200">
        <Icon as={FiTag} boxSize={10} color="gray.300" mb={3} />
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">No hay servicios adicionales registrados</Text>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Crea servicios adicionales para que tus huéspedes puedan agregarlos a sus reservaciones.
        </Text>
      </Box>
    );
  }

  return (
    <>
      <TableContainer bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th fontSize="xs" textTransform="uppercase">Servicio</Th>
              <Th fontSize="xs" textTransform="uppercase">Descripción</Th>
              <Th fontSize="xs" textTransform="uppercase" isNumeric>Tarifa</Th>
              <Th fontSize="xs" textTransform="uppercase">Categoría</Th>
              <Th fontSize="xs" textTransform="uppercase">Disponibilidad</Th>
              <Th fontSize="xs" textTransform="uppercase" textAlign="center">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {services.map((service) => {
              const price = typeof service.price === 'number' ? service.price : parseFloat(service.price || 0);
              return (
                <Tr key={service._id || service.uid} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">{service.name}</Text>
                  </Td>
                  <Td maxW="300px">
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {service.description || 'Sin descripción'}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="black" color="teal.600" fontSize="sm">
                      Q {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </Td>
                  <Td>
                    {getCategoryBadge(service.category)}
                  </Td>
                  <Td>
                    <Badge colorScheme={service.available ? 'green' : 'red'} variant="subtle" px={2} py={0.5} rounded="md">
                      {service.available ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    <HStack spacing={2} justify="center">
                      <IconButton
                        aria-label="Editar servicio"
                        icon={<Icon as={FiEdit2} />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(service)}
                      />
                      <IconButton
                        aria-label="Eliminar servicio"
                        icon={<Icon as={FiTrash2} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        isLoading={deletingId === service._id}
                        onClick={() => handleDelete(service._id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {editingService && (
        <ServiceForm
          editingService={editingService}
          refreshServices={refreshServices}
          onEditComplete={handleEditComplete}
        />
      )}
    </>
  );
};

export default ServicesList;
