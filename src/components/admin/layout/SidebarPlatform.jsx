import {
  Box,
  Flex,
  Icon,
  Text,
  Heading,
  VStack,
  Divider,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from "@chakra-ui/react";
import { BarChart, HomeIcon, UserIcon, HotelIcon } from "lucide-react";

const NavItem = ({ icon, children, id, activeNavItem, setActiveNavItem, onClose }) => {
  return (
    <Flex
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
        setActiveNavItem(id);
        if (onClose) onClose();
      }}
    >
      <Icon as={icon} mr="4" fontSize="18" />
      <Text fontSize="sm">{children}</Text>
    </Flex>
  );
};

const SidebarPlatformContent = ({ activeNavItem, setActiveNavItem, onClose }) => (
  <>
    <Flex h="20" alignItems="center" justifyContent="center" px={4}>
      <Heading size="md" color="blue.500">Platform Admin Panel</Heading>
    </Flex>
    <VStack spacing={0} align="stretch">
      <NavItem icon={HomeIcon} id="Dashboard" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Dashboard
      </NavItem>
      <NavItem icon={UserIcon} id="Usuarios" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Usuarios
      </NavItem>
      <NavItem icon={HotelIcon} id="Hoteles" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Hoteles
      </NavItem>
      <NavItem icon={BarChart} id="Reportes" activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} onClose={onClose}>
        Reportes
      </NavItem>
      <Divider my={2} />
    </VStack>
  </>
);

const SidebarPlatform = ({ activeNavItem, setActiveNavItem, isOpen = false, onClose }) => {
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
        <SidebarPlatformContent activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bg}>
          <DrawerCloseButton mt={3} />
          <DrawerBody p={0}>
            <SidebarPlatformContent
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

export default SidebarPlatform;
