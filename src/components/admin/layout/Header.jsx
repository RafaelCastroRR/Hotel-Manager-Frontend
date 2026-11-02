import {
  Flex,
  HStack,
  Heading,
  Button,
  Avatar,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiChevronDown, FiMenu } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import useAuthStore from "../../../shared/stores/authStore";
import useLogin from "../../../shared/hooks/useLogin";

const Header = ({ activeNavItem, onOpenMenu }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const user = useAuthStore((state) => state.user);
  const { logout } = useLogin();

  return (
    <Flex
      bg={bg}
      px={{ base: 3, md: 4 }}
      py="4"
      borderBottom="1px"
      borderColor={borderColor}
      justify="space-between"
      align="center"
      mb="4"
      gap={2}
    >
      <HStack spacing={2}>
        {onOpenMenu && (
          <IconButton
            display={{ base: "flex", lg: "none" }}
            icon={<FiMenu />}
            variant="ghost"
            onClick={onOpenMenu}
            aria-label="Abrir menú"
          />
        )}
        <Heading size={{ base: "sm", md: "md" }} noOfLines={1}>
          {activeNavItem}
        </Heading>
      </HStack>

      <HStack spacing={{ base: 2, md: 4 }}>
        <Menu>
          <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="ghost" px={{ base: 2, md: 4 }}>
            <HStack>
              <Avatar
                size="sm"
                name={user?.nombre}
                src={user?.avatar}
              />
              <Box textAlign="left" display={{ base: "none", sm: "block" }}>
                <Text fontWeight="bold" fontSize="sm">Hotel Manager</Text>
                <Text fontSize="xs" color="gray.500" maxW="160px" isTruncated>{user?.email}</Text>
              </Box>
            </HStack>
          </MenuButton>
          <MenuList zIndex={30}>
            <MenuItem as={RouterLink} to="/profile">Perfil</MenuItem>
            <MenuItem as={RouterLink} to="/">Ir al Inicio</MenuItem>
            <MenuItem onClick={logout}>Cerrar Sesión</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default Header;
