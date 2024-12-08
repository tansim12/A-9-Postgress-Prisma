import { RequestHandler } from "express";
import { productService } from "./Product.service";
import { successResponse } from "../../Re-useable/successResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../shared/pick";
import { shopFilterAbleFields } from "../Shop/Shop.const";
import { shopAllProductsFilterAbleFields } from "./Product.const";

const createProduct: RequestHandler = async (req, res, next) => {
  try {
    const result = await productService.createProductDB(
      req?.user,

      req?.body
    );
    res.send(successResponse(result, StatusCodes.OK, "Product Created"));
  } catch (error) {
    next(error);
  }
};
const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const result = await productService.updateProductDB(
      req?.user,
      req?.params?.productId,
      req?.body
    );
    res.send(successResponse(result, StatusCodes.OK, "Product updated"));
  } catch (error) {
    next(error);
  }
};

const findVendorShopAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await productService.findVendorShopAllProductsDB(
      req?.user,
      filters,
      options
    );
    res.send(successResponse(result, StatusCodes.OK, "find all product"));
  } catch (error) {
    next(error);
  }
};
const adminFindAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await productService.adminFindAllProductsDB(
      filters,
      options
    );
    res.send(successResponse(result, StatusCodes.OK, "find Products"));
  } catch (error) {
    next(error);
  }
};
const publicTopSaleProduct: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await productService.publicTopSaleProductDB(
      filters,
      options
    );
    res.send(successResponse(result, StatusCodes.OK, "find top sale Products"));
  } catch (error) {
    next(error);
  }
};
const publicSingleProduct: RequestHandler = async (req, res, next) => {
  try {
    const result = await productService.publicSingleProductDb(
      req?.params?.productId
    );
    res.send(successResponse(result, StatusCodes.OK, "Single Product Find "));
  } catch (error) {
    next(error);
  }
};

const publicFlashSaleProduct: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await productService.publicFlashSaleProductDB(
      filters,
      options
    );
    res.send(
      successResponse(result, StatusCodes.OK, "find flash sale Products")
    );
  } catch (error) {
    next(error);
  }
};
const publicPromoCheck: RequestHandler = async (req, res, next) => {
  try {
    const result = await productService.publicPromoCheckDB(req?.body);
    res.send(successResponse(result, StatusCodes.OK, "Promo Check "));
  } catch (error) {
    next(error);
  }
};

const publicAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopAllProductsFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await productService.publicAllProductsDB(filters, options);
    res.send(successResponse(result, StatusCodes.OK, "find all product"));
  } catch (error) {
    next(error);
  }
};
const publicCompareProduct: RequestHandler = async (req, res, next) => {
  try {
    const result = await productService.publicCompareProductDB(req?.body);
    res.send(successResponse(result, StatusCodes.OK, "find compare product"));
  } catch (error) {
    next(error);
  }
};

export const productController = {
  createProduct,
  updateProduct,
  findVendorShopAllProducts,
  adminFindAllProducts,
  publicTopSaleProduct,
  publicSingleProduct,
  publicFlashSaleProduct,
  publicPromoCheck,
  publicAllProducts,
  publicCompareProduct,
};
