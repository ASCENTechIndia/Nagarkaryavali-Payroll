const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmPayrollReport.service");
const {
  PayrollReportPDFHelper,
} = require("../../../utils/pdfHelper/FrmPayrollReport");
const {
  getCorporationService,
} = require("../../MenuAccess/MenuAccess.service");
const path = require("path");

exports.getMonthList = asyncHandler(async (req, res) => {
  const data = await service.getMonthListService();
  return ok(res, data, "Month list fetched successfully");
});

exports.getYearList = asyncHandler(async (req, res) => {
  const data = await service.getYearListService();
  return ok(res, data, "Year list fetched successfully");
});

exports.getPayrollReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, ulbid, deptId, zoneId, empStatus, reportType } =
    req.body;

  const data = await service.getPayrollReportService({
    startDate,
    endDate,
    ulbid,
    deptId,
    zoneId,
    empStatus,
    reportType,
  });

  return ok(res, data, "Payroll report generated successfully");
});

exports.generatePayrollPDF = asyncHandler(async (req, res) => {
  const filters = req.body;

  const reportResult = await service.getPayrollReportService(filters);

//   const ulbInfo = await getCorporationService({
//     ulbId: filters.ulbid,
//   });

    const ulbInfo = {
        ULBLOGO: "", 
        ABC_MUNICIPAL_TEXT: "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका"
    };

  const pdf = await PayrollReportPDFHelper({
    rows: reportResult.data,

    reportType: filters.reportType,

    reportName: reportResult.reportName,

    filters: reportResult.filters,

    ulbInfo,
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl = `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,

    message: "Payroll PDF Generated Successfully",

    fileName: pdf.fileName,

    pdfUrl,
  });
});
