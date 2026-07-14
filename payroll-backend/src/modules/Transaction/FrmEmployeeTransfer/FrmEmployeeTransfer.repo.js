// modules/Transaction/FrmEmployeeTransfer/FrmEmployeeTransfer.repo.js
const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { withTx } = require("../../../db/tx");

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

{/*
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
*/}

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

const saveEmployeeTransferRepo = async (data) => {
  try {
    const result = await withTx(async (conn) => {
      const res = await conn.execute(
        `BEGIN
    aopr_EmpTransfer_ins(
        :in_UserId,
        :in_EmpId,
        :in_EmpNumber,
        :in_deptid,
        :in_desigid,
        :in_PayBand,
        :in_dateofJoin,
        :in_periodwdept,
        :in_newdeptid,
        :in_newdesigid,
        :in_transftypeid,
        :in_newPayBandid,
        :in_orderdate,
        :IN_ORDERNUMBER,
        :in_ULBID,
        :in_emptransID,
        :in_mode,
        :in_status,
        :in_jobchart,
        :in_jobtableno,
        :in_jobchartnew,
        :in_jobtablenonew,
        :out_ErrorCode,
        :out_ErrorMsg,
        :out_trasferID
    );
END;`,

        {
          in_UserId: data.userId,

          in_EmpId: data.empId,

          in_EmpNumber: data.empNumber,

          in_deptid: data.deptId,

          in_desigid: data.designationId,

          in_PayBand: data.payBand,

          in_dateofJoin: {
            val: new Date(data.dateOfJoin),
            type: oracledb.DATE,
          },

          in_periodwdept: String(data.periodWithDept),

          in_newdeptid: data.newDeptId,

          in_newdesigid: data.newDesignationId,

          in_transftypeid: data.transferTypeId,

          in_newPayBandid: data.newPayBandId,

          in_orderdate: {
            val: new Date(data.orderDate),
            type: oracledb.DATE,
          },

          IN_ORDERNUMBER: data.orderNumber,

          in_ULBID: data.ulbId,

          in_emptransID: data.transferEmpId,

          in_mode: data.mode,

          in_status: data.status,

          in_jobchart: data.jobChartOld,

          in_jobtableno: data.jobTableNoOld,

          in_jobchartnew: data.jobChartNew,

          in_jobtablenonew: data.jobTableNoNew,

          out_ErrorCode: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },

          out_ErrorMsg: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 5000,
          },

          out_trasferID: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
        },
      );

      return res.outBinds;
    });
   // console.log("Repo Result:", result);

    return {
      success: true,
      errorCode: result.out_ErrorCode,
      errorMsg: result.out_ErrorMsg,
      transferId: result.out_trasferID,
    };
  } catch (err) {
    return {
      success: false,

      error: err.message,
    };
  }
};

const getTransferDetailsRepo = async ({ transferId, ulbId }) => {
  const query = `
        select
            num_emptrans_id empid,
            var_employee_marname empname,
            oldg.var_desigmst_designationname OldDesignation,
            newg.var_desigmst_designationname newdesignation,
            oldd.var_deptmst_deptnamee currentdpt,
            newd.var_deptmst_deptnamee newdept,
            dat_emptrans_orderdate orderdt,
            var_emptrans_ordernumber ordeno,
            var_deptslip_sequence,
            var_employee_oldempno

        from aopr_EmpTransfer_MAS

        INNER join aopr_employee_def
            on num_employee_empid = num_emptrans_empid
           and num_employee_ulbid = num_emptrans_ulbid

        INNER join aopr_deptmst_def oldd
            on oldd.num_deptmst_deptid = num_emptrans_deptid

        INNER join aopr_deptmst_def newd
            on newd.num_deptmst_deptid = num_emptrans_newdeptid

        INNER JOIN aopr_designationmst_def oldg
            ON oldg.num_desigmst_designationid=num_emptrans_desigid

        INNER JOIN aopr_designationmst_def newg
            ON newg.num_desigmst_designationid=num_emptrans_newdesigid

        left join aopr_deptslip_mas
            on num_employee_empid=num_deptslip_empid
           and num_employee_ulbid=num_deptslip_ulbid

        where num_emptrans_id = :transferId
          and num_emptrans_ulbid = :ulbId
    `;

  return await executeQuery(query, {
    transferId,
    ulbId,
  });
};

module.exports = {
  getDepartmentListRepo,
  getDesignationListRepo,
  getGradeListRepo,
  getTransferTypesRepo,
  //getTransferDepartmentsRepo,
  //getTransferDesignationsRepo,
  //getTransferGradesRepo,
  searchEmployeeRepo,
  saveEmployeeTransferRepo,
  getTransferDetailsRepo,
};
