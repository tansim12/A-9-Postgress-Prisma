import { PaymentStatus, Prisma, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IPaginationOptions } from "../../interface/pagination";
import { paginationHelper } from "../../helper/paginationHelper";
import { shopAllProductsSearchAbleFields } from "./Product.const";
import AppError from "../../Error-Handler/AppError";
import { StatusCodes } from "http-status-codes";

const createProductDB = async (tokenUser: any, payload: any) => {
  const vendorInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: tokenUser?.id,
      isDelete: false,
      shop: {
        vendorId: tokenUser?.id,
        isDelete: false,
      },
    },
    select: {
      shop: {
        select: {
          id: true,
        },
      },
    },
  });
  const result = await prisma.product.create({
    data: {
      ...payload,
      shopId: vendorInfo?.shop?.id,
    },
  });
  return result;
};
const updateProductDB = async (
  tokenUser: any,
  productId: string,
  payload: any
) => {
  const IsVendor = await prisma.user.findUnique({
    where: {
      id: tokenUser?.id,
      isDelete: false,
      status: UserStatus.active,
    },
  });

  if (IsVendor?.role === UserRole.vendor) {
    await prisma.product.findUniqueOrThrow({
      where: {
        id: productId,
        shop: {
          vendorId: IsVendor?.id,
          isDelete: false,
        },
      },
    });
  }
  const result = await prisma.product.update({
    where: {
      id: productId,
    },
    data: payload,
  });
  return result;
};

