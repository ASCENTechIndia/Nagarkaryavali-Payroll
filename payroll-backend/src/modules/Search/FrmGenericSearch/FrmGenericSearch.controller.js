const asyncHandler = require("../../../libs/asyncHandler")
const { ok } = require("../../../libs/response")
const service = require("./FrmGenericSearch.service")

exports.getCorporationController = asyncHandler(
    async(req, res) => {
        const data = await service.getCorporationService()

        return ok(res, data, data?.message ?? "Corporation List Fetched Successfully")
    }
)

exports.getEmployeeSearchController = asyncHandler(
  async (req, res) => {
    console.log("Request Body:", req.body);
    const { ulbid } = req.body;

    if (!ulbid) {
      return fail(res, "ulbid is required");
    }

    const data =await service.getEmployeeSearchService(req.body);
    return ok( res, data, data.message ?? "Employee list fetched successfully");
  }
);