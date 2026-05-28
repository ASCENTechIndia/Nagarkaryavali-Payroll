const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmBankList.service");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET BANK LIST
// ============================================

exports.getBankList = asyncHandler(

  async (req, res) => {

    console.log(
      "📥 Request Body:",
      req.body
    );

    const { searchText } = req.body;

    const payload = {
      searchText
    };

    const data =
      await service.getBankListService(
        payload
      );

    return ok(
      res,
      data,
      "Bank list fetched successfully"
    );
  }
);

// ============================================
// GET BANK BY ID
// ============================================

exports.getBankById = asyncHandler(

  async (req, res) => {

    console.log(
      "📥 Request Body:",
      req.body
    );

    const { bankId } = req.body;

    if (!bankId) {

      throw new AppError(
        "bankId is required",
        400
      );
    }

    const payload = {
      bankId
    };

    const data =
      await service.getBankByIdService(
        payload
      );

    return ok(
      res,
      data,
      "Bank fetched successfully"
    );
  }
);

// ============================================
// SAVE BANK
// ============================================

exports.saveBank = asyncHandler(

  async (req, res) => {

    const bankData = req.body;

    const data =
      await service.saveBankService(
        bankData
      );

    return ok(
      res,
      data,
      data.message
    );
  }
);