const asyncHandler = require("../../../libs/asyncHandler")
const { ok, fail } = require("../../../libs/response")
const service = require("./FrmEmployeeDtls.service")

exports.getEmployeeDetailsController = asyncHandler(
    async (req, res) => {
        console.log("Controller: Get Employee Details", req.body);
        const { ulbid, empid } = req.body;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        if (!empid) {
            return fail(res, "empid is required");
        }

        const data = await service.getEmployeeDetailsService(ulbid, empid);
        return ok(res, data, data?.message ?? "Employee details fetched successfully");
    }
)

exports.getEmployeeImagesController = asyncHandler(
    async (req, res) => {
        console.log("Controller: Get Employee Images", req.body);
        const { ulbid, empid } = req.body;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        if (!empid) {
            return fail(res, "empid is required");
        }

        const data = await service.getEmployeeImagesService(ulbid, empid);
        return ok(res, data, data?.message ?? "Employee images fetched successfully");
    }
)

exports.getOfficeGradeListController = asyncHandler(
    async (req, res) => {
        console.log("Controller: Get Office Grade List", req.body);
        const { ulbid } = req.body;

        if (!ulbid) {
            return fail(res, "ulbid is required");
        }

        const data = await service.getOfficeGradeListService(ulbid);
        return ok(res, data, data?.message ?? "Office grade list fetched successfully");
    }
)