import {
  Box,
  Flex,
  Icon,
  Text,
  Heading,
  VStack,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from "@chakra-ui/react";
import {
  FiHome,
  FiCalendar,
  FiGrid,
  FiUsers,
  FiDollarSign,
  FiList,
} from "react-icons/fi";
import { UserIcon, BarChart } from "lucide-react";

const NavItem = ({ icon, children, id, activeNavItem, setActiveNavItem, onClose, as, to }) => {
  const Component = as || Flex;

  return (
    <Component
      as={as}
      to={to}
      align="center"
      px="4"
      py="3"
      cursor="pointer"
      role="group"
      fontWeight={activeNavItem === id ? "bold" : "normal"}
      bg={activeNavItem === id ? "blue.50" : "transparent"}
      color={activeNavItem === id ? "blue.500" : "inherit"}
      borderLeft={activeNavItem === id ? "4px solid" : "none"}
      borderColor="blue.500"
      _hover={{
        bg: "blue.50",
        color: "blue.500",
      }}
      onClick={() => {
        if (!as) {
          setActiveNavItem(id);
          if (onClose) onClose();
        }
      }}
    >
      <Icon as={icon} mr="4" fontSize="18" />
      <Text fontSize="sm">{children}</Text>
    </Component>
  );
};

const SidebarContent = ({ activeNavItem, setActiveNavItem, onClose }) => (
  <>
    <Flex h="20" alignItems="center" justifyContent="center" px={4}>
      <Heading size="md" color="blue.500">Hotel Admin</Heading>
    </Flex>
    <VStack spacing={0} align="stretch">
      <NavItem icon={FiHome} id="Dashboard" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Dashboard
      </NavItem>
      <NavItem icon={FiCalendar} id="Reservations" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Reservations
      </NavItem>
      <NavItem icon={FiGrid} id="Rooms" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Rooms
      </NavItem>
      <NavItem icon={FiUsers} id="Events" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Events
      </NavItem>
      <NavItem icon={FiDollarSign} id="Invoices" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Invoices
      </NavItem>
      <NavItem icon={FiList} id="Services" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Services
      </NavItem>
      <NavItem icon={BarChart} id="Reportes" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Reportes
      </NavItem>
      <NavItem icon={UserIcon} id="Usuarios" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Usuarios
      </NavItem>
    </VStack>
  </>
);

const Sidebar = ({ activeNavItem, setActiveNavItem, isOpen = false, onClose }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      <Box
        display={{ base: "none", lg: "block" }}
        w="64"
        bg={bg}
        borderRight="1px"
        borderColor={borderColor}
        pos="fixed"
        h="full"
        zIndex={20}
      >
        <SidebarContent activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bg}>
          <DrawerCloseButton mt={3} />
          <DrawerBody p={0}>
            <SidebarContent
              activeNavItem={activeNavItem}
              setActiveNavItem={setActiveNavItem}
              onClose={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
