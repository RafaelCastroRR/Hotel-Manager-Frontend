import { useState, useEffect, useRef } from "react";
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
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { useInvoices } from "../../../shared/hooks/useInvoices";
import useHotel from "../../../shared/hooks/useHotel";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoiceTemplate from './InvoiceTemplate';

const InvoicesContent = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [dateRange, setDateRange] = useState("today");
  const { getInvoices } = useInvoices();
  const { getHotelsByAdmin } = useHotel();
  const [hotel, setHotel] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const componentRef = useRef();

  const generatePDF = async () => {
    if (!componentRef.current) return;

    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      console.log(selectedInvoice);
      pdf.save(`Factura-Hotel-${selectedInvoice._id.slice(-8)}.pdf`);
      
      onClose();
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelData = await getHotelsByAdmin();
        setHotel(hotelData);
        if (hotelData?.uid) {
          const invoicesData = await getInvoices(hotelData.uid);
          setInvoices(invoicesData);
          setFilteredInvoices(invoicesData);
        }
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterInvoices(value, statusFilter, dateRange);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterInvoices(searchTerm, status, dateRange);
  };

  const handleDateRange = (range) => {
    setDateRange(range);
    filterInvoices(searchTerm, statusFilter, range);
  };

  const filterInvoices = (search, status, range) => {
    let filtered = invoices;

    if (search) {
      filtered = filtered.filter(invoice => 
        invoice.reservation.user.nombre.toLowerCase().includes(search.toLowerCase()) ||
        invoice.reservation.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "Todas") {
      filtered = filtered.filter(invoice => invoice.statusInvoice === status.toUpperCase());
    }


    setFilteredInvoices(filtered);
  };

  const formatCurrency = (value) => {
    if (!value) return "$0.00";
    
    // Manejar valores que vienen como $numberDecimal
    let numericValue;
    if (typeof value === 'object' && value.$numberDecimal) {
      numericValue = parseFloat(value.$numberDecimal);
    } else {
      numericValue = parseFloat(value);
    }
    
    if (isNaN(numericValue)) return "$0.00";
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numericValue);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
    setTimeout(() => {
      generatePDF();
    }, 100);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <InputGroup w={{ base: "full", sm: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar facturas..." 
              borderRadius="md"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
        </HStack>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID Factura</Th>
              <Th>Huésped</Th>
              <Th>Habitación</Th>
              <Th>Fechas</Th>
              <Th>Servicios</Th>
              <Th>Total</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredInvoices.map((invoice) => (
              <Tr key={invoice._id}>
                <Td>{invoice._id}</Td>
                <Td>
                  <Box>
                    <Text fontWeight="medium">{invoice.reservation.user.nombre}</Text>
                    <Text fontSize="xs">{invoice.reservation.user.email}</Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Text>{invoice.reservation.room.type}</Text>
                    <Text fontSize="xs">{invoice.nights} noches</Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    <Text fontSize="sm">{new Date(invoice.reservation.checkInDate).toLocaleDateString()}</Text>
                    <Text fontSize="sm">{new Date(invoice.reservation.checkOutDate).toLocaleDateString()}</Text>
                  </Box>
                </Td>
                <Td>
                  <Box>
                    {invoice.services.map((service, index) => (
                      <Text key={index} fontSize="sm">
                        {service.name} - {formatCurrency(service.price)} - Total: {formatCurrency(service.total)}
                      </Text>
                    ))}
                  </Box>
                </Td>
                <Td>
                  <Text fontWeight="bold">{formatCurrency(invoice.total_pagar)}</Text>
                  <Text fontSize="xs" color="gray.500">
                    Habitación: {formatCurrency(invoice.roomTotal)}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme={invoice.statusInvoice === "PAID" ? "green" : "yellow"}>
                    {invoice.statusInvoice === "PAID" ? "Pagada" : "Pendiente"}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton 
                      aria-label="Imprimir factura" 
                      icon={<FiDownload />} 
                      size="sm" 
                      colorScheme="purple" 
                      variant="ghost"
                      onClick={() => handlePrintInvoice(invoice)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vista Previa de Factura</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoice && (
              <InvoiceTemplate ref={componentRef} data={selectedInvoice} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InvoicesContent; 