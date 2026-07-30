const express = require("express");
const router = express.Router();
const controller = require("./FrmLeaveApplicationList.controller");
const auth = require("../../../middlewares/auth.middleware");


router.post(
  "/leavelist",
  controller.getLeaveList
);


router.get(
  "/departmentlist",auth(),
  controller.getDepartmentList
);


router.get(
  "/designationlist",auth(),
  controller.getDesignationList
);


router.post(
  "/employeelist",auth(),
  controller.getEmployeeList
);


router.post(
  "/employeedetails",auth(),
  controller.getEmployeeDetails
);


router.post(
  "/pendingleaves",auth(),
  controller.getPendingLeave
);


router.post(
  "/employeeleavesummary",auth(),
  controller.getEmployeeLeaveSummary
);


router.post(
  "/employeeleavebalance",
  controller.getEmployeeLeaveBalance
);


router.post(
  "/saveemployeeleave",auth(),
  controller.saveEmployeeLeave
);

module.exports = router;
