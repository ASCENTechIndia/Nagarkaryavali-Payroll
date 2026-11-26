
const repo = require("./FrmDeptBillSummary.repo");

// 1. Summary Head Wise Salary
async function getSummaryHeadWiseSalaryService({
  fromDate,
  toDate,
  ulbId,
  employeeStatus = "NEW"
}) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }

  if (!fromDate || !toDate) {
    throw new Error("fromDate and toDate are required");
  }

  const data = await repo.getSummaryHeadWiseSalaryRepo({
    fromDate,
    toDate,
    ulbId,
    employeeStatus
  });

  return {
    success: true,
    count: data.length,
    data
  };
}


// 2. Department Payhead Summary
async function getDepartmentPayheadSummaryService({
  fromDate,
  toDate,
  ulbId,
  deptId
}) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }

  if (!deptId || deptId === "0" || deptId === "-1") {
    throw new Error("Valid Department is required");
  }

  if (!fromDate || !toDate) {
    throw new Error("fromDate and toDate are required");
  }

  const data = await repo.getDepartmentPayheadSummaryRepo({
    fromDate,
    toDate,
    ulbId,
    deptId
  });

  return {
    success: true,
    count: data.length,
    data
  };
}


// 3. Payhead Master
async function getPayheadMasterService(ulbId) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }

  const data = await repo.getPayheadMasterRepo(ulbId);

  return {
    success: true,
    count: data.length,
    data
  };
}


module.exports = {
  getSummaryHeadWiseSalaryService,
  getDepartmentPayheadSummaryService,
  getPayheadMasterService
};
