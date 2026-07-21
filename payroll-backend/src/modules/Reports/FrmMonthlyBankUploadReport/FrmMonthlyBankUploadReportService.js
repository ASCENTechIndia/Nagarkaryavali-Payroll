const repo = require("./FrmMonthlyBankUploadReportRepo");

async function generateMonthlyBankUploadReportService(payload) {
  console.log("Service: Generate Monthly Bank Upload Report", payload);

  const {
    departmentId,
    month,
    year,
  } = payload;

  // Calculate last date of selected month
  const lastDate = new Date(
    parseInt(year),
    parseInt(month),
    0
  );

  const formattedLastDate = formatDate(lastDate);

  const reportData =
    await repo.getMonthlyBankUploadReportDataRepo({
      departmentId,
      lastDate: formattedLastDate,
    });

  if (!reportData || reportData.length === 0) {
    throw new Error("Record Not Found");
  }

  return {
    success: true,
    count: reportData.length,
    data: reportData,
    message: "Monthly Bank Upload Report fetched successfully",
  };
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString("default", {
    month: "short",
  });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

module.exports = {
  generateMonthlyBankUploadReportService,
};