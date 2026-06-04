import type {
  Order, Product, Customer, WardrobePost, Category, Collection,
  Coupon, FlashSale, PromoBanner, Vendor, SupportTicket,
  Review, AdminUser, AuditLog, EmailTemplate, SMSTemplate,
  DashboardStats, ReturnRequest, StockLog, DesignSubmission,
  Notification, RevenueDataPoint, CategoryRevenue, FunnelStep,
} from "@/types";

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const mockDashboardStats: DashboardStats = {
  revenueToday: 48500,
  revenueWeek: 312000,
  revenueMonth: 1240000,
  revenueTodayChange: 12.4,
  revenueWeekChange: -3.2,
  revenueMonthChange: 18.7,
  ordersToday: 34,
  ordersByStatus: {
    Pending: 8, Confirmed: 6, Printing: 5, Shipped: 7,
    Delivered: 5, Cancelled: 2, Refunded: 1,
  },
  newCustomersToday: 12,
  returningRatio: 0.68,
  topSellingProduct: { id: "p1", name: "Retro Bee Graphic Tee", image: "/placeholder-product.jpg", salesCount: 284 },
  lowStockProducts: [
    { id: "p3", name: "Urban Minimalist Tee (XL/Black)", qty: 2 },
    { id: "p7", name: "Limited Drop Vol.2 (S/White)", qty: 3 },
    { id: "p12", name: "Street Wave (M/Navy)", qty: 4 },
  ],
  hivePostsToday: 23,
  hiveSharesToday: 87,
  pendingDesignApprovals: 5,
  abandonedCarts: 18,
  cartRecoveryRate: 0.22,
  liveVisitors: 47,
};

// ─── Revenue Chart Data ───────────────────────────────────────────────────────

export const mockRevenueData: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date("2026-03-20");
  date.setDate(date.getDate() + i);
  return {
    date: date.toISOString().slice(0, 10),
    revenue: Math.floor(30000 + Math.random() * 60000),
    orders: Math.floor(20 + Math.random() * 50),
    aov: Math.floor(800 + Math.random() * 600),
  };
});

export const mockCategoryRevenue: CategoryRevenue[] = [
  { category: "Street Style", revenue: 420000, orders: 380, percent: 33.9 },
  { category: "Limited Edition", revenue: 310000, orders: 190, percent: 25.0 },
  { category: "Minimalist", revenue: 220000, orders: 270, percent: 17.7 },
  { category: "Statement Tees", revenue: 180000, orders: 210, percent: 14.5 },
  { category: "Collab Drops", revenue: 110000, orders: 95, percent: 8.9 },
];

export const mockFunnelData: FunnelStep[] = [
  { step: "Browse", count: 12400, dropoffRate: 0 },
  { step: "View Product", count: 6800, dropoffRate: 45.2 },
  { step: "Add to Cart", count: 2100, dropoffRate: 69.1 },
  { step: "Checkout", count: 980, dropoffRate: 53.3 },
  { step: "Order Placed", count: 720, dropoffRate: 26.5 },
];

// ─── Orders ───────────────────────────────────────────────────────────────────

const COURIERS = ["Pathao", "Steadfast", "RedX", "eCourier", "Sundarban"];
const AREAS = ["Mirpur", "Gulshan", "Dhanmondi", "Uttara", "Motijheel", "Banani", "Mohammadpur"];
const CUSTOMER_NAMES = [
  "Rahim Uddin", "Fatema Khanom", "Kamal Hossain", "Nasrin Akter", "Jahangir Alam",
  "Shirina Begum", "Arif Rahman", "Taslima Akter", "Mizanur Rahman", "Roksana Islam",
  "Farhan Ahmed", "Jannatul Ferdous", "Sabbir Hossain", "Marjia Sultana", "Raihan Khan",
];

