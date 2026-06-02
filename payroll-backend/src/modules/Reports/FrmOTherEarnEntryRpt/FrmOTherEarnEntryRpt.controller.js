const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmOTherEarnEntryRpt.service")

exports.getEmployeeController = () => asyncHandler(
    async(req, res) => {
        const data = await service.getEmployeeService();
        return ok(res, data, data?.message ?? "Employee list feteched successfully")
    }
)

exports.getEarnEntryController = () => asyncHandler(
    async(req, res) => {
        const { ulbid, salaryYear, empid} = req?.body
        if (!ulbid) {
            return fail(res, error = "ulbid is required", status = 400)
        }
        if (!salaryYear) {
             return fail(res, error = "Employee Salary Year is required", status = 400)
        }
        // if(!empid){
        //     return fail(res, error = "Employee ID is required", status = 400)
        // }
        const data = await service.getEarnEntryService(req.body)
        return ok(res, data, data?.message ?? "Earn Entry data fetched successfully")
    }
)