import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";
import AppError from "./src/utils/AppError.js";
import userRoutes from "./src/routes/auth/userAuthRoutes.js";
import adminRoutes from "./src/routes/auth/adminAuthRoutes.js";
import lookbookRoutes from "./src/routes/lookbookRoutes.js";
import contactRoutes from './src/routes/contactRoutes.js';
import collectionRoutes from "./src/routes/collectionRoutes.js";
import categoryRoutes from "./src/routes/categories.js";
import productRoutes from "./src/routes/products.js";
import variantRoutes from "./src/routes/variants.js";
import inventoryRoutes from "./src/routes/inventory.js";
import bulkProductRoutes from "./src/routes/bulkProduct.routes.js";
import bulkProductVariantRoutes from "./src/routes/bulkProductVariant.routes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orders.js";
import walletRoutes from "./src/routes/walletRoutes.js";
import adminWalletRoutes from "./src/routes/adminWalletRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import sellerProductRoutes from "./src/routes/sellerProductRoutes.js";
import siteContentRoutes from "./src/routes/siteContentRoutes.js";

dotenv.config();

// Allowed CORS origins for local development only. Set CORS_ORIGINS (comma-
// separated) to the real AB Creation storefront/admin domains in production —
// see the check below, which fails closed instead of trusting these.
const defaultOrigins = [
    "http://localhost:3000", // apps/web (Next.js dev server)
    "http://localhost:3001", // apps/admin (Vite dev server)
];

if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS) {
    console.error("CRITICAL WARNING: CORS_ORIGINS environment variable is NOT set in production!");
    console.error("The backend will reject all cross-origin requests by default.");
    // Optionally we could throw an error here to prevent server start:
    // throw new Error("CORS_ORIGINS must be set in production");
}
const corsOptions = {
    origin: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : process.env.NODE_ENV === "production" ? [] : defaultOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

// One reverse proxy (load balancer / CDN) in front in production — needed so
// req.ip is the real client address, which the per-IP rate limiters key on.
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Health Check Endpoint
app.get("/", (req, res) => {
    res.status(200).json({ message: "Health Check Succes!" });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lookbook", lookbookRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/bulk-products", bulkProductRoutes);
app.use("/api/bulk-product-variants", bulkProductVariantRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin/wallet", adminWalletRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/seller-products", sellerProductRoutes);
app.use("/api/site-content", siteContentRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});