export const mockOrders: Order[] = Array.from({ length: 80 }, (_, i) => {
  const statuses: Order["status"][] = ["Pending", "Confirmed", "Printing", "Shipped", "Delivered", "Cancelled", "Refunded"];
  const paymentMethods: Order["paymentMethod"][] = ["bKash", "Nagad", "Card", "COD"];
  const status = statuses[i % statuses.length];
  const qty = Math.floor(1 + Math.random() * 3);
  const unitPrice = Math.floor(400 + Math.random() * 600);
  const subtotal = qty * unitPrice;
  const shippingFee = 60;
  const discount = i % 5 === 0 ? 50 : 0;
  const total = subtotal + shippingFee - discount;
  const createdAt = new Date(Date.now() - (i * 86400000 * 0.5)).toISOString();
  const customerName = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];

  return {
    id: `ORD-${String(1000 + i).padStart(5, "0")}`,
    customerId: `cust-${i + 1}`,
    customerName,
    customerPhone: `0171${String(1000000 + i * 1234).slice(0, 7)}`,
    customerEmail: `${customerName.split(" ")[0].toLowerCase()}@gmail.com`,
    items: [
      {
        productId: `p${(i % 10) + 1}`,
        productName: ["Retro Bee Graphic Tee", "Urban Minimalist", "Street Wave", "Drop Vol.2", "Collab SE"][i % 5],
        designPreview: "/placeholder-product.jpg",
        size: ["S", "M", "L", "XL", "XXL"][i % 5],
        color: ["Black", "White", "Navy", "Olive", "Red"][i % 5],
        qty,
        unitPrice,
        totalPrice: qty * unitPrice,
      },
    ],
    subtotal,
    shippingFee,
    discount,
    total,
    status,
    paymentMethod: paymentMethods[i % 4],
    paymentStatus: status === "Delivered" ? "Paid" : status === "Cancelled" ? "Unpaid" : "Paid",
    deliveryAddress: {
      line1: `${Math.floor(Math.random() * 100) + 1} Main Road`,
      area: AREAS[i % AREAS.length],
      zone: i % 3 === 0 ? "Dhaka Outside" : i % 5 === 0 ? "Rest of BD" : "Dhaka Inside",
      city: "Dhaka",
      phone: `0171${String(1000000 + i * 1234).slice(0, 7)}`,
    },
    courier: status !== "Pending" && status !== "Confirmed" ? COURIERS[i % COURIERS.length] : undefined,
    trackingNumber: status !== "Pending" && status !== "Confirmed" ? `TRK${String(100000 + i * 7).slice(0, 6)}` : undefined,
    timeline: [
      { status: "Pending", timestamp: createdAt, adminName: "System" },
      ...(["Confirmed", "Printing", "Shipped", "Delivered"].includes(status)
        ? [{ status: "Confirmed" as Order["status"], timestamp: new Date(new Date(createdAt).getTime() + 3600000).toISOString(), adminName: "Admin" }]
        : []),
    ],
    internalNotes: i % 7 === 0 ? "Customer requested gift wrapping." : "",
    createdAt,
    updatedAt: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
  };
});