const findVendorShopAllProductsDB = async (
  tokenUser: any,
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = queryObj;

  const andCondition = [];
  if (queryObj.searchTerm) {
    andCondition.push({
      OR: shopAllProductsSearchAbleFields?.map((field) => ({
        [field]: {
          contains: queryObj.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as never],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andCondition as any };

  const vendorInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: tokenUser?.id,
      isDelete: false,
      shop: {
        vendorId: tokenUser?.id,
        // isDelete: false,
      },
    },
    select: {
      shop: {
        select: {
          id: true,
        },
      },
    },
  });
  const result = await prisma.shop.findUniqueOrThrow({
    where: {
      // ...whereConditions,
      id: vendorInfo?.shop?.id,
    },
    include: {
      product: {
        where: {
          ...(whereConditions as any),
        },
        include: {
          category: {
            select: {
              categoryName: true,
              id: true,
            },
          },
          subCategory: {
            select: {
              categoryName: true,
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy:
          options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
              }
            : {
                createdAt: "desc",
              },
      },
    },
  });
  const total = await prisma.shop.findUniqueOrThrow({
    where: {
      // ...whereConditions,
      id: vendorInfo?.shop?.id,
    },
    include: {
      product: {
        where: {
          ...(whereConditions as any),
        },
        select: {
          id: true,
        },
      },
    },
  });

  const meta = {
    page,
    limit,
    total: total.product.length,
  };
  return {
    meta,
    result,
  };
};

const adminFindAllProductsDB = async (
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = queryObj;

  const andCondition = [];
  if (queryObj.searchTerm) {
    andCondition.push({
      OR: shopAllProductsSearchAbleFields.map((field) => ({
        [field]: {
          contains: queryObj.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as never],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andCondition as any };

  const result = await prisma.product.findMany({
    where: {
      ...(whereConditions as any),
    },
    include: {
      category: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      subCategory: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      shop: {
        select: {
          name: true,
          id: true,
          logo: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.product.count({
    where: whereConditions as any,
  });
  const meta = {
    page,
    limit,
    total,
  };
  return {
    meta,
    result,
  };
};
const publicTopSaleProductDB = async (
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = queryObj;

  const andCondition = [];
  if (queryObj.searchTerm) {
    andCondition.push({
      OR: shopAllProductsSearchAbleFields.map((field) => ({
        [field]: {
          contains: queryObj.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as never],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andCondition as any };

  const result = await prisma.product.findMany({
    where: {
      ...(whereConditions as any),
      isDelete: false,
      isAvailable: true,
      quantity: {
        gt: 1,
      },
    },
    include: {
      category: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      subCategory: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      shop: {
        select: {
          name: true,
          id: true,
          logo: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      totalBuy: "desc",
    },
  });

  const total = await prisma.product.count({
    where: {
      ...(whereConditions as any),
      isDelete: false,
      isAvailable: true,
    },
  });
  const meta = {
    page,
    limit,
    total,
  };
  return {
    meta,
    result,
  };
};

const publicSingleProductDb = async (productId: string) => {
  const result = await prisma.product.findUniqueOrThrow({
    where: {
      id: productId,
      isDelete: false,
    },
    include: {
      category: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      subCategory: {
        select: {
          categoryName: true,
          id: true,
        },
      },
      shop: {
        select: {
          logo: true,
          name: true,
          _count: true,
          shopType: true,
        },
      },
    },
  });

  const relatedProduct = await prisma.product.findMany({
    where: {
      OR: [
        {
          categoryId: result.categoryId,
        },
        {
          subCategoryId: result.subCategoryId,
        },
      ],
      NOT: {
        id: result.id,
      },
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });
  return {
    result,
    relatedProduct,
  };
};

const publicFlashSaleProductDB = async (
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = queryObj;

  const andCondition = [];
  if (queryObj.searchTerm) {
    andCondition.push({
      OR: shopAllProductsSearchAbleFields.map((field) => ({
        [field]: {
          contains: queryObj.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as never],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andCondition as any };

  const result = await prisma.product.findMany({
    where: {
      ...(whereConditions as any),
      isDelete: false,
      isAvailable: true,
      // flash sale হওয়ার condition
      isActivePromo: true,
      promo: {
        not: null,
      },
      flashSaleDiscount: {
        not: null,
      },
      flashSaleEndDate: {
        not: null,
      },
      flashSaleStartDate: {
        not: null,
      },
      isFlashSaleOffer: true,
      quantity: {
        gt: 1,
      },
    },

    skip,
    take: limit,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const total = await prisma.product.count({
    where: {
      ...(whereConditions as any),
      isDelete: false,
      isAvailable: true,
      // flash sale হওয়ার condition
      isActivePromo: true,
      promo: {
        not: null,
      },
      flashSaleDiscount: {
        not: null,
      },
      flashSaleEndDate: {
        not: null,
      },
      flashSaleStartDate: {
        not: null,
      },
      isFlashSaleOffer: true,
      quantity: {
        gt: 1,
      },
    },
  });
  const meta = {
    page,
    limit,
    total,
  };
  return {
    meta,
    result,
  };
};

const publicPromoCheckDB = async (payload: any) => {
  const currentDate = new Date();

  const product = await prisma.product.findFirst({
    where: {
      id: payload?.id,
      isDelete: false,
      shopId: payload?.shopId,
      isAvailable: true,
      // Flash Sale শর্ত
      isActivePromo: true,
      promo: {
        equals: payload?.promo,
      },
      flashSaleDiscount: {
        not: null,
      },
      AND: [
        {
          flashSaleStartDate: {
            lte: currentDate, // শুরু হয়েছে বা আজ শুরু
          },
        },
        {
          flashSaleEndDate: {
            gte: currentDate, // এখনো চলছে বা আজ শেষ
          },
        },
      ],
      isFlashSaleOffer: true,
      quantity: {
        gt: 1,
      },
    },
  });

  if (!product) {
    return {
      status: 400,
      message: "This Promo Not Available",
    };
  }
  return {
    status: 200,
    message: "Congratulations, you got a discount!",
    newUnitPrice: product?.price - (product?.flashSaleDiscount as number),
    id: product?.id,
  };
};

// const publicAllProductsDB = async (
//   queryObj: any,
//   options: IPaginationOptions
// ) => {
//   const { page, limit, skip } = paginationHelper.calculatePagination(options);
//   const { searchTerm, priceStart, priceEnd, ...filterData } = queryObj;
//   console.log(typeof priceStart);

//   const andCondition = [];
//   if (queryObj.searchTerm) {
//     andCondition.push({
//       OR: shopAllProductsSearchAbleFields.map((field) => ({
//         [field]: {
//           contains: queryObj.searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }
//   if (Object.keys(filterData).length > 0) {
//     if (filterData?.isAvailable) {
//       if (
//         typeof filterData?.isAvailable === "string" &&
//         filterData?.isAvailable === "false"
//       ) {
//         filterData.isAvailable = false;
//       }
//       if (
//         typeof filterData?.isAvailable === "string" &&
//         filterData?.isAvailable === "true"
//       ) {
//         filterData.isAvailable = true;
//       }
//     }

//     andCondition.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: filterData[key as never],
//         },
//       })),
//     });
//   }

//   const whereConditions: Prisma.UserWhereInput = { AND: andCondition as any };

//   const result = await prisma.product.findMany({
//     where: {
//       ...(whereConditions as any),
//       isDelete: false,
//       AND: [
//         {
//           price: {
//             gte: Number(priceStart), // Price should be greater than or equal to priceStart
//           },
//         },
//         {
//           price: {
//             lte: Number(priceEnd), // Price should be less than or equal to priceEnd
//           },
//         },
//       ],
//     },
//     include: {
//       category: true,
//       subCategory: true,
//     },
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? {
//             [options.sortBy]: options.sortOrder,
//           }
//         : {
//             createdAt: "desc",
//           },
//   });

//   const total = await prisma.product.count({
//     where: {
//       ...(whereConditions as any),
//       isDelete: false,
//       AND: [
//         {
//           price: {
//             gte: Number(priceStart), // Price should be greater than or equal to priceStart
//           },
//         },
//         {
//           price: {
//             lte: Number(priceEnd), // Price should be less than or equal to priceEnd
//           },
//         },
//       ],
//     },
//   });
//   const meta = {
//     page,
//     limit,
//     total,
//   };
//   return {
//     meta,
//     result,
//   };
// };

const publicAllProductsDB = async (
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, priceStart, priceEnd, ...filterData } = queryObj;

  const andCondition = [];

  // Search term condition
  if (searchTerm) {
    andCondition.push({
      OR: shopAllProductsSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filter conditions
  if (Object.keys(filterData).length > 0) {
    if (filterData?.isAvailable) {
      filterData.isAvailable =
        typeof filterData.isAvailable === "string"
          ? filterData.isAvailable === "true"
          : filterData.isAvailable;
    }

    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as never],
        },
      })),
    });
  }

  // Price range filter (conditionally added)
  if (priceStart !== undefined || priceEnd !== undefined) {
    const priceConditions = [];
    if (priceStart !== undefined) {
      priceConditions.push({
        price: {
          gte: Number(priceStart),
        },
      });
    }
    if (priceEnd !== undefined) {
      priceConditions.push({
        price: {
          lte: Number(priceEnd),
        },
      });
    }
    andCondition.push(...priceConditions);
  }

  const whereConditions: Prisma.UserWhereInput = {
    AND: andCondition as any,
    isDelete: false, // Always exclude deleted products
  };

  // Fetch filtered products
  const result = await prisma.product.findMany({
    where: whereConditions as any,
    include: {
      category: true,
      subCategory: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  // Count total filtered products
  const total = await prisma.product.count({
    where: whereConditions as any,
  });

  return {
    meta: { page, limit, total },
    result,
  };
};

const publicCompareProductDB = async (productIds: string[]) => {
  if (productIds?.length > 3) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, "Longer then 3");
  }
  const result = await prisma.product.findMany({
    where: {
      isDelete: false,
      id: {
        in: productIds,
      },
    },
    include: {
      category: true,
    },
  });
  return result;
};

const findRelevantProductDB = async (
  categoryIds: string[],
  queryObj: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  if (categoryIds?.length > 0) {
    const result = await prisma.product.findMany({
      where: {
        isDelete: false,
        categoryId: {
          in: categoryIds,
        },
      },

      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const total = await prisma.product.count({
      where: {
        isDelete: false,
        categoryId: {
          in: categoryIds,
        },
      },
    });

    const meta = {
      page,
      limit,
      total,
    };

    return {
      meta,
      result,
    };
  } else {
    const result = await prisma.product.findMany({
      where: {
        isDelete: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    });
    const total = await prisma.product.count();

    const meta = {
      page,
      limit,
      total,
    };

    return {
      meta,
      result,
    };
  }
};

const productReviewByPaymentDB = async (
  tokenUser: any,
  paymentId: string,
  payload: any
) => {
  const paymentInfo = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
      paymentStatus: PaymentStatus.confirm,
    },
    include: {
      paymentAndProduct: {
        select: {
          product: true,
        },
      },
    },
  });

  const productIds = paymentInfo.paymentAndProduct.map(
    (item: any) => item?.product?.id
  );

  // check is user create review table
  if (paymentInfo?.userId === tokenUser?.id) {
    const result = await prisma.$transaction(async (tx) => {
      // create review
      const createReview = await tx.productReview.create({
        data: {
          paymentId: paymentInfo.id,
          userId: paymentInfo.userId,
          userMessage: payload?.userMessage,
          rating: payload?.rating ? payload?.rating : null,
        },
      });
      if (payload?.rating === 0 || payload?.rating) {
        for (const item of productIds) {
          // Find the product
          const findProduct = await tx.product.findFirst({
            where: {
              id: item,
            },
          });

          if (!findProduct) {
            continue; // Skip if the product is not found
          }

          // Calculate averageRating and totalSubmitRating
          const totalUserGiveRating = findProduct.totalUserGiveRating ?? 0;
          const averageRating =
            totalUserGiveRating > 0
              ? (payload.rating + findProduct.totalSubmitRating) /
                (totalUserGiveRating + 1)
              : payload.rating;
          const totalSubmitRating =
            payload.rating + (findProduct.totalSubmitRating || 0);

          // Update product
          await tx.product.update({
            where: {
              id: item,
            },
            data: {
              averageRating: Math.ceil(averageRating),
              totalSubmitRating: totalSubmitRating,
              totalUserGiveRating: totalUserGiveRating + 1,
            },
          });
        }
      }
      return createReview;
    });

    if (!result) {
      throw new AppError(StatusCodes.CONFLICT, "Some things went wrong");
    }
    return result;
  } else {
    throw new AppError(StatusCodes.CONFLICT, "User dose not match");
  }
};

const vendorOrShopRepliedReviewsDB = async (tokenUser: any, payload: any) => {
  const findProductReviewInfo = await prisma.productReview.findUniqueOrThrow({
    where: {
      userId_paymentId: {
        userId: payload?.userId,
        paymentId: payload?.paymentId,
      },
    },
  });

  if (!findProductReviewInfo?.shopMessage && payload?.shopMessage) {
    const updateShopMessage = await prisma.productReview.update({
      where: {
        userId_paymentId: {
          userId: findProductReviewInfo?.userId,
          paymentId: findProductReviewInfo?.paymentId,
        },
      },
      data: {
        shopMessage: payload?.shopMessage,
      },
    });
    return updateShopMessage;
  } else {
    throw new AppError(StatusCodes.CONFLICT, "shop message update failed");
  }
};

const findSingleProductAllReviewDB = async (productId: string) => {
  const result = await prisma.productReview.findMany({
    where: {
      payment: {
        paymentAndProduct: {
          some: {
            productId,
            paymentStatus: PaymentStatus.confirm,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          userProfile: {
            select: {
              profilePhoto: true,
            },
          },
        },
      },
    },
    take: 15,
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const vendorFindHisAllProductDB = async (tokenUser: any) => {
  const result = prisma.product.findMany({
    where: {
      shop: {
        vendorId: tokenUser?.id,
      },
      isDelete: false,
    },
    select: {
      id: true,
      productName: true,
    },
  });
  return result;
};
const vendorFindSingleProductDB = async (tokenUser: any, productId: string) => {
  const result = prisma.product.findUniqueOrThrow({
    where: {
      id: productId,
      shop: {
        vendorId: tokenUser?.id,
      },
      isDelete: false,
    },
  });
  return result;
};

export const productService = {
  createProductDB,
  updateProductDB,
  findVendorShopAllProductsDB,
  adminFindAllProductsDB,
  publicTopSaleProductDB,
  publicSingleProductDb,
  publicFlashSaleProductDB,
  publicPromoCheckDB,
  publicAllProductsDB,
  publicCompareProductDB,
  findRelevantProductDB,
  productReviewByPaymentDB,
  vendorOrShopRepliedReviewsDB,
  findSingleProductAllReviewDB,
  vendorFindHisAllProductDB,
  vendorFindSingleProductDB,
};
