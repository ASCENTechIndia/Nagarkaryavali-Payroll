const repo = require("./FrmRelegionListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get Religion List Service
const getReligionListService = async () => {
  return await repo.getReligionList();
};

// ✅ Get Religion Details By Id Service
const getReligionDetailsByIdService = async (body) => {
  const { relId } = body;

  if (!relId) {
    throw new AppError("relId is required", 400);
  }

  return await repo.getReligionDetailsById(body);
};

async function saveReligionService(body) {
  const result = await repo.saveReligionRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (result.errorCode < 0 && result.errorCode !== -100) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getReligionListService,
  getReligionDetailsByIdService,
  saveReligionService,
};