export const mockReturnRequests: ReturnRequest[] = [
  {
    id: "RET-001", orderId: "ORD-01005", customerId: "cust-5", customerName: "Nasrin Akter",
    reason: "Wrong Size", description: "I ordered L but received M.",
    photos: ["/placeholder-product.jpg"], status: "Pending", createdAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "RET-002", orderId: "ORD-01012", customerId: "cust-12", customerName: "Farhan Ahmed",
    reason: "Defective Print", description: "Print is faded on the left side.",
    photos: ["/placeholder-product.jpg", "/placeholder-product.jpg"], status: "Approved",
    refundAmount: 750, adminNote: "Approved. Full refund issued.", createdAt: "2026-04-08T14:00:00Z",
    resolvedAt: "2026-04-09T10:00:00Z",
  },
  {
    id: "RET-003", orderId: "ORD-01020", customerId: "cust-20", customerName: "Sabbir Hossain",
    reason: "Wrong Item", description: "Received completely different product.",
    photos: ["/placeholder-product.jpg"], status: "Partial Refund",
    refundAmount: 400, adminNote: "Partial refund of ৳400 issued.", createdAt: "2026-04-06T11:30:00Z",
    resolvedAt: "2026-04-07T15:00:00Z",
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCT_NAMES = [
  "Retro Bee Graphic Tee", "Urban Minimalist Tee", "Street Wave Tee",
  "Limited Drop Vol.2", "Collab Special Edition", "Heritage Script Tee",
  "Midnight Statement Tee", "Summer Fade Tee", "Geo Print Tee", "Classic Bee Logo Tee",
];

export const mockProducts: Product[] = Array.from({ length: 40 }, (_, i) => {
  const basePrice = Math.floor(500 + (i % 6) * 150);
  return {
    id: `p${i + 1}`,
    name: PRODUCT_NAMES[i % PRODUCT_NAMES.length] + (i >= 10 ? ` v${Math.floor(i / 10) + 1}` : ""),
    description: "Premium quality 100% cotton tee with unique design.",
    category: ["Street Style", "Limited Edition", "Minimalist", "Statement Tees", "Collab Drops"][i % 5],
    subcategory: "T-Shirts",
    tags: ["tee", "cotton", "unisex"],
    images: ["/placeholder-product.jpg"],
    variants: [
      { size: "S", color: "Black", stock: Math.floor(Math.random() * 20), price: basePrice },
      { size: "M", color: "Black", stock: Math.floor(Math.random() * 20), price: basePrice },
      { size: "L", color: "Black", stock: Math.floor(Math.random() * 20), price: basePrice },
      { size: "XL", color: "White", stock: Math.floor(i < 5 ? Math.random() * 4 : Math.random() * 20), price: basePrice },
      { size: "XXL", color: "White", stock: Math.floor(Math.random() * 15), price: basePrice + 50 },
    ],
    basePrice,
    originalPrice: i % 3 === 0 ? basePrice + 200 : undefined,
    costPrice: Math.floor(basePrice * 0.4),
    isNew: i < 5,
    isDiscounted: i % 3 === 0,
    discountPercent: i % 3 === 0 ? 15 : undefined,
    isLimitedEdition: i % 5 === 1,
    editionSize: i % 5 === 1 ? 100 : undefined,
    status: i % 8 === 0 ? "draft" : i % 12 === 0 ? "archived" : "active",
    slug: `tee-${i + 1}`,
    metaTitle: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
    vendorId: i % 4 === 0 ? `v${(i % 3) + 1}` : undefined,
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

export const mockDesignSubmissions: DesignSubmission[] = [
  { id: "ds1", vendorId: "v1", vendorName: "UrbanInk Studio", designName: "Monsoon Vibes", designFiles: ["/placeholder-product.jpg"], category: "Street Style", description: "Inspired by BD monsoon season.", status: "Pending", submittedAt: "2026-04-18T10:00:00Z" },
  { id: "ds2", vendorId: "v2", vendorName: "Pixel Tee Co", designName: "Rickshaw Dreams", designFiles: ["/placeholder-product.jpg"], category: "Collab Drops", description: "Iconic Dhaka rickshaw art.", status: "Pending", submittedAt: "2026-04-17T14:30:00Z" },
  { id: "ds3", vendorId: "v3", vendorName: "ThreadWorks BD", designName: "Old Dhaka Stories", designFiles: ["/placeholder-product.jpg"], category: "Statement Tees", description: "Heritage of old Dhaka.", status: "Pending", submittedAt: "2026-04-16T09:00:00Z" },
  { id: "ds4", vendorId: "v1", vendorName: "UrbanInk Studio", designName: "River Delta", designFiles: ["/placeholder-product.jpg"], category: "Minimalist", description: "Subtle delta pattern.", status: "Approved", submittedAt: "2026-04-10T11:00:00Z", reviewedAt: "2026-04-11T09:00:00Z" },
  { id: "ds5", vendorId: "v2", vendorName: "Pixel Tee Co", designName: "Neon Bazaar", designFiles: ["/placeholder-product.jpg"], category: "Street Style", description: "Night market vibes.", status: "Rejected", rejectionReason: "Image resolution too low (< 300 DPI).", submittedAt: "2026-04-09T16:00:00Z", reviewedAt: "2026-04-10T10:00:00Z" },
];

// ─── Inventory Logs ───────────────────────────────────────────────────────────

export const mockStockLogs: StockLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: `log-${i + 1}`,
  productId: `p${(i % 10) + 1}`,
  productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
  variantSize: ["S", "M", "L", "XL"][i % 4],
  variantColor: ["Black", "White", "Navy"][i % 3],
  previousQty: 10 + i,
  newQty: 10 + i + (i % 2 === 0 ? 5 : -3),
  change: i % 2 === 0 ? 5 : -3,
  reason: i % 2 === 0 ? "Stock refill" : "Order fulfillment",
  adminId: "admin-1",
  adminName: "Super Admin",
  timestamp: new Date(Date.now() - i * 3600000 * 4).toISOString(),
}));

// ─── Customers ────────────────────────────────────────────────────────────────

const BEE_LEVELS: Customer["beeLevel"][] = ["Larva", "Worker", "Drone", "Queen", "Royal"];

export const mockCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cust-${i + 1}`,
  name: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length] + (i >= 15 ? ` ${Math.floor(i / 15) + 1}` : ""),
  email: `user${i + 1}@gmail.com`,
  phone: `0171${String(3000000 + i * 1111).slice(0, 7)}`,
  beeLevel: BEE_LEVELS[Math.min(Math.floor(i / 10), 4)],
  totalOrders: Math.floor(1 + Math.random() * 30),
  totalSpend: Math.floor(500 + Math.random() * 50000),
  addresses: [{ line1: `${i + 1} Lane`, area: AREAS[i % AREAS.length], zone: "Dhaka Inside", city: "Dhaka", phone: `0171${String(3000000 + i * 1111).slice(0, 7)}` }],
  wardrobeItems: Math.floor(Math.random() * 15),
  joinedAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  lastActive: new Date(Date.now() - i * 86400000 * 0.5).toISOString(),
  status: i === 7 || i === 23 ? "Banned" : "Active",
  loyaltyPoints: Math.floor(Math.random() * 1000),
  loginHistory: [
    { device: "Chrome / Windows", ip: `192.168.1.${i + 1}`, timestamp: new Date(Date.now() - 3600000).toISOString() },
  ],
}));

// ─── Wardrobe Posts ───────────────────────────────────────────────────────────

export const mockWardrobePosts: WardrobePost[] = Array.from({ length: 40 }, (_, i) => ({
  id: `post-${i + 1}`,
  customerId: `cust-${(i % 15) + 1}`,
  customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
  customerBeeLevel: BEE_LEVELS[i % 5],
  image: "/placeholder-product.jpg",
  caption: ["Loving my new tee! 🐝", "Street look of the day", "Fresh drop just landed", "Limited edition fits different"][i % 4],
  productId: `p${(i % 10) + 1}`,
  productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
  status: i % 10 === 0 ? "Flagged" : i % 15 === 0 ? "Removed" : i < 3 ? "Featured" : "Published",
  isFeatured: i < 3,
  shares: { whatsapp: Math.floor(Math.random() * 50), twitter: Math.floor(Math.random() * 20), facebook: Math.floor(Math.random() * 30) },
  totalShares: Math.floor(Math.random() * 100),
  reportCount: i % 10 === 0 ? Math.floor(1 + Math.random() * 5) : 0,
  createdAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

// ─── Categories & Collections ─────────────────────────────────────────────────

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Street Style", slug: "street-style", description: "Urban streetwear tees", image: "/placeholder-product.jpg", order: 1, productCount: 28, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: "cat-2", name: "Limited Edition", slug: "limited-edition", description: "Exclusive drops with limited stock", image: "/placeholder-product.jpg", order: 2, productCount: 12, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: "cat-3", name: "Minimalist", slug: "minimalist", description: "Clean, minimal designs", image: "/placeholder-product.jpg", order: 3, productCount: 18, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: "cat-4", name: "Statement Tees", slug: "statement-tees", description: "Bold prints that speak", image: "/placeholder-product.jpg", order: 4, productCount: 22, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: "cat-5", name: "Collab Drops", slug: "collab-drops", description: "Artist collaboration collections", image: "/placeholder-product.jpg", order: 5, productCount: 8, status: "active", createdAt: "2025-01-01T00:00:00Z" },
  { id: "cat-6", name: "Archived Collection", slug: "archived", description: "Old season items", order: 6, productCount: 4, status: "inactive", createdAt: "2024-06-01T00:00:00Z" },
];

export const mockCollections: Collection[] = [
  { id: "col-1", name: "Eid Drop 2026", slug: "eid-drop-2026", description: "Special Eid collection", banner: "/placeholder-product.jpg", isPinned: true, productIds: ["p1", "p2", "p3"], startDate: "2026-03-25T00:00:00Z", endDate: "2026-04-10T00:00:00Z", status: "ended", createdAt: "2026-03-01T00:00:00Z" },
  { id: "col-2", name: "Summer Essentials", slug: "summer-2026", description: "Beat the heat in style", isPinned: true, productIds: ["p4", "p5", "p6", "p7"], startDate: "2026-04-15T00:00:00Z", status: "active", createdAt: "2026-04-01T00:00:00Z" },
  { id: "col-3", name: "Independence Day Drop", slug: "independence-day-2026", description: "Celebrate in style", banner: "/placeholder-product.jpg", isPinned: false, productIds: ["p8", "p9"], startDate: "2026-03-26T00:00:00Z", endDate: "2026-03-30T00:00:00Z", status: "scheduled", createdAt: "2026-03-15T00:00:00Z" },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const mockCoupons: Coupon[] = [
  { id: "coup-1", code: "EID2026", type: "percentage", value: 20, minOrderValue: 1000, maxUses: 500, perUserLimit: 1, usedCount: 342, validFrom: "2026-03-25T00:00:00Z", validUntil: "2026-04-05T23:59:59Z", status: "expired", revenueInfluenced: 85000, createdAt: "2026-03-20T00:00:00Z" },
  { id: "coup-2", code: "BEE50", type: "flat", value: 50, minOrderValue: 500, maxUses: 1000, perUserLimit: 1, usedCount: 128, validFrom: "2026-04-01T00:00:00Z", validUntil: "2026-04-30T23:59:59Z", status: "active", revenueInfluenced: 32000, createdAt: "2026-04-01T00:00:00Z" },
  { id: "coup-3", code: "ROYAL15", type: "percentage", value: 15, minOrderValue: 2000, maxUses: 100, perUserLimit: 2, usedCount: 12, validFrom: "2026-04-10T00:00:00Z", validUntil: "2026-05-10T23:59:59Z", status: "active", revenueInfluenced: 18000, createdAt: "2026-04-09T00:00:00Z" },
  { id: "coup-4", code: "WELCOME100", type: "flat", value: 100, minOrderValue: 800, maxUses: 200, perUserLimit: 1, usedCount: 0, validFrom: "2026-05-01T00:00:00Z", validUntil: "2026-05-31T23:59:59Z", status: "inactive", revenueInfluenced: 0, createdAt: "2026-04-19T00:00:00Z" },
];

export const mockFlashSales: FlashSale[] = [
  { id: "fs-1", productId: "p2", productName: "Urban Minimalist Tee", productImage: "/placeholder-product.jpg", originalPrice: 750, salePrice: 499, startTime: "2026-04-19T12:00:00Z", endTime: "2026-04-19T18:00:00Z", status: "active" },
  { id: "fs-2", productId: "p5", productName: "Collab Special Edition", productImage: "/placeholder-product.jpg", originalPrice: 1200, salePrice: 899, startTime: "2026-04-20T10:00:00Z", endTime: "2026-04-20T22:00:00Z", status: "scheduled" },
  { id: "fs-3", productId: "p8", productName: "Midnight Statement Tee", productImage: "/placeholder-product.jpg", originalPrice: 650, salePrice: 450, startTime: "2026-04-15T10:00:00Z", endTime: "2026-04-15T22:00:00Z", status: "ended" },
];

export const mockPromoBanners: PromoBanner[] = [
  { id: "bn-1", image: "/placeholder-product.jpg", ctaLink: "/collections/eid-drop-2026", ctaText: "Shop Now", headline: "Eid Drop 2026", subheadline: "Exclusive designs for the season", order: 1, startDate: "2026-03-25T00:00:00Z", endDate: "2026-04-10T00:00:00Z", status: "inactive" },
  { id: "bn-2", image: "/placeholder-product.jpg", ctaLink: "/collections/summer-2026", ctaText: "Explore Summer", headline: "Summer Essentials Are Here", subheadline: "Stay cool, stay fresh", order: 2, startDate: "2026-04-15T00:00:00Z", endDate: "2026-06-30T00:00:00Z", status: "active" },
  { id: "bn-3", image: "/placeholder-product.jpg", ctaLink: "/products/p1", ctaText: "Get Yours", headline: "New Drop Alert 🐝", order: 3, startDate: "2026-04-20T00:00:00Z", endDate: "2026-04-27T00:00:00Z", status: "scheduled" },
];

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const mockVendors: Vendor[] = [
  { id: "v1", name: "UrbanInk Studio", email: "hello@urbanink.com", phone: "01711234567", portfolio: ["/placeholder-product.jpg", "/placeholder-product.jpg"], commissionRate: 20, status: "Approved", totalSales: 285000, pendingCommission: 12000, paidCommission: 45000, designsApproved: 8, designsPending: 1, appliedAt: "2025-11-01T00:00:00Z", approvedAt: "2025-11-05T00:00:00Z" },
  { id: "v2", name: "Pixel Tee Co", email: "info@pixeltee.com", phone: "01819876543", portfolio: ["/placeholder-product.jpg"], commissionRate: 18, status: "Approved", totalSales: 142000, pendingCommission: 7800, paidCommission: 17760, designsApproved: 5, designsPending: 2, appliedAt: "2025-12-10T00:00:00Z", approvedAt: "2025-12-15T00:00:00Z" },
  { id: "v3", name: "ThreadWorks BD", email: "contact@threadworks.bd", phone: "01612233445", portfolio: ["/placeholder-product.jpg"], commissionRate: 22, status: "Under Review", totalSales: 0, pendingCommission: 0, paidCommission: 0, designsApproved: 0, designsPending: 3, appliedAt: "2026-04-10T00:00:00Z" },
  { id: "v4", name: "Fresh Prints BD", email: "hello@freshprints.bd", phone: "01988776655", portfolio: [], commissionRate: 20, status: "Pending", totalSales: 0, pendingCommission: 0, paidCommission: 0, designsApproved: 0, designsPending: 0, appliedAt: "2026-04-18T00:00:00Z" },
  { id: "v5", name: "Creative Threads", email: "hi@creativethreads.com", phone: "01755443322", portfolio: ["/placeholder-product.jpg"], commissionRate: 15, status: "Rejected", totalSales: 0, pendingCommission: 0, paidCommission: 0, designsApproved: 0, designsPending: 0, appliedAt: "2026-03-01T00:00:00Z" },
];

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const mockSupportTickets: SupportTicket[] = Array.from({ length: 25 }, (_, i) => ({
  id: `TKT-${String(100 + i).padStart(4, "0")}`,
  customerId: `cust-${(i % 15) + 1}`,
  customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
  customerEmail: `user${i + 1}@gmail.com`,
  beeLevel: BEE_LEVELS[i % 5],
  subject: ["Where is my order?", "Wrong size received", "Payment not confirmed", "Refund not received yet", "Product quality issue"][i % 5],
  status: (["Open", "In Progress", "Resolved"] as SupportTicket["status"][])[i % 3],
  priority: (["Normal", "Urgent", "VIP"] as SupportTicket["priority"][])[i % 3],
  assignedTo: i % 2 === 0 ? "Support Agent 1" : undefined,
  messages: [
    { id: `msg-${i}-1`, ticketId: `TKT-${String(100 + i).padStart(4, "0")}`, senderId: `cust-${i + 1}`, senderName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length], senderType: "customer", content: "I have a question about my order.", timestamp: new Date(Date.now() - (i + 1) * 3600000 * 2).toISOString() },
  ],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
  resolvedAt: i % 3 === 2 ? new Date(Date.now() - i * 1800000).toISOString() : undefined,
}));

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const mockReviews: Review[] = Array.from({ length: 35 }, (_, i) => ({
  id: `rev-${i + 1}`,
  productId: `p${(i % 10) + 1}`,
  productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
  customerId: `cust-${(i % 15) + 1}`,
  customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
  rating: Math.max(1, Math.min(5, Math.floor(3 + Math.random() * 3))),
  text: ["Great quality tee! Fits perfectly.", "Love the design, fast delivery.", "Good product but sizing runs small.", "Amazing print quality!", "Will order again!"][i % 5],
  status: (["Pending", "Approved", "Rejected"] as Review["status"][])[i % 5 === 3 ? 2 : i % 5 === 0 ? 0 : 1],
  adminReply: i % 4 === 0 ? "Thank you for your feedback!" : undefined,
  isFlagged: i % 8 === 0,
  createdAt: new Date(Date.now() - i * 86400000 * 0.8).toISOString(),
  approvedAt: i % 5 !== 0 && i % 5 !== 3 ? new Date(Date.now() - i * 43200000).toISOString() : undefined,
}));

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const mockAdminUsers: AdminUser[] = [
  { id: "admin-1", name: "Mohammad Ishtiaque", email: "mohammad.ishtiaque833@gmail.com", role: "Super Admin", permissions: [], isActive: true, lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: "2025-01-01T00:00:00Z" },
  { id: "admin-2", name: "Fatema Manager", email: "fatema@looksbee.com", role: "Manager", permissions: [], isActive: true, lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: "2025-03-15T00:00:00Z" },
  { id: "admin-3", name: "Support Karim", email: "karim@looksbee.com", role: "Support", permissions: [], isActive: true, lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: "2025-06-01T00:00:00Z" },
  { id: "admin-4", name: "Analyst Nadia", email: "nadia@looksbee.com", role: "Analyst", permissions: [], isActive: false, lastLogin: new Date(Date.now() - 864000000).toISOString(), createdAt: "2025-08-20T00:00:00Z" },
];

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const mockAuditLog: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `aud-${i + 1}`,
  adminId: "admin-1",
  adminName: "Mohammad Ishtiaque",
  action: ["Updated", "Created", "Deleted", "Approved", "Rejected"][i % 5],
  module: ["Orders", "Products", "Customers", "Vendors", "Reviews"][i % 5],
  targetId: `item-${i + 1}`,
  targetType: ["Order", "Product", "Customer", "Vendor", "Review"][i % 5],
  details: ["Order status changed to Shipped", "New product created", "Customer banned", "Design approved", "Review rejected"][i % 5],
  timestamp: new Date(Date.now() - i * 1800000).toISOString(),
  ipAddress: `192.168.1.${(i % 254) + 1}`,
}));

// ─── Email & SMS Templates ────────────────────────────────────────────────────

export const mockEmailTemplates: EmailTemplate[] = [
  { id: "et-1", name: "Order Confirmation", trigger: "order.placed", subject: "Your LooksBee order #{{orderId}} is confirmed!", body: "Hi {{customerName}},\n\nYour order #{{orderId}} has been confirmed...", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
  { id: "et-2", name: "Order Shipped", trigger: "order.shipped", subject: "Your order is on the way! 🚚", body: "Hi {{customerName}},\n\nGreat news! Your order #{{orderId}} has been shipped via {{courier}}...", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
  { id: "et-3", name: "Order Delivered", trigger: "order.delivered", subject: "Your order has been delivered!", body: "Hi {{customerName}},\n\nYour order #{{orderId}} has been delivered successfully...", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
  { id: "et-4", name: "Refund Processed", trigger: "order.refunded", subject: "Refund processed for order #{{orderId}}", body: "Hi {{customerName}},\n\nYour refund of ৳{{amount}} has been processed...", isActive: true, lastModified: "2026-03-15T00:00:00Z" },
];

export const mockSMSTemplates: SMSTemplate[] = [
  { id: "sms-1", name: "OTP", trigger: "auth.otp", body: "Your LooksBee OTP is {{otp}}. Valid for 5 minutes. Do not share.", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
  { id: "sms-2", name: "Order Confirmed", trigger: "order.placed", body: "Hi {{name}}, your order #{{orderId}} (৳{{total}}) is confirmed! Track: {{trackingUrl}}", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
  { id: "sms-3", name: "Order Shipped", trigger: "order.shipped", body: "Hi {{name}}, your order #{{orderId}} shipped via {{courier}}. Track: {{trackingNumber}}", isActive: true, lastModified: "2026-03-01T00:00:00Z" },
];

export const mockNotifications: Notification[] = [
  { id: "notif-1", title: "Eid Sale Alert", body: "Don't miss our Eid special offers! Up to 20% off.", type: "email", segment: "all", status: "sent", sentAt: "2026-03-25T09:00:00Z", recipientCount: 4820, openRate: 0.34, createdAt: "2026-03-24T00:00:00Z" },
  { id: "notif-2", title: "New Drop For Royal Members", body: "Exclusive early access to our latest drop.", type: "push", segment: "Royal", status: "sent", sentAt: "2026-04-15T10:00:00Z", recipientCount: 24, openRate: 0.87, createdAt: "2026-04-14T00:00:00Z" },
  { id: "notif-3", title: "Summer Flash Sale", body: "Flash sale starts in 1 hour!", type: "sms", segment: "all", status: "scheduled", scheduledAt: "2026-04-20T09:00:00Z", recipientCount: 5100, createdAt: "2026-04-19T00:00:00Z" },
];
