const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmEmpLeaveList.service");


exports.getEmployeeLeaveBalance =
  asyncHandler(

    async (req, res) => {

      console.log(
        "📥 Request Body:",
        req.body
      );

      const payload = {

        ulbId:
          req.body.ulbId,

        empId:
          req.body.empId,

        empName:
          req.body.empName,

        deptId:
          req.body.deptId,

        categoryId:
          req.body.categoryId

      };

      const data =
        await service.getEmployeeLeaveBalanceService(
          payload
        );

      return ok(
        res,
        data,
        "Employee leave balance fetched successfully"
      );
    }
  );



exports.saveEmployeeLeaveBalance =
  asyncHandler(

    async (req, res) => {

      console.log(
        "📥 Request Body:",
        req.body
      );

      const data =
        await service.saveEmployeeLeaveBalanceService(
          req.body
        );

      return ok(
        res,
        data,
        data.message
      );
    }
  );