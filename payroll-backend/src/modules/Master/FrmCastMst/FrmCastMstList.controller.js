const asyncHandler = require("../../../libs/asyncHandler");

const { ok } = require("../../../libs/response");

const service = require("./FrmCastMstList.service");

const { AppError } = require("../../../libs/errors");

// ============================================
// GET CAST LIST
// ============================================

exports.getCastList = asyncHandler(

  async (req, res) => {

    const data =
      await service.getCastListService();

    return ok(
      res,
      data,
      "Cast list fetched successfully"
    );
  }
);

// ============================================
// GET CAST BY ID
// ============================================

exports.getCastById = asyncHandler(

  async (req, res) => {

    const { castid } = req.body;

    if (!castid) {

      throw new AppError(
        "castid is required",
        400
      );
    }

    const payload = {
      castid,
    };

    const data =
      await service.getCastByIdService(
        payload
      );

    return ok(
      res,
      data,
      "Cast fetched successfully"
    );
  }
);

// ============================================
// SAVE CAST
// ============================================

exports.saveCast = asyncHandler(

  async (req, res) => {

    const castData = req.body;

    const data =
      await service.saveCastService(
        castData
      );

    return ok(
      res,
      data,
      data.message
    );
  }
);