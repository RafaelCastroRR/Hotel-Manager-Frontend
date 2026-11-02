import { useState } from "react";
import {
  Box,
  Heading,
  Grid,
  Select,
  Flex,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import useAuthStore from "./../../../shared/stores/authStore";
import useStats from "../../../shared/hooks/useStats.js";

import BusyHotels from "../reports/admin/BusyHotels.jsx";
import RoomsChart from "../reports/manager/RoomsChart.jsx";
import MonthlyReservations from "../reports/manager/MonthlyReservations.jsx";
import StatsCards from "../reports/StatsCards.jsx";

const ReportsContent = () => {
  const { user } = useAuthStore();
  const { stats, loading, refetch } = useStats();
  const [timeRange, setTimeRange] = useState("year");
  const [hotelFilter, setHotelFilter] = useState("all");

  const bg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const titleColor = useColorModeValue("teal.600", "teal.300");

  if (loading) {
    return (
      <Box minH="100vh" bg={bg}>
        <Box ml={{ base: 0, md: 60 }} p={8}>
          <Heading mb={6}>Cargando reportes...</Heading>
        </Box>
      </Box>
    );
  }
  console.log("stats:", stats);
  console.log("stats.monthlyStats:", stats.monthlyStats);
  console.log("user.role:", user.role);
  console.log("stats.hotelOccupancy:", stats.hotelOccupancy);
  console.log("stats.monthlyStats:", stats.monthlyStats);
  console.log("user:", user);


  return (
    <Box p={{ base: 0, md: 2 }}>
      <Heading mb={6}>Reportes Avanzados</Heading>
      <Divider my={8} borderColor="gray.300" />


      {user.role === "ADMIN_ROLE" && stats?.hotelOccupancy && (
        <Box my={6}>
          <BusyHotels data={stats.hotelOccupancy} />
        </Box>
      )}

      {user?.role?.includes("MANAGER_ROLE") && stats?.monthlyStats && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <MonthlyReservations data={stats.monthlyStats} />
          <RoomsChart
            occupied={stats.roomsOccupied}
            available={stats.roomsAvailable}
          />
        </Grid>
      )}

      <Divider my={8} borderColor="gray.300" />
      {stats && <StatsCards stats={stats} role={user.role} />}
    </Box>
  );
};

export default ReportsContent;
