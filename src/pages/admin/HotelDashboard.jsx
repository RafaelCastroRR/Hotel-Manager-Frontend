import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../../components/admin/layout/Sidebar";
import Header from "../../components/admin/layout/Header";
import DashboardContent from "../../components/admin/dashboard/DashboardContent";
import ReservationsContent from "../../components/admin/reservations/ReservationsContent";
import RoomsContent from "../../components/admin/rooms/RoomsContent";
import EventsContent from "../../components/admin/events/EventsContent";
import InvoicesContent from "../../components/admin/invoices/InvoicesContent";
import ServicesContent from "../../components/admin/services/ServicesContent";
import ReportsContent from "../../components/admin/platform/ReportsContent";
import UsersContent from "../../components/admin/users/UsersContent";
const HotelDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");

  const renderContent = () => {
    switch (activeNavItem) {
      case "Dashboard":
        return <DashboardContent setActiveNavItem={setActiveNavItem} />;
      case "Reservations":
        return <ReservationsContent />;
      case "Rooms":
        return <RoomsContent />;
      case "Events":
        return <EventsContent />;
      case "Invoices":
        return <InvoicesContent />;
      case "Services":
        return <ServicesContent />;
      case "Analytics":
        return <DashboardContent />;
      case "Settings":
        return <DashboardContent />;
      case "Logout":
        return <DashboardContent />;
      case "Reportes":
        return <ReportsContent/>
      case "Usuarios":
        return <UsersContent/>
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Flex>
        <Sidebar activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} />
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

export default HotelDashboard;