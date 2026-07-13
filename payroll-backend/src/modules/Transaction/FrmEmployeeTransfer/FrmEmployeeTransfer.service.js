// modules/Transaction/FrmEmployeeTransfer/FrmEmployeeTransfer.service.js
const repo = require("./FrmEmployeeTransfer.repo");

// Existing services
const getDepartmentListService = async (ulbId) => {
  console.log("🔧 Service: getDepartmentListService", ulbId);
  return await repo.getDepartmentListRepo(ulbId);
};

const getDesignationListService = async (ulbId) => {
  console.log("🔧 Service: getDesignationListService", ulbId);
  return await repo.getDesignationListRepo(ulbId);
};

const getGradeListService = async (ulbId) => {
  console.log("🔧 Service: getGradeListService", ulbId);
  return await repo.getGradeListRepo(ulbId);
};

const getTransferTypesService = async () => {
  console.log("🔧 Service: getTransferTypesService");
  return await repo.getTransferTypesRepo();
};

// ✅ NEW: Transfer Department Service
const getTransferDepartmentsService = async (ulbId) => {
  console.log("🔧 Service: getTransferDepartmentsService", ulbId);
  return await repo.getTransferDepartmentsRepo(ulbId);
};

// ✅ NEW: Transfer Designation Service
const getTransferDesignationsService = async (ulbId) => {
  console.log("🔧 Service: getTransferDesignationsService", ulbId);
  return await repo.getTransferDesignationsRepo(ulbId);
};

// ✅ NEW: Transfer Grade Service
const getTransferGradesService = async (ulbId) => {
  console.log("🔧 Service: getTransferGradesService", ulbId);
  return await repo.getTransferGradesRepo(ulbId);
};

const searchEmployeeService = async (body) => {
  console.log("🔧 Service: searchEmployeeService", body);
  const { empId, ulbId } = body;
  
  const result = await repo.searchEmployeeRepo({ empId, ulbId });
  
  if (!result || result.length === 0) {
    throw new Error("Record Not Found");
  }
  
  return { success: true, data: result[0] };
};

const saveEmployeeTransferService = async (body) => {
  console.log("🔧 Service: saveEmployeeTransferService", body);
  
  if (!body.userId) throw new Error("User ID is required");
  if (!body.empId) throw new Error("Employee ID is required");
  if (!body.newDeptId || body.newDeptId === "0") throw new Error("Please select New Department");
  if (!body.newDesignId || body.newDesignId === "0") throw new Error("Please select New Designation");
  if (!body.transTypeId || body.transTypeId === "0") throw new Error("Please select Transfer Type");
  if (!body.newGradeId || body.newGradeId === "0") throw new Error("Please select Pay Grade");
  if (!body.orderNo) throw new Error("Please enter Order Number");
  if (!body.ulbId) throw new Error("ULB ID is required");
  
  const result = await repo.saveEmployeeTransferRepo(body);
  
  if (!result.success) {
    throw new Error(result.error || result.errorMsg || "Failed to save transfer");
  }
  
  return {
    success: true,
    message: result.errorMsg || "Transfer saved successfully",
    transferId: result.transferId,
  };
};

const getTransferDetailsService = async (body) => {
  console.log("🔧 Service: getTransferDetailsService", body);
  const { transferId, ulbId } = body;
  
  const result = await repo.getTransferDetailsRepo({ transferId, ulbId });
  
  if (!result || result.length === 0) {
    throw new Error("Transfer details not found");
  }
  
  return { success: true, data: result[0] };
};

module.exports = {
  getDepartmentListService,
  getDesignationListService,
  getGradeListService,
  getTransferTypesService,
  getTransferDepartmentsService,
  getTransferDesignationsService,
  getTransferGradesService,
  searchEmployeeService,
  saveEmployeeTransferService,
  getTransferDetailsService,
};