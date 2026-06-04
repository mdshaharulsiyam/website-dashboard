import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

import DashboardLayout from "@/layouts/DashboardLayout";

import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import OrderDetailPage from "@/pages/orders/OrderDetailPage";
import ReturnsPage from "@/pages/orders/ReturnsPage";
import ProductsPage from "@/pages/products/ProductsPage";
import ProductDetailPage from "@/pages/products/ProductDetailPage";
import NewProductPage from "@/pages/products/NewProductPage";
import EditProductPage from "@/pages/products/EditProductPage";
import ApprovalsPage from "@/pages/products/ApprovalsPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import CustomerDetailPage from "@/pages/customers/CustomerDetailPage";
import BeeLevelsPage from "@/pages/customers/BeeLevelsPage";
import HivePage from "@/pages/hive/HivePage";
import PromotionsPage from "@/pages/promotions/PromotionsPage";
import BannersPage from "@/pages/promotions/BannersPage";
import FlashSalesPage from "@/pages/promotions/FlashSalesPage";
import VendorsPage from "@/pages/vendors/VendorsPage";
import SupportPage from "@/pages/support/SupportPage";
import TicketDetailPage from "@/pages/support/TicketDetailPage";
import ReviewsPage from "@/pages/reviews/ReviewsPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import FaqPage from "@/pages/faq/FaqPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import MakeAdminPage from "@/pages/settings/MakeAdminPage";
import AffiliateReferralsPage from "@/pages/affiliate/AffiliateReferralsPage";
import AffiliateWithdrawalsPage from "@/pages/affiliate/AffiliateWithdrawalsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/returns" element={<ReturnsPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<NewProductPage />} />
            <Route path="/products/approvals" element={<ApprovalsPage />} />
            <Route path="/products/:id/edit" element={<EditProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/bee-levels" element={<BeeLevelsPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/hive" element={<HivePage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/promotions/banners" element={<BannersPage />} />
            <Route path="/promotions/flash-sales" element={<FlashSalesPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/support/:id" element={<TicketDetailPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/make-admin" element={<MakeAdminPage />} />
            <Route path="/affiliates/referrals" element={<AffiliateReferralsPage />} />
            <Route path="/affiliates/withdrawals" element={<AffiliateWithdrawalsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryProvider>
  );
}
