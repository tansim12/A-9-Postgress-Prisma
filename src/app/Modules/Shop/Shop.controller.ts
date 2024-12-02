import { RequestHandler } from "express";
import { successResponse } from "../../Re-useable/successResponse";
import { StatusCodes } from "http-status-codes";
import { shopService } from "./Shop.service";
import pick from "../../shared/pick";
import { shopFilterAbleFields } from "./Shop.const";

const createShop: RequestHandler = async (req, res, next) => {
  try {
    const result = await shopService.crateShopDB(req?.user, req.body);
    res.send(
      successResponse(result, StatusCodes.OK, "Shop create successfully done")
    );
  } catch (error) {
    next(error);
  }
};
const findSingleShopPublic: RequestHandler = async (req, res, next) => {
  try {
    const result = await shopService.findSingleShopPublicDB(
      req?.params?.shopId
    );
    res.send(
      successResponse(
        result,
        StatusCodes.OK,
        "Single Shop find successfully done"
      )
    );
  } catch (error) {
    next(error);
  }
};
const findAllShopPublic: RequestHandler = async (req, res, next) => {
  try {
    const filters = pick(req.query, shopFilterAbleFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await shopService.findAllShopPublicDB(filters, options);
    res.send(successResponse(result, StatusCodes.OK, "Find all Shop"));
  } catch (error) {
    next(error);
  }
};

const shopFollowing: RequestHandler = async (req, res, next) => {
  try {
    const result = await shopService.shopFollowingDB(req?.user, req?.body);
    res.send(
      successResponse(
        result,
        StatusCodes.OK,
        "Single Shop find successfully done"
      )
    );
  } catch (error) {
    next(error);
  }
};
export const shopController = {
  createShop,
  findAllShopPublic,
  findSingleShopPublic,
  shopFollowing,
};