const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./RptLeaveStatus.service")

exports.leaveTypeController = () => asyncHandler(
    async (req,res) => {
        const data = await service.leaveTypeService();
        return ok(res, data, data.message || "Leave Type fetched successfully")
    }
)

exports.getLeaveReport = asyncHandler(
    async (req, res) => {
        console.log("📥 Request Body:", req.body);
        const { ulbid, fromMonth, leaveTypeId, empid } = req.body;

        if (!ulbid) {
            return fail(res, error = "ulbid is required", status = 400)
        }

        if (!fromMonth) {
            return fail(res, error = "Date is required", status = 400)
        }

        const payload = { ulbid, fromMonth, leaveTypeId, empid };
        const data = await service.getLeaveReportService(payload);
        return ok( res, data, data.message ?? "Leave report fetched successfully");
    }
);