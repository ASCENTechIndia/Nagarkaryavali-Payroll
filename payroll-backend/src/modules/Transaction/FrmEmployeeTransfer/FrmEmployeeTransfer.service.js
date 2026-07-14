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

{/*
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
*/}

const searchEmployeeService = async (body) => {
  console.log("🔧 Service: searchEmployeeService", body);
  const { empId, ulbId } = body;

  const result = await repo.searchEmployeeRepo({ empId, ulbId });

  if (!result || result.length === 0) {
    throw new Error("Record Not Found");
  }

  return { success: true, data: result[0] };
};

const saveEmployeeTransferService = async (data) => {
  const result = await repo.saveEmployeeTransferRepo(data);

 // console.log("Service Result:", result);

  return result;
};


const getTransferDetailsService = async (data) => {
  return await repo.getTransferDetailsRepo(data);
};

module.exports = {
  getDepartmentListService,
  getDesignationListService,
  getGradeListService,
  getTransferTypesService,
  //getTransferDepartmentsService,
  //getTransferDesignationsService,
  //getTransferGradesService,
  searchEmployeeService,
  saveEmployeeTransferService,
  getTransferDetailsService,
};
