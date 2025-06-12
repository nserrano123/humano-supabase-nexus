import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import JobPositions from "./pages/JobPositions";
import Recruitment from "./pages/Recruitment";
import RecruitmentDetails from "./pages/RecruitmentDetails";
import Agents from "./pages/Agents";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/candidates" element={
            <Layout>
              <Candidates />
            </Layout>
          } />
          <Route path="/jobs" element={
            <Layout>
              <JobPositions />
            </Layout>
          } />
          <Route path="/recruitment" element={
            <Layout>
              <Recruitment />
            </Layout>
          } />
          <Route path="/agents" element={
            <Layout>
              <Agents />
            </Layout>
          } />
          <Route path="/recruitment-details/:jobPositionId" element={
            <Layout>
              <RecruitmentDetails />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
