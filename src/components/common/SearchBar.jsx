import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi'
import { useSearch } from '../../shared/context/SearchContext'
import { useLocation } from 'react-router-dom'

function SearchBar() {
  const location = useLocation()
  const { searchParams, updateSearch } = useSearch()
  const [values, setValues] = useState(searchParams)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()

  // Actualizar valores locales cuando cambien los parámetros de búsqueda
  useEffect(() => {
    setValues(searchParams)
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateDates = () => {
    // Si no se proporcionaron fechas, permitir búsqueda libre por destino
    if (!values.checkIn && !values.checkOut) {
      return true
    }

    if ((values.checkIn && !values.checkOut) || (!values.checkIn && values.checkOut)) {
      toast({
        title: "Fechas incompletas",
        description: "Por favor selecciona tanto fecha de entrada como de salida, o déjalas en blanco para buscar en cualquier fecha",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    const checkIn = new Date(values.checkIn)
    const checkOut = new Date(values.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      toast({
        title: "Fecha inválida",
        description: "La fecha de entrada no puede ser anterior a hoy",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    if (checkIn >= checkOut) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de salida debe ser posterior a la fecha de entrada",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    return true
  }

  const validateGuests = () => {
    const guests = parseInt(values.guests)
    if (isNaN(guests) || guests < 1 || guests > 10) {
      toast({
        title: "Número de huéspedes inválido",
        description: "El número de huéspedes debe estar entre 1 y 10",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateDates() || !validateGuests()) {
      return
    }

    // Asegurarse de que los valores sean strings
    const formattedValues = {
      ...values,
      guests: values.guests.toString()
    }

    // Si estamos en la página de detalles, solo actualizar el estado
    if (location.pathname.includes('/hotels/')) {
      updateSearch(formattedValues)
      return
    }

    // Para otras páginas, actualizar y navegar
    updateSearch(formattedValues)
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        align="center"
      >
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiMapPin color="gray.300" />
          </InputLeftElement>
          <Input
            name="destination"
            placeholder="¿A dónde vas?"
            value={values.destination}
            onChange={handleChange}
            bg={bgColor}
            borderColor={borderColor}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiCalendar color="gray.300" />
          </InputLeftElement>
          <Input
            name="checkIn"
            type="date"
            placeholder="Entrada"
            value={values.checkIn}
            onChange={handleChange}
            bg={bgColor}
            borderColor={borderColor}
            min={new Date().toISOString().split('T')[0]}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiCalendar color="gray.300" />
          </InputLeftElement>
          <Input
            name="checkOut"
            type="date"
            placeholder="Salida"
            value={values.checkOut}
            onChange={handleChange}
            bg={bgColor}
            borderColor={borderColor}
            min={values.checkIn || new Date().toISOString().split('T')[0]}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiUsers color="gray.300" />
          </InputLeftElement>
          <Input
            name="guests"
            type="number"
            min="1"
            max="10"
            value={values.guests}
            onChange={handleChange}
            bg={bgColor}
            borderColor={borderColor}
            required
          />
        </InputGroup>

        <Button
          type="submit"
          colorScheme="teal"
          px={8}
          w={{ base: 'full', md: 'auto' }}
        >
          Buscar
        </Button>
      </Stack>
    </Box>
  )
}

export default SearchBar