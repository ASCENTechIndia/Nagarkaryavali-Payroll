const repo = require("./FrmDeductionPayheadsDtls.repo");

async function getDepartmentsService(ulbId) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }
  
  const data = await repo.getDepartmentsRepo(ulbId);
  
  return {
    success: true,
    count: data.length,
    data
  };
}

async function getPayHeadsListService(ulbId) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }
  
  const data = await repo.getPayHeadsListRepo(ulbId);
  
  return {
    success: true,
    count: data.length,
    data
  };
}

async function searchDeductionsService({
  ulbId,
  deptId,
  payheadId,
  salDate
}) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }
  
  if (!deptId || deptId === "0" || deptId === "-1") {
    throw new Error("Valid Department is required");
  }
  
  if (!payheadId || payheadId === "0" || payheadId === "-1") {
    throw new Error("Valid Payhead is required");
  }
  
  if (salDate) {
    const dateRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
    if (!dateRegex.test(salDate)) {
      throw new Error("salDate must be in format DD-MMM-YYYY");
    }
  }
  
  const data = await repo.searchDeductionsRepo({
    ulbId,
    deptId,
    payheadId,
    salDate
  });
  
  if (!data || data.length === 0) {
    throw new Error("No records found");
  }
  
  // Get payhead name
  let payheadName = "";
  const payheadsList = await repo.getPayHeadsListRepo(ulbId);
  const selectedPayhead = payheadsList.find(ph => ph.num_payheads_id == payheadId);
  payheadName = selectedPayhead ? selectedPayhead.var_payheads_ename : "";
  
  return {
    success: true,
    count: data.length,
    data,
    payheadName,
    filters: {
      ulbId,
      deptId,
      payheadId,
      salDate
    }
  };
}

module.exports = {
  getDepartmentsService,
  getPayHeadsListService,
  searchDeductionsService
};