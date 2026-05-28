const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmLeaveApplicationList.service");


exports.getLeaveList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getLeaveListService(
        req.body
      );

    return ok(
      res,
      data,
      "Leave list fetched successfully"
    );
  }
);


exports.getDepartmentList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getDepartmentListService();

    return ok(
      res,
      data,
      "Department list fetched successfully"
    );
  }
);


exports.getDesignationList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getDesignationListService();

    return ok(
      res,
      data,
      "Designation list fetched successfully"
    );
  }
);


exports.getEmployeeList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getEmployeeListService(
        req.body
      );

    return ok(
      res,
      data,
      "Employee list fetched successfully"
    );
  }
);


exports.getEmployeeDetails = asyncHandler(

  async (req, res) => {

    const data =
      await service.getEmployeeDetailsService(
        req.body
      );

    return ok(
      res,
      data,
      "Employee details fetched successfully"
    );
  }
);

exports.getPendingLeave = asyncHandler(

  async (req, res) => {

    const data =
      await service.getPendingLeaveService(
        req.body
      );

    return ok(
      res,
      data,
      "Pending leave fetched successfully"
    );
  }
);


exports.getEmployeeLeaveSummary = asyncHandler(

  async (req, res) => {

    const data =
      await service.getEmployeeLeaveSummaryService(
        req.body
      );

    return ok(
      res,
      data,
      "Employee leave summary fetched successfully"
    );
  }
);


exports.getEmployeeLeaveBalance = asyncHandler(

  async (req, res) => {

    const data =
      await service.getEmployeeLeaveBalanceService(
        req.body
      );

    return ok(
      res,
      data,
      "Employee leave balance fetched successfully"
    );
  }
);


exports.saveEmployeeLeave = asyncHandler(

  async (req, res) => {

    const data =
      await service.saveEmployeeLeaveService(
        req.body
      );

    return ok(
      res,
      data,
      data.message
    );
  }
);