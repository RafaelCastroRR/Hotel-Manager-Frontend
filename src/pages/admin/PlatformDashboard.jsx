import { useState } from "react";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import SidebarPlatform from "../../components/admin/layout/SidebarPlatform";
import Header from "../../components/admin/layout/Header";
import DashboardContent from "../../components/admin/platform/DashboardContent";
import UsersContent from "../../components/admin/platform/UsersContent";
import HotelsContent from "../../components/admin/platform/HotelsContent";
import ReportsContent from "../../components/admin/platform/ReportsContent";

const PlatformDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const renderContent = () => {
    switch (activeNavItem) {
      case "Dashboard":
        return <DashboardContent setActiveNavItem={setActiveNavItem} />;
      case "Usuarios":
        return <UsersContent />;
      case "Hoteles":
        return <HotelsContent />;
      case "Reportes":
        return <ReportsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden">
      <Flex>
        <SidebarPlatform
          activeNavItem={activeNavItem}
          setActiveNavItem={setActiveNavItem}
          isOpen={isOpen}
          onClose={onClose}
        />
        <Box flex="1" ml={{ base: 0, lg: "256px" }} minW={0} w="full">
          <Header activeNavItem={activeNavItem} onOpenMenu={onOpen} />
          <Box p={{ base: 4, md: 6, lg: 8 }}>
            {renderContent()}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default PlatformDashboard;
