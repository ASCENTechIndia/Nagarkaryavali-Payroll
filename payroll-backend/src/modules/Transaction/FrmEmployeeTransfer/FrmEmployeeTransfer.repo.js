// modules/Transaction/FrmEmployeeTransfer/FrmEmployeeTransfer.repo.js
const { executeQuery } = require("../../../db/queryExecutor");

// Existing Repositories
const getDepartmentListRepo = async (ulbId) => {
  try {
    const query = `
      SELECT 
        deptid,
        deptname 
      FROM aopr_deptmst_def 
      WHERE ulbid = :ulbId
      ORDER BY deptname
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

const getDesignationListRepo = async (ulbId) => {
  try {
    const query = `
      SELECT 
        desig_id,
        desig_ename 
      FROM aopr_designationmst_def 
      WHERE ulbid = :ulbId
      ORDER BY desig_ename
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

const getGradeListRepo = async (ulbId) => {
  try {
    const query = `
      SELECT 
        num_grademst_gradeid,
        var_grademst_gradename 
      FROM aopr_grademst_def 
      WHERE ulbid = :ulbId
      ORDER BY var_grademst_gradename
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

const getTransferTypesRepo = async () => {
  try {
    const query = `
      SELECT 
        num_transfertype_transid,
        var_transfertype_transfername 
      FROM aopr_TransferType_mas
      ORDER BY var_transfertype_transfername
    `;
    const result = await executeQuery(query, {});
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

// ✅ NEW: Get all departments for transfer dropdown
const getTransferDepartmentsRepo = async (ulbId) => {
  try {
    console.log("📦 Repo: getTransferDepartmentsRepo", ulbId);
    const query = `
      SELECT 
        deptid,
        deptname 
      FROM aopr_deptmst_def 
      WHERE ulbid = :ulbId
      ORDER BY deptname
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

// ✅ NEW: Get all designations for transfer dropdown
const getTransferDesignationsRepo = async (ulbId) => {
  try {
    console.log("📦 Repo: getTransferDesignationsRepo", ulbId);
    const query = `
      SELECT 
        desig_id,
        desig_ename 
      FROM aopr_designationmst_def 
      WHERE ulbid = :ulbId
      ORDER BY desig_ename
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

// ✅ NEW: Get all grades for transfer dropdown
const getTransferGradesRepo = async (ulbId) => {
  try {
    console.log("📦 Repo: getTransferGradesRepo", ulbId);
    const query = `
      SELECT 
        num_grademst_gradeid,
        var_grademst_gradename 
      FROM aopr_grademst_def 
      WHERE ulbid = :ulbId
      ORDER BY var_grademst_gradename
    `;
    const result = await executeQuery(query, { ulbId });
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

// Search Employee
const searchEmployeeRepo = async (payload) => {
  try {
    const { empId, ulbId } = payload;
    console.log("📦 Repo: searchEmployeeRepo", { empId, ulbId });
    
    let query = `
      SELECT
        num_employee_empid as EMPID,
        var_deptmst_deptnamee as DEPTNAME,
        num_deptmst_deptid as DEPTID,
        num_desigmst_designationid as DESIGNATIONID,
        var_desigmst_designationname as DESIGNATIONNAME,
        num_grademst_gradeid as GRADEID,
        var_grademst_gradename as GRADENAME,
        TO_CHAR(date_employee_joindate, 'DD-MM-YYYY') as DATEOFJOINING,
        ROUND(MONTHS_BETWEEN(SYSDATE, date_employee_joindate) / 12) as YEARSOFSERVICE,
        var_deptslip_sequence as DEPTSLIPSEQUENCE,
        var_employee_oldempno as OLDEMPNO,
        var_employee_jobchart as JOBCHART,
        var_employee_jobtableno as JOBTABLENO,
        var_employee_marname as EMPNAME
      FROM aopr_employee_def
      INNER JOIN aopr_deptmst_def ON num_deptmst_deptid = num_employee_deptid
      INNER JOIN aopr_designationmst_def ON num_desigmst_designationid = num_employee_desigid
      INNER JOIN aopr_grademst_def ON num_grademst_gradeid = num_employee_gradeid
      LEFT JOIN aopr_deptslip_mas ON num_employee_empid = num_deptslip_empid 
        AND num_employee_ulbid = num_deptslip_ulbid
      WHERE num_employee_ulbid = :ulbId
    `;

    const params = { ulbId };

    if (ulbId === "770" || ulbId === "1750") {
      query += ` AND var_deptslip_sequence = :empId`;
      params.empId = empId;
    } else if (ulbId === "1630") {
      query += ` AND var_employee_oldempno = :empId`;
      params.empId = empId;
    } else {
      query += ` AND num_employee_empid = :empId`;
      params.empId = empId;
    }

    const result = await executeQuery(query, params);
    return result.rows;
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

// Save Employee Transfer
const saveEmployeeTransferRepo = async (data) => {
  try {
    console.log("📦 Repo: saveEmployeeTransferRepo", data);
    return {
      success: true,
      errorCode: 9999,
      errorMsg: "Transfer saved successfully",
      transferId: Math.floor(Math.random() * 1000) + 100,
    };
  } catch (error) {
    console.error("❌ Repo error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get Transfer Details
const getTransferDetailsRepo = async (payload) => {
  try {
    const { transferId, ulbId } = payload;
    console.log("📦 Repo: getTransferDetailsRepo", { transferId, ulbId });
    return [{
      EMPID: "3792",
      EMPNAME: "अमित किशोर चव्हाण",
      OLDDESIGNATION: "सफाई कामगार",
      NEWDESIGNATION: "सफाई कामगार",
      CURRENTDEPT: "ब - महापालिका विभाग (क्षेत्रीय) कार्यालये - 2",
      NEWDEPT: "ब - महापालिका विभाग (क्षेत्रीय) कार्यालये - 2",
      ORDERDATE: "29-06-2026",
      ORDERNO: "ORD-001",
    }];
  } catch (error) {
    console.error("❌ Repo error:", error);
    throw error;
  }
};

module.exports = {
  getDepartmentListRepo,
  getDesignationListRepo,
  getGradeListRepo,
  getTransferTypesRepo,
  getTransferDepartmentsRepo,
  getTransferDesignationsRepo,
  getTransferGradesRepo,
  searchEmployeeRepo,
  saveEmployeeTransferRepo,
  getTransferDetailsRepo,
};