const repo = require("./FrmRelationListMst.repo");
const { AppError } = require("../../../libs/errors");

// ✅ Get Relation List Service
async function getRelationListService() {
  return await repo.getRelationListRepo();
}

// ✅ Get Relation Details By Id Service
async function getRelationByIdService(body) {
  if (!body.relid) {
    throw new AppError("relid is required", 400);
  }

  return await repo.getRelationByIdRepo(body);
}

// ✅ Save / Update / Delete Relation Service
async function saveRelationService(body) {
  if (!body.userId) {
    throw new AppError("userId is required", 400);
  }

  if (!body.corpId) {
    throw new AppError("corpId is required", 400);
  }

  if (!body.relname) {
    throw new AppError("Relation Name is required", 400);
  }

  if (!body.mode) {
    throw new AppError("mode is required", 400);
  }

  const result = await repo.saveRelationRepo(body);

  if (!result.success) {
    throw new AppError(result.error, 400);
  }

  if (result.errorCode < 0 && result.errorCode !== -100) {
    throw new AppError(result.errorMsg, 400);
  }

  return result;
}

module.exports = {
  getRelationListService,
  getRelationByIdService,
  saveRelationService,
};
