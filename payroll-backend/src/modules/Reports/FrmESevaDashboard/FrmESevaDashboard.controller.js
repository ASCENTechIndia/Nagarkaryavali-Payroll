const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmESevaDashboard.service");
const { getCorporationService } = require("../../MenuAccess/MenuAccess.service");
const { generateESevaDashboardPDF } = require("../../../utils/pdfHelper/FrmESevaDashboard");
const path = require("path");

exports.getVibhagDashboard = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    const data = await service.getVibhagDashboardService({ ulbid });
    return ok(res, data, "Vibhag dashboard fetched successfully");
});

exports.getEmployeeList = asyncHandler(async (req, res) => {
    const { ulbid, vibhagId, type } = req.body;
    const data = await service.getEmployeeListService({ ulbid, vibhagId, type });
    return ok(res, data, "Employee list fetched successfully");
});

const formatDateIST = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

exports.generatePdf = asyncHandler(async (req, res) => {
    const {
        ulbid,
        vibhagId,
        type,
        reportType = "VIBHAG",
        vibhagName = ""
    } = req.body;

    if (!ulbid) throw new AppError("ulbid is required", 400);

    let data = [];
    let listType = "Total";

    if (reportType === "VIBHAG") {
        data = await service.getVibhagDashboardService({ ulbid });
    } else if (reportType === "EMPLOYEE") {
        if (!vibhagId) throw new AppError("vibhagId is required", 400);
        if (!type)     throw new AppError("type is required", 400);
        listType = type;

        const rawData = await service.getEmployeeListService({ ulbid, vibhagId, type });

        data = rawData.map((row) => ({
            ...row,
            JOINDATE:      formatDateIST(row.JOINDATE),
            RETIREMNTDATE: formatDateIST(row.RETIREMNTDATE),
            STATUS:        row.STATUS || row.Status || ""
        }));
    } else {
        throw new AppError("Invalid reportType. Allowed: VIBHAG | EMPLOYEE", 400);
    }

    if (!data || data.length === 0) {
        return res.json({
            success: true,
            message: "No records found.",
            count: 0
        });
    }

    const corpInfo = await getCorporationService({ ulbId: ulbid });

    const pdfResult = await generateESevaDashboardPDF({
        reportType,
        data,
        ulbName: corpInfo?.ABC_MUNICIPAL_TEXT || "",
        corporationLogo: corpInfo?.ULBLOGO || "",
        userName: req.user?.userName || req.user?.name || "",
        vibhagName,
        listType
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/pdf/${path.basename(pdfResult.filePath)}`;

    return res.json({
        success: true,
        message: "PDF Generated Successfully",
        fileName: pdfResult.fileName,
        pdfUrl,
        recordCount: data.length,
        reportType
    });
});