import { RequestHandler } from "express";
import { categoryAndSubCategoryService } from "./CategoryAndSubCategory.service";
import { successResponse } from "../../Re-useable/successResponse";
import { StatusCodes } from "http-status-codes";

const createCategory: RequestHandler = async (req, res, next) => {
  try {
    const result = await categoryAndSubCategoryService.createCategoryDB(
      req?.user,
      req?.body
    );
    res.send(
      successResponse(
        result,
        StatusCodes.OK,
        "Category Create successfully done"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const categoryAndSubCategoryController = { createCategory };