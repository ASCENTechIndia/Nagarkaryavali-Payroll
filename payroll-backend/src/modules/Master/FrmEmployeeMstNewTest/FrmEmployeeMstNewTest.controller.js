const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmEmployeeMstNewTest.service");

exports.getEmployeeBank = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);
    const { empid, ulbid } = req.body;
    if (!empid) {
        throw new AppError("empid is required", 400);
    }
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const payload = { empid, ulbid, };

    const data = await service.getEmployeeBankService(payload);
    return ok(
        res,
        data,
        "Employee bank details fetched successfully"
    );
});

exports.getSalaryEarning = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { empid, ulbid } = req.body;
    if (!empid) {
        throw new AppError("empid is required", 400);
    }
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const payload = { empid, ulbid };

    const data = await service.getSalaryEarningService(payload);
    return ok(
        res,
        data,
        "Salary earnings fetched successfully"
    );
});

exports.getSalaryDeduction = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { empid, ulbid } = req.body;
    if (!empid) {
        throw new AppError("empid is required", 400);
    }
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const payload = { empid, ulbid };

    const data = await service.getSalaryDeductionService(payload);
    return ok(
        res,
        data,
        "Salary deductions fetched successfully"
    );
});

exports.getGradeList = asyncHandler(async (req, res) => {
    const data = await service.getGradeListService();
    return ok(
        res,
        data,
        "Grade list fetched successfully"
    );
});

exports.getDesignationList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }

    const data = await service.getDesignationListService({ ulbid });
    return ok(
        res,
        data,
        "Designation list fetched successfully"
    );
});

exports.getPayScaleList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const data = await service.getPayScaleListService({ ulbid });

    return ok(
        res,
        data,
        "PayScale list fetched successfully"
    );
});

exports.getReligionList = asyncHandler(async (req, res) => {
    const data = await service.getReligionListService();
    return ok(
        res,
        data,
        "Religion list fetched successfully"
    );
});

exports.getEmployeeCategory = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { ulbid } = req.body;
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }
    const payload = { ulbid };

    const data = await service.getEmployeeCategoryService(payload);
    return ok(
        res,
        data,
        "Employee category fetched successfully"
    );
});

exports.getFestivalList = asyncHandler(async (req, res) => {
    const data = await service.getFestivalListService();
    return ok(
        res,
        data,
        "Festival list fetched successfully"
    );
});

exports.getSelectionPostList = asyncHandler(async (req, res) => {
    const { ulbid } = req.body;
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }

    const data = await service.getSelectionPostListService({ ulbid });
    return ok(
        res,
        data,
        "Selection post list fetched successfully"
    );
});

exports.getCastCategoryList = asyncHandler(async (req, res) => {
    const data = await service.getCastCategoryListService();
    return ok(
        res,
        data,
        "Cast category list fetched successfully"
    );
});

exports.getBankBranchList = asyncHandler(async (req, res) => {
    const { bankid, ulbid } = req.body;
    if (!bankid) {
        throw new AppError("bankid is required", 400);
    }
    if (!ulbid) {
        throw new AppError("ulbid is required", 400);
    }

    const data = await service.getBankBranchListService({ bankid, ulbid });
    return ok(
        res,
        data,
        "Bank branch list fetched successfully"
    );
});

exports.getBranchMasterList = asyncHandler(async (req, res) => {
    const { bankid } = req.body;
    if (!bankid) {
        throw new AppError("bankid is required", 400);
    }

    const data = await service.getBranchMasterListService({ bankid });
    return ok(
        res,
        data,
        "Branch master list fetched successfully"
    );
});

exports.getEmployeeAutoFill = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);
  const { empid, ulbid } = req.body;
  if (!empid) {
    throw new AppError("empid is required", 400);
  }
  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }
  const payload = {empid,ulbid};

  const data = await service.getEmployeeAutoFillService(payload);
  return ok(
    res,
    data,
    "Employee autofill fetched successfully"
  );
});

exports.getCasteList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);
  const { ulbid, religionid } = req.body;
  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }
  if (!religionid) {
    throw new AppError("religionid is required", 400);
  }
  const payload = {ulbid,religionid};

  const data = await service.getCasteListService(payload);
  return ok(
    res,
    data,
    "Caste list fetched successfully"
  );
});

exports.getSubCasteList = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);
  const { ulbid, casteid } = req.body;
  if (!ulbid) {
    throw new AppError("ulbid is required", 400);
  }
  if (!casteid) {
    throw new AppError("casteid is required", 400);
  }
  const payload = { ulbid, casteid};

  const data = await service.getSubCasteListService(payload);
  return ok(
    res,
    data,
    "Sub caste list fetched successfully"
  );
});

exports.saveEmployee = asyncHandler(async (req, res) => {
  console.log("📥 Request Body:", req.body);
  const data = await service.saveEmployeeService(req.body);

  return ok(
    res,
    data,
    data.message || "Employee saved successfully"
  );
});

exports.updateEmployeeImages = asyncHandler(async (req, res) => {
    console.log("📥 BODY =>", req.body);
    console.log("📥 FILES =>", req.files);
    const { empid, corpid } = req.body;
    if (!empid) {
        throw new AppError("empid is required", 400);
    }
    if (!corpid) {
        throw new AppError("corpid is required", 400);
    }
    const payload = {
        empid,
        corpid,
        BLOBSign: req.files?.BLOBSign?.[0]?.buffer || null,
        BLOBPhoto: req.files?.BLOBPhoto?.[0]?.buffer || null,
        BLOBThumb: req.files?.BLOBThumb?.[0]?.buffer || null,
    };

    const data = await service.updateEmployeeImagesService(payload);
    return ok(
        res,
        data,
        "Employee images updated successfully"
    );
});

exports.getEmployeeImages = asyncHandler(async (req, res) => {

  const { empid, corpid } = req.body;

  const data =
    await service.getEmployeeImagesService({
      empid,
      corpid,
    });

  return ok(
    res,
    data,
    "Employee images fetched successfully"
  );
});