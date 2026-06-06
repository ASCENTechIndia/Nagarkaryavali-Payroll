const repo = require("./FrmLoanAndAdvancedReceived.repo");
const { AppError } = require("../../../libs/errors");


const getLoanAndAdvancedReceivedService = async (payload) => {
  const {
    ulbId,
    payHeadId,
    salaryDate,
    employeeType,
  } = payload;

  if(!ulbId){
    throw new Error("No ulbId");
  }

  if (!payHeadId) {
    throw new Error("Please Select PayHead");
  }

  const data =
    await repo.getLoanAndAdvancedReceivedRepo(
      ulbId,
      payHeadId,
      salaryDate,
      employeeType
    );

  if (!data.length) {
    throw new Error("No Records Found");
  }

  return data;
};

module.exports = {
  getLoanAndAdvancedReceivedService,
};