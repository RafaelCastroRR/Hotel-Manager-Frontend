import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import SidebarPlatform from "../../components/admin/layout/SidebarPlatform";
import Header from "../../components/admin/layout/Header";
import DashboardContent from "../../components/admin/platform/DashboardContent";
import UsersContent from "../../components/admin/platform/UsersContent";
import HotelsContent from "../../components/admin/platform/HotelsContent";
import ReportsContent from "../../components/admin/platform/ReportsContent";

const PlatformDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");

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
    <Box minH="100vh" bg="gray.50">
      <Flex>
        <SidebarPlatform activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} />
        <Box flex="1" ml="240px">
          <Header activeNavItem={activeNavItem} />
          <Box p={8}>
            {renderContent()}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default PlatformDashboard;
