const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmLeaveApprovalList.service");


exports.getPendingLeaveList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getPendingLeaveListService(
        req.body
      );

    return ok(
      res,
      data,
      "Pending leave list fetched successfully"
    );
  }
);


exports.getLeaveTypeList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getLeaveTypeListService(
        req.body
      );

    return ok(
      res,
      data,
      "Leave type list fetched successfully"
    );
  }
);


exports.getLeaveApprovalDetails = asyncHandler(

  async (req, res) => {

    const data =
      await service.getLeaveApprovalDetailsService(
        req.body
      );

    return ok(
      res,
      data,
      "Leave approval details fetched successfully"
    );
  }
);