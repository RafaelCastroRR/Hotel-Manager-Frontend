import React from "react";
import { Box, Flex, Text, Link, Icon } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaGithub } from "react-icons/fa";

const marqueeAnimation = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

export default function DemoCredentialsBanner() {
  return (
    <Box
      w="100%"
      bg="teal.600"
      color="white"
      overflow="hidden"
      whiteSpace="nowrap"
      position="sticky"
      top="0"
      zIndex="1500"
      py={2}
      boxShadow="sm"
      fontSize="sm"
      fontWeight="medium"
    >
      <Flex
        as="div"
        align="center"
        display="inline-flex"
        animation={`${marqueeAnimation} 25s linear infinite`}
        _hover={{ animationPlayState: "paused" }}
        cursor="pointer"
      >
        <Flex align="center" gap={2} px={6}>
          <Icon as={FaGithub} boxSize={4} />
          <Text as="span">
            🔑 <strong>¿Buscando credenciales de prueba?</strong> Las cuentas y contraseñas de demo (Admin, Hotel Managers y Clientes) se encuentran disponibles en nuestro repositorio de GitHub:
          </Text>
          <Link
            href="https://github.com/RafaelCastroRR/Hotel-Manager-Frontend#--cuentas-de-prueba-para-testing-credenciales-de-demostración"
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            fontWeight="bold"
            _hover={{ color: "yellow.200" }}
          >
            Ver Credenciales en GitHub →
          </Link>
        </Flex>

        <Flex align="center" gap={2} px={6}>
          <Icon as={FaGithub} boxSize={4} />
          <Text as="span">
            🔑 <strong>¿Buscando credenciales de prueba?</strong> Las cuentas y contraseñas de demo (Admin, Hotel Managers y Clientes) se encuentran disponibles en nuestro repositorio de GitHub:
          </Text>
          <Link
            href="https://github.com/RafaelCastroRR/Hotel-Manager-Frontend#--cuentas-de-prueba-para-testing-credenciales-de-demostración"
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            fontWeight="bold"
            _hover={{ color: "yellow.200" }}
          >
            Ver Credenciales en GitHub →
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
