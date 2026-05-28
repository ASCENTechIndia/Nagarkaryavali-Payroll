const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmBranchMstList.service");

const { AppError } = require("../../../libs/errors");



exports.getBankList = asyncHandler(

  async (req, res) => {

    const { ulbid } = req.body;

    if (!ulbid) {

      throw new AppError(
        "ulbid is required",
        400
      );
    }

    const payload = {
      ulbid
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


exports.getBranchList = asyncHandler(

  async (req, res) => {

    const {
      bankId,
      searchText
    } = req.body;

    const payload = {
      bankId,
      searchText
    };

    const data =
      await service.getBranchListService(
        payload
      );

    return ok(
      res,
      data,
      "Branch list fetched successfully"
    );
  }
);


exports.getBranchById = asyncHandler(

  async (req, res) => {

    const { branchId } = req.body;

    if (!branchId) {

      throw new AppError(
        "branchId is required",
        400
      );
    }

    const payload = {
      branchId
    };

    const data =
      await service.getBranchByIdService(
        payload
      );

    return ok(
      res,
      data,
      "Branch fetched successfully"
    );
  }
);


exports.saveBranch = asyncHandler(

  async (req, res) => {

    const branchData = req.body;

    const data =
      await service.saveBranchService(
        branchData
      );

    return ok(
      res,
      data,
      data.message
    );
  }
);