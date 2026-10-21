import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { MarketProvider } from '@/context/MarketContext';
import ScrollToTop from './components/ScrollToTop';

// Add page imports here
import Layout from '@/components/site/Layout';
import Home from '@/pages/Home';
import Promotions from '@/pages/Promotions';
import Stores from '@/pages/Stores';
import StoreDetail from '@/pages/StoreDetail';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Careers from '@/pages/Careers';
import JobDetail from '@/pages/JobDetail';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLogin from '@/pages/admin/AdminLogin';

function App() {
  return (
    <MarketProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/:tab" element={<AdminDashboard />} />
            <Route path="/admin/:tab/:action" element={<AdminDashboard />} />
            <Route path="/admin/:tab/:action/:id" element={<AdminDashboard />} />

            {/* Auth routes - redirect /login to Admin Login */}
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />

            {/* Main app routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:slug" element={<StoreDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/:slug" element={<JobDetail />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </MarketProvider>
  );
}

export default App;