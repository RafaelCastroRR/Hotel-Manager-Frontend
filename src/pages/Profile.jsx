import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Avatar,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Stack
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiLock } from 'react-icons/fi'
import useAuthStore from '../shared/stores/authStore'
import useLogin  from '../shared/hooks/useLogin'
import useUsers from '../shared/hooks/useUsers'

function Profile() {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: handleEditClose } = useDisclosure()
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: handlePasswordClose } = useDisclosure()
  const toast = useToast()
  const user = useAuthStore((state) => state.user)
  const updateUserStore = useAuthStore((state) => state.updateUser)
  const { logout } = useLogin()
  const { updateUser, updatePassword } = useUsers()

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBg = useColorModeValue("white", "gray.700")
  const accentColor = "teal.500"

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors, isValid: isEditValid }
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nombre: user?.nombre || "",
      email: user?.email || ""
    }
  })

  const {
    register: passRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passErrors, isValid: isPassValid }
  } = useForm({
    mode: "onChange"
  })

  const onSubmitEdit = async (data) => {
    try {
      await updateUser(user.id, data)
      updateUserStore(data)
      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos han sido actualizados correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      resetEditForm()
      handleEditClose()
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const onSubmitPassword = async (data) => {
    try {
      await updatePassword(user.id, { password: data.password, currentPassword: data.currentPassword })
      resetPasswordForm()
      handlePasswordClose()
      logout()
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const closeEditModal = () => {
    resetEditForm()
    handleEditClose()
  }

  const closePasswordModal = () => {
    resetPasswordForm()
    handlePasswordClose()
  }

  const password = watchPassword("password")

  return (
    <Box bg={bgColor} minH="100vh" pt={24} pb={16}>
      <Container maxW="container.lg">
        <Card bg={cardBg} boxShadow="md" borderRadius="lg">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Información del Perfil</Heading>
              <Button
                leftIcon={<FiEdit2 />}
                colorScheme="teal"
                onClick={onEditOpen}
              >
                Editar Perfil
              </Button>
            </Flex>
          </CardHeader>

          <CardBody>
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "start" }}
            >
              <Avatar
                size="2xl"
                name={user?.nombre || "Usuario"}
                bg={accentColor}
                color="white"
                mb={{ base: 4, md: 0 }}
                mr={{ md: 8 }}
              />

              <Stack spacing={4} flex="1">
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Nombre
                  </Text>
                  <Text fontSize="lg" fontWeight="medium">
                    {user?.nombre || "Usuario"}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.500" fontSize="sm">
                    Email
                  </Text>
                  <Text fontSize="lg">
                    {user?.email || "usuario@ejemplo.com"}
                  </Text>
                </Box>

                <Divider my={2} />

                <Button
                  leftIcon={<FiLock />}
                  variant="outline"
                  colorScheme="teal"
                  onClick={onPasswordOpen}
                  alignSelf="flex-start"
                >
                  Cambiar Contraseña
                </Button>
              </Stack>
            </Flex>
          </CardBody>
        </Card>
      </Container>

      <Modal isOpen={isEditOpen} onClose={closeEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Perfil</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleEditSubmit(onSubmitEdit)}>
            <ModalBody>
              <FormControl isInvalid={editErrors.nombre} mb={4}>
                <FormLabel>Nombre</FormLabel>
                <Input
                  {...editRegister("nombre", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres"
                    }
                  })}
                />
                <FormErrorMessage>
                  {editErrors.nombre?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={editErrors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...editRegister("email", {
                    required: "El email es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de email inválido"
                    }
                  })}
                />
                <FormErrorMessage>
                  {editErrors.email?.message}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeEditModal}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="teal" isDisabled={!isEditValid}>
                Guardar Cambios
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={isPasswordOpen} onClose={closePasswordModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cambiar Contraseña</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
            <ModalBody>
              <FormControl isInvalid={passErrors.currentPassword} mb={4}>
                <FormLabel>Contraseña Actual</FormLabel>
                <Input
                  type="password"
                  {...passRegister("currentPassword", {
                    required: "La contraseña actual es obligatoria"
                  })}
                />
                <FormErrorMessage>
                  {passErrors.currentPassword?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={passErrors.password} mb={4}>
                <FormLabel>Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  {...passRegister("password", {
                    required: "La nueva contraseña es obligatoria",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres"
                    }
                  })}
                />
                <FormErrorMessage>
                  {passErrors.password?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={passErrors.confirmPassword}>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  {...passRegister("confirmPassword", {
                    required: "Debes confirmar la contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden"
                  })}
                />
                <FormErrorMessage>
                  {passErrors.confirmPassword?.message}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closePasswordModal}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="teal" isDisabled={!isPassValid}>
                Actualizar Contraseña
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Profile 