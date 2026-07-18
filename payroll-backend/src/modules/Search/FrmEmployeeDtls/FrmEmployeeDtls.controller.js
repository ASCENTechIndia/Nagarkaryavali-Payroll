const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmEmployeeDtls.service");

exports.getEmployeeDetailsController = asyncHandler(
    async (req, res) => {
        
        const { ulbid, empid } = req.body;

        if (!ulbid) {
            console.error(" ulbid is missing");
            return fail(res, "ulbid is required");
        }

        if (!empid) {
            console.error(" empid is missing");
            return fail(res, "empid is required");
        }

        console.log(`Fetching details for ulbid: ${ulbid}, empid: ${empid}`);
        
        const data = await service.getEmployeeDetailsService(ulbid, empid);
        
        if (!data.success) {
            console.error("Service returned error:", data.message);
            return fail(res, data.message);
        }
        
        console.log("Employee details fetched successfully");
        return ok(res, data, data?.message ?? "Employee details fetched successfully");
    }
);
