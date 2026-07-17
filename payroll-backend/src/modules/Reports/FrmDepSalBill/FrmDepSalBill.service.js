const repo = require("./FrmDepSalBill.repo");

const getEarningDeductionTotalDataService = async (requestData) => {
  const payload = {
    salaryDate: requestData.salaryDate || "",
    ulbId: String(requestData.ulbId || "").trim(),
    zoneId: String(requestData.zoneId || "0").trim(),
    deptId: String(requestData.deptId || "-1").trim(),
    categoryId: String(requestData.categoryId || "0").trim(),
    gradeId: String(requestData.gradeId || "0").trim(),
    subDeptId: String(requestData.subDeptId || "").trim(),
    reportType: requestData.reportType || "EARN",
  };

  console.log("Service Payload:", payload);

  if (!payload.salaryDate) {
    throw new Error("Salary Date is a required parameter.");
  }
  if (!payload.ulbId || payload.ulbId === "0") {
    throw new Error("A valid Tenant/ULB ID must be provided.");
  }
  if (!payload.zoneId || payload.zoneId === "0") {
    throw new Error("Zone selection is required.");
  }

  const result = await repo.getEarningDeductionTotalData(payload);

  if (!result.success) {
    return {
      status: "EMPTY",
      message: result.message || "No records found",
      data: {
        reportHeaderTitle: "",
        headers: {},
        employees: [],
        reportTotals: {},
        aggregates: { earn: 0, deduct: 0, net: 0 },
      },
    };
  }

  return {
    status: "SUCCESS",
    message: "Data retrieved successfully.",
    data: {
      reportHeaderTitle: result.reportHeaderTitle || "",
      headers: result.headers || {},
      employees: result.employees || [],
      reportTotals: result.reportTotals || {},
      aggregates: {
        earn: result.grandEarn || 0,
        deduct: result.grandDeduct || 0,
        net: result.grandNet || 0,
      },
      meta: {
        totalRecords: result.rowCount || 0,
      },
    },
  };
};

module.exports = {
  getEarningDeductionTotalDataService,
};