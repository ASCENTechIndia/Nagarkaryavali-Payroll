const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const service = require("./FrmEmpLstRpt.service");
const path = require("path");
const {
  EmployeeListPDFHelper,
} = require("../../../utils/pdfHelper/FrmEmpLstRpt");


const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");

exports.getEmployeeList = asyncHandler(async (req, res) => {
    const {
        ulbid,
        empId,
        categoryId,
        deptId,
        desigId,
        gender,
        empStatus
    } = req.body;

    const result = await service.getEmployeeListService({
        ulbid,
        empId,
        categoryId,
        deptId,
        desigId,
        gender,
        empStatus
    });

    return ok(res, result, "Employee list fetched successfully");
});

exports.generateEmployeeListPDF = asyncHandler(async (req, res) => {

  const filters = req.body;

  const result = await service.getEmployeeListService(filters);

//   const ulbInfo = await getCorporationService({
//     ulbId: filters.ulbid,
//   });


  const ulbInfo = {
    ULBLOGO: "",
    ABC_MUNICIPAL_TEXT: "सांगली, मिरज आणि कुपवाड शहर महानगरपालिका",
  };

  const pdf = await EmployeeListPDFHelper({
    rows: result.data,
    ulbInfo,
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const pdfUrl =
    `${baseUrl}/pdf/${path.basename(pdf.filePath)}`;

  return res.json({
    success: true,
    message: "Employee List PDF Generated Successfully",
    fileName: pdf.fileName,
    pdfUrl,
  });
});


exports.getSalaryDetail = asyncHandler(async (req, res) => {

    const {
        lstdate,
        ulbid,
        deptId,
        gender
    } = req.body;

    const result =
        await service.getSalaryDetailService({
            lstdate,
            ulbid,
            deptId,
            gender
        });

    return ok(
        res,
        result,
        "Salary detail fetched successfully"
    );
});

exports.getEmployeeSubDetail = asyncHandler(async (req, res) => {

    const {
        lstdate,
        ulbid,
        deptId,
        gender
    } = req.body;

    const result =
        await service.getEmployeeSubDetailService({
            lstdate,
            ulbid,
            deptId,
            gender
        });

    return ok(
        res,
        result,
        "Employee sub detail fetched successfully"
    );
});

exports.getPayheadSalaryDetail = asyncHandler(async (req, res) => {

    const {
        lstdate,
        ulbid,
        deptId,
        gender
    } = req.body;

    const result =
        await service.getPayheadSalaryDetailService({
            lstdate,
            ulbid,
            deptId,
            gender
        });

    return ok(
        res,
        result,
        "Payhead salary detail fetched successfully"
    );
});


