import React from "react";
import { Box, Flex, Text, Link, Icon } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaGithub } from "react-icons/fa";

// Animación de loop infinito continuo sin saltos bruscos
const marqueeSmooth = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
`;

export default function DemoCredentialsBanner() {
  const content = (
    <Flex align="center" gap={3} px={10} flexShrink={0}>
      <Text as="span" fontSize="lg">🔑</Text>
      <Text as="span" fontSize="md" fontWeight="semibold" letterSpacing="wide">
        ¿Buscando credenciales de prueba? Las cuentas y contraseñas de demo (Admin, Hotel Managers y Clientes) están disponibles en GitHub:
      </Text>
      <Link
        href="https://github.com/RafaelCastroRR/Hotel-Manager-Frontend#--cuentas-de-prueba-para-testing-credenciales-de-demostración"
        target="_blank"
        rel="noopener noreferrer"
        display="inline-flex"
        alignItems="center"
        gap={2}
        bg="whiteAlpha.200"
        px={3}
        py={1}
        borderRadius="full"
        textDecoration="none"
        fontWeight="bold"
        fontSize="sm"
        color="yellow.300"
        border="1px solid"
        borderColor="yellow.300"
        _hover={{ bg: "yellow.300", color: "gray.900", textDecoration: "none" }}
        transition="all 0.2s ease"
      >
        <Icon as={FaGithub} boxSize={4} />
        <span>Ver Credenciales en GitHub →</span>
      </Link>
    </Flex>
  );

  return (
    <Box
      w="100%"
      bg="teal.700"
      color="white"
      overflow="hidden"
      position="sticky"
      top="0"
      zIndex="1500"
      py={3}
      boxShadow="md"
      borderBottom="1px solid"
      borderColor="teal.500"
    >
      <Flex
        as="div"
        w="max-content"
        willChange="transform"
        animation={`${marqueeSmooth} 45s linear infinite`}
        _hover={{ animationPlayState: "paused" }}
        cursor="pointer"
      >
        {content}
        {content}
      </Flex>
    </Box>
  );
}
