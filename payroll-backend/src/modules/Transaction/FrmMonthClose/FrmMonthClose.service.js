const repo = require("./FrmMonthClose.repo");

async function monthCloseService(payload) {
  console.log("📥 Service: Month Close", payload);
  const result = await repo.monthCloseRepo(payload);
  return {
    success: result?.out_ErrorCode === -100,
    errorCode: result?.out_ErrorCode,
    message: result?.out_ErrorMsg,
  };
}

module.exports = {
  monthCloseService,
};