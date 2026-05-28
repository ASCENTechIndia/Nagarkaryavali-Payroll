const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmLeaveListMst.service");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET LEAVE LIST
// ============================================

exports.getLeaveList = asyncHandler(

  async (req, res) => {

    const { corpId } = req.body;

    if (!corpId) {

      throw new AppError(
        "corpId is required",
        400
      );
    }

    const payload = {
      corpId
    };

    const data =
      await service.getLeaveListService(
        payload
      );

    return ok(
      res,
      data,
      "Leave list fetched successfully"
    );
  }
);

// ============================================
// GET LEAVE BY ID
// ============================================

exports.getLeaveById = asyncHandler(

  async (req, res) => {

    const {
      corpId,
      leaveId
    } = req.body;

    if (!corpId) {

      throw new AppError(
        "corpId is required",
        400
      );
    }

    if (!leaveId) {

      throw new AppError(
        "leaveId is required",
        400
      );
    }

    const payload = {
      corpId,
      leaveId
    };

    const data =
      await service.getLeaveByIdService(
        payload
      );

    return ok(
      res,
      data,
      "Leave fetched successfully"
    );
  }
);

// ============================================
// SAVE LEAVE
// ============================================

exports.saveLeave = asyncHandler(

  async (req, res) => {

    const leaveData = req.body;

    const data =
      await service.saveLeaveService(
        leaveData
      );

    return ok(
      res,
      data,
      data.message
    );
  }
);