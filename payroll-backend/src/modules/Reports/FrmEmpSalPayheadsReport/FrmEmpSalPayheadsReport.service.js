const repo = require("./FrmEmpSalPayheadsReport.repo");

async function getMonthListService() {
  const data = await repo.getMonthListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getYearListService() {
  const data = await repo.getYearListRepo();
  return {
    success: true,
    count: data.length,
    data,
  };
}

async function getEmpSalPayheadsReportService(payload) {
  const data = await repo.getEmpSalPayheadsReportRepo(payload);
   if (!data || data.length === 0) {
    return {
      success: false,
      message: "No data found",
    };
  }
  return {
    success: true,
    count: data.length,
    data,
  };
}

module.exports = {
  getMonthListService,
  getYearListService,
  getEmpSalPayheadsReportService
};