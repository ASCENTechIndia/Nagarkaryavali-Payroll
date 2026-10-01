const repo = require("./FrmAttendenceExcellAuthListMst.repo");

const getAttendanceSummaryService = async (body) => {
  return await repo.getAttendanceSummary(body);
};

const getAttendanceDetailService = async (body) => {
  return await repo.getAttendanceDetail(body);
};

const manageAttendanceService = async (body) => {
  const result = await repo.executeAttendanceProcedure(body);

  return {
    success: Number(result.out_errorcode) === 9999,
    errorCode: result.out_errorcode,
    message: result.out_errormsg,
  };
};

module.exports = {
  getAttendanceSummaryService,
  getAttendanceDetailService,
  manageAttendanceService,
};
