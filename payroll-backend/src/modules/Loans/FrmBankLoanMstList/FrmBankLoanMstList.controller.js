const { success } = require("zod");
const asyncHandler = require("../../../libs/asyncHandler");
const { fail, ok } = require("../../../libs/response");
const service = require("./FrmBankLoanMstList.service")

exports.getULBwiseEmployeeController = asyncHandler(
    async (req, res) => {
        console.log("Request Body:", req.body);
        const { ulbid } = req.body;
        if (!ulbid) {
            fail(res, error = "ulbid is required")
        }

        const data = await service.getULBwiseEmployeeService({ ulbid })
        return ok(res, data, data.message || "Employee list fetched successfully")
    }
)

exports.getPayHeadController = asyncHandler(
    async (req, res) => {
        console.log("Request Body", req.body);
        const { ulbid } = req.body;

        if (!ulbid) {
            fail(res, error = "ulbid is required");
        }

        const data = await service.getPayHeadService({ ulbid });
        return ok(res, data, data.message || "Pay Head List fetched sucessfully")
    }
)

exports.getBankLoanList = asyncHandler(
    async (req, res) => {
        console.log("📥 Request Body:", req.body);
        const { ulbid, zoneid, deptid, empid, payheadid } = req.body;

        if (!ulbid) {
            fail(res, error = "ulbid is required");
        }
        
        const data = await service.getBankLoanListService({ ulbid, zoneid, deptid, empid, payheadid });
        return ok(res, data, data.message || "Bank loan list fetched successfully");
    }
);