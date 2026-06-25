const repo = require("./FrmLoansAndAdvancesReceived.repo");

async function getPayHeadsListService(ulbId) {
  const data = await repo.getPayHeadsListRepo(ulbId);
  
  return {
    success: true,
    count: data.length,
    data
  };
}

async function searchLoansAdvancesService({
  ulbId,
  payHeadId,
  empStatus,
  fromDate
}) {
  if (!ulbId) {
    throw new Error("ulbId is required");
  }
  
  if (isNaN(ulbId)) {
    throw new Error("ulbId must be a number");
  }
  
  if (fromDate) {
    const dateRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
    if (!dateRegex.test(fromDate)) {
      throw new Error("fromDate must be in format DD-MM-YYYY");
    }
  }

  const isSpecialUlb = (ulbId == 770 || ulbId == 1750);
  if (isSpecialUlb && empStatus && empStatus !== "-1") {
    if (!["OLD", "NEW"].includes(empStatus)) {
      throw new Error("empStatus must be either 'OLD' or 'NEW'");
    }
  }
  
  const data = await repo.searchLoansAdvancesRepo({
    ulbId,
    payHeadId,
    empStatus,
    fromDate,
    isSpecialUlb
  });
  
  if (!data || data.length === 0) {
    throw new Error("No records found");
  }
  
  let payHeadsName = "";
  if (payHeadId && payHeadId !== "0") {
    const payHeadsList = await repo.getPayHeadsListRepo(ulbId);
    const selectedPayHead = payHeadsList.find(ph => ph.num_payheads_id == payHeadId);
    payHeadsName = selectedPayHead ? selectedPayHead.var_payheads_ename : "";
  }
  
  return {
    success: true,
    count: data.length,
    data,
    payHeadsName,
    filters: {
      ulbId,
      payHeadId: payHeadId || "0",
      empStatus: empStatus || "-1",
      fromDate: fromDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  };
}

module.exports = {
  getPayHeadsListService,
  searchLoansAdvancesService
};