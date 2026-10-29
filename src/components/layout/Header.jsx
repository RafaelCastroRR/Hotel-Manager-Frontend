import { useState, useEffect } from 'react'
import { 
  Box, 
  Flex, 
  Button, 
  HStack, 
  Link, 
  useDisclosure,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { BedDoubleIcon } from 'lucide-react'
import useAuthStore from '../../shared/stores/authStore'
import useLogin from '../../shared/hooks/useLogin'

const NavLink = ({ children, to, isActive }) => {
  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded="md"
      position="relative"
      fontWeight="medium"
      color={isActive ? "brand.500" : "gray.600"}
      _hover={{
        textDecoration: 'none',
        color: 'brand.500',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        width: isActive ? '100%' : '0%',
        height: '2px',
        bottom: '-4px',
        left: '0',
        bg: 'brand.500',
        transition: 'width 0.3s ease'
      }}
    >
      {children}
    </Link>
  )
}

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { logout } = useLogin()
  
  const handleScroll = () => {
    const offset = window.scrollY
    if (offset > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const bgColor = useColorModeValue(
    scrolled ? 'white' : 'transparent',
    scrolled ? 'gray.800' : 'transparent'
  )
  
  const textColor = useColorModeValue(
    scrolled || location.pathname !== '/' ? 'gray.700' : 'white',
    scrolled || location.pathname !== '/' ? 'white' : 'white'
  )
  
  const boxShadow = scrolled ? 'md' : 'none'
  
  const isLinkActive = (path) => {
    return location.pathname === path
  }

  const Links = [
    { name: 'Inicio', path: '/' },
    { name: 'Hoteles', path: '/hotels' },
    { name: 'Eventos', path: '/events' },
    { name: 'Mis Reservas', path: '/my-bookings' },
  ]

  return (
    <Box 
      as="header" 
      position="fixed" 
      w="100%" 
      zIndex="999" 
      transition="all 0.3s ease"
      bg={bgColor}
      boxShadow={boxShadow}
    >
      <Flex 
        h={16} 
        alignItems="center" 
        justifyContent="space-between" 
        maxW="1200px" 
        mx="auto" 
        px={4}
      >
        <RouterLink to="/">
          <Flex alignItems="center">
            <BedDoubleIcon size={32} />
            <Box 
              as="span" 
              ml={2} 
              fontSize="xl" 
              fontWeight="bold" 
              color={textColor}
              transition="color 0.3s ease"
            >
              QuickStay
            </Box>
          </Flex>
        </RouterLink>

        <HStack spacing={8} alignItems="center">
          <HStack 
            as="nav" 
            spacing={6} 
            display={{ base: 'none', md: 'flex' }}
          >
            {Links.map((link) => (
              <NavLink key={link.path} to={link.path} isActive={isLinkActive(link.path)}>
                <Box as="span" color={textColor} transition="color 0.3s ease">
                  {link.name}
                </Box>
              </NavLink>
            ))}
          </HStack>
          
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={user?.nombre}
                  src={user?.avatar}
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  as={RouterLink}
                  to="/profile"
                  icon={<FiUser />}
                >
                  Mi Perfil
                </MenuItem>
                {(user?.role === 'ADMIN_ROLE' || user?.role === 'MANAGER_ROLE') && (
                  <MenuItem
                    as={RouterLink}
                    to={user?.role === 'ADMIN_ROLE' ? '/admin/platform' : '/admin/hotel'}
                    icon={<FiSettings />}
                  >
                    Panel de Administración
                  </MenuItem>
                )}
                <MenuItem
                  onClick={logout}
                  icon={<FiLogOut />}
                >
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button 
              as={RouterLink} 
              to="/login"
              variant="solid" 
              size="sm" 
              bg="brand.500" 
              color="white"
              _hover={{ bg: 'brand.600' }}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Login
            </Button>
          )}
        </HStack>

        <IconButton
          aria-label="Open menu"
          fontSize="20px"
          variant="ghost"
          color={textColor}
          icon={<FiMenu />}
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }}
        />

        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="start" mt={4}>
                {Links.map((link) => (
                  <Link key={link.path} as={RouterLink} to={link.path} onClick={onClose}>
                    {link.name}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link as={RouterLink} to="/profile" onClick={onClose}>
                      Mi Perfil
                    </Link>
                    {(user?.role === 'ADMIN_ROLE' || user?.role === 'MANAGER_ROLE') && (
                      <Link 
                        as={RouterLink} 
                        to={user?.role === 'ADMIN_ROLE' ? '/admin/platform' : '/admin/hotel'} 
                        onClick={onClose}
                        color="teal.500"
                        fontWeight="semibold"
                      >
                        Panel de Administración
                      </Link>
                    )}
                    <Button 
                      variant="solid" 
                      size="sm" 
                      colorScheme="red" 
                      w="100%" 
                      onClick={() => {
                        logout()
                        onClose()
                      }}
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button 
                    as={RouterLink} 
                    to="/login"
                    variant="solid" 
                    size="sm" 
                    colorScheme="teal" 
                    w="100%" 
                    onClick={onClose}
                  >
                    Login
                  </Button>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}

export default Header