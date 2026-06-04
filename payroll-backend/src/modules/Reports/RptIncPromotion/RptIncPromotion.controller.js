const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./RptIncPromotion.service")

exports.getIncPromotionReport = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);
    const { ulbid, empid, deptid, zoneid, type, empstatus, fromDate, toDate } = req.body;

    if (!ulbid) {
        return fail(res, error = "ulbid is required", status = 400)
    }

    const payload = { ulbid, empid, deptid, zoneid, type, empstatus, fromDate, toDate};
    const data = await service.getIncPromotionReportService(payload);
    return ok(
        res,
        data,
        data.message ?? "Increment / Promotion report fetched successfully"
    );
});