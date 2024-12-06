import express from "express";
import { authMiddleWare } from "../../middleware/authMiddleware";
import { UserRole } from "@prisma/client";
import { productController } from "./Product.controller";
import validationMiddleWare from "../../middleware/validationMiddleWare";
import { productSchema } from "./Product.zodValidation";

const router = express.Router();

router.post(
  "/",
  validationMiddleWare(productSchema.createProductValidationSchema),
  authMiddleWare(UserRole.vendor),
  productController.createProduct
);
router.put(
  "/:productId",
  validationMiddleWare(productSchema.updateProductValidationSchema),
  authMiddleWare(UserRole.vendor, UserRole.admin),
  productController.updateProduct
);
router.get(
  "/shop/shop-all-products",
  authMiddleWare(UserRole.vendor),
  productController.findVendorShopAllProducts
);
router.get(
  "/admin/all-products",
  authMiddleWare(UserRole.admin),
  productController.adminFindAllProducts
);

export const productRoutes = router;
