const repo = require("./FrmAttendanceEntryUpdate.repo");

async function getAttendanceEntryUpdateService(payload) {
  console.log("📥 Service: Attendance Entry Update", payload);

  const result = await repo.getAttendanceEntryUpdateRepo(payload);

  if (result.salaryGenerated) {
    return {success: false, message: "Salary Already Generated For this Department"};
  }
  if (!result.rows || result.rows.length === 0) {
    return {success: false, message: "No data Found"};
  }

  return {success: true, count: result.rows.length, data: result.rows};
}

async function saveBulkAttendanceService(payload) {
  console.log("📥 Service : Save Bulk Attendance", payload);

  const result = await repo.saveBulkAttendanceRepo(payload);
  return {
    success: result.out_errorcode === 9999,
    errorCode: result.out_errorcode,
    message: result.out_errormsg,
  };
}

module.exports = {
  getAttendanceEntryUpdateService,
  saveBulkAttendanceService
};