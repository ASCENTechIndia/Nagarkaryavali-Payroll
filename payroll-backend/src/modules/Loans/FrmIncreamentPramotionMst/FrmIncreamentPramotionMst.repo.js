const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

async function getEmployeeListRepo({ deptid, subdeptid, billno, ulbid }) {
    console.log("📤 Repo: Fetch Employee List", { deptid, subdeptid, billno, ulbid });

    let sql = "";
    const binds = {};

    if (deptid != null && subdeptid != null && billno != null && billno !== "") {
        sql = `
      SELECT
        e.num_employee_empid,
        e.num_employee_empid || '-' || e.var_employee_engname AS EMPNAME,
        e.num_employee_deptid,
        e.num_employee_subdeptid,
        d.var_deptslip_code
      FROM aopr_employee_def e
      LEFT JOIN aopr_deptslip_mas d
        ON d.num_deptslip_ulbid = e.num_employee_ulbid
       AND d.num_deptslip_empid = e.num_employee_empid
      WHERE e.num_employee_deptid = :deptid
        AND e.num_employee_subdeptid = :subdeptid
        AND d.var_deptslip_code = :billno
      ORDER BY e.var_employee_engname
    `;

        binds.deptid = deptid;
        binds.subdeptid = subdeptid;
        binds.billno = billno;
    }

    else if (deptid != null && subdeptid != null) {
        sql = `
      SELECT
        num_employee_empid,
        num_employee_empid || '-' || var_employee_engname AS EMPNAME
      FROM aopr_employee_def
      WHERE num_employee_deptid = :deptid
        AND num_employee_subdeptid = :subdeptid
      ORDER BY var_employee_engname
    `;

        binds.deptid = deptid;
        binds.subdeptid = subdeptid;
    }

    else if (deptid != null) {
        sql = `
      SELECT
        num_employee_empid,
        num_employee_empid || '-' || var_employee_engname AS EMPNAME
      FROM aopr_employee_def
      WHERE num_employee_deptid = :deptid
      ORDER BY var_employee_engname
    `;

        binds.deptid = deptid;
    }

    else {
        sql = `
      SELECT
        num_employee_empid,
        num_employee_empid || '-' || var_employee_engname AS EMPNAME
      FROM aopr_employee_def
      WHERE num_employee_ulbid = :ulbid
      ORDER BY var_employee_engname
    `;

        binds.ulbid = ulbid;
    }
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getSubDepartmentListRepo({ deptid }) {
    console.log("Repo: Fetch Sub Department List", { deptid });

    const sql = `
    SELECT var_deptsub_sdeptnamee, num_deptsub_id
    FROM aopr_subdept_mas
    WHERE num_deptsub_deptid = :deptid
    ORDER BY TO_NUMBER(
      NVL(
        REGEXP_SUBSTR(var_deptsub_sdeptnamee,'\\(([0-9]+(\\.[0-9]+)?)\\)',1,1,NULL,1),'0'
      )
    )
  `;

    const result = await executeQuery(sql, { deptid });

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getPromotionListRepo() {
    console.log("Repo: Fetch Promotion List");

    const sql = `
    SELECT
      num_promotion_id,
      var_promotion_name
    FROM AOPR_PROMOTION_MST
    ORDER BY var_promotion_name
  `;
    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getIncrementTypeListRepo() {
  const sql = `
    SELECT
      num_inctype_id,
      var_inctype_name
    FROM AOPR_INCREAMENTTYPE_MST
    ORDER BY var_inctype_name
  `;

  const result = await executeQuery(sql);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getPayScaleListRepo() {
  const sql = `
    SELECT
      num_payscalemst_payscaleid,
      var_payscalemst_payscalename
    FROM aopr_payscalemst_def
    ORDER BY var_payscalemst_payscalename
  `;

  const result = await executeQuery(sql);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getGradeListRepo() {
  const sql = `
    SELECT
      num_grademst_gradeid,
      var_grademst_gradename
    FROM aopr_grademst_def
    ORDER BY var_grademst_gradename
  `;

  const result = await executeQuery(sql);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getDesignationListRepo({ ulbid }) {
  const sql = `
    SELECT
      desig_ename,
      desig_id
    FROM vw_desigconfig
    WHERE ulbid = :ulbid
    ORDER BY desig_ename
  `;

  const result = await executeQuery(sql, {ulbid});

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getBillListRepo({ ulbid, deptid }) {
  console.log("📤 Repo: Fetch Bill List", {ulbid,deptid});

  const binds = { ulbid };
  const conditions = [
    "num_employee_ulbid = :ulbid",
  ];

  if (deptid != null) {
    conditions.push("num_employee_deptid = :deptid");
    binds.deptid = deptid;
  }

  const sql = `
    SELECT DISTINCT
      TO_CHAR(var_deptslip_code) AS BILLCODE,
      var_deptslip_code AS BILLNO
    FROM aopr_deptslip_mas
    INNER JOIN (
      SELECT DISTINCT
        num_employee_empid,
        num_employee_ulbid
      FROM aopr_employee_def
      WHERE 1=1 AND ${conditions.join(" AND ")}
    ) e
      ON e.num_employee_empid = num_deptslip_empid
     AND e.num_employee_ulbid = num_deptslip_ulbid
    WHERE num_deptslip_ulbid = :ulbid
    ORDER BY BILLCODE
  `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function saveIncrementPromotionRepo(payload) {
  console.log("Repo: Save Increment Promotion", payload);

  const result = await executeProcedure({
    sql: `
      BEGIN
        aopr_incpromotion_ins(
          :in_UserId,
          :in_EmpId,
          :in_deptid,
          :in_Subdeptid,
          :in_type,
          :in_effectivefrom,
          :in_inctype,
          :in_promtype,
          :in_orderno,
          :in_orderdate,
          :in_currgrade,
          :in_newgrade,
          :in_currpayscale,
          :in_newpayscale,
          :in_currbasic,
          :in_newbasic,
          :in_currgradepay,
          :in_newgradepay,
          :in_currdesig,
          :in_newdesig,
          :in_UlbID,
          :out_ErrorCode,
          :out_ErrorMsg,
          :out_IncPromoId
        );
      END;
    `,
    binds: {
      in_UserId: payload.userId,
      in_EmpId: payload.empId,
      in_deptid: payload.deptId,
      in_Subdeptid: payload.subDeptId,
      in_type: payload.type,
      in_effectivefrom: payload.effectiveFrom ? new Date(payload.effectiveFrom) : null,
      in_inctype: payload.incType,
      in_promtype: payload.promType,
      in_orderno: payload.orderNo,
      in_orderdate: payload.orderDate ? new Date(payload.orderDate) : null,
      in_currgrade: payload.currGrade,
      in_newgrade: payload.newGrade,
      in_currpayscale: payload.currPayScale,
      in_newpayscale: payload.newPayScale,
      in_currbasic: payload.currBasic,
      in_newbasic: payload.newBasic,
      in_currgradepay: payload.currGradePay,
      in_newgradepay: payload.newGradePay,
      in_currdesig: payload.currDesig,
      in_newdesig: payload.newDesig,
      in_UlbID: payload.ulbid,
      out_ErrorCode: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
      out_ErrorMsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
      out_IncPromoId: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
    },
  });

  console.log("Procedure Result =>", result);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.outBinds;
}

async function updateDocumentRepo(payload) {
  const {incPromoId, imageType, BLOBDoc} = payload;

  const sql = `
    UPDATE aopr_incpromotion_def
    SET
      var_inpromo_imagetype = :imageType,
      blob_incpromo_doc = :BLOBDoc
    WHERE num_incpromo_id = :incPromoId
  `;

  const binds = {imageType,BLOBDoc,incPromoId};

  const result = await executeQuery(sql, binds, { autoCommit: true });

  if (!result.success) {
    throw new Error(result.error);
  }
  return {
    success: true,
  };
}

module.exports = {
  getEmployeeListRepo,
  getSubDepartmentListRepo,
  getPromotionListRepo,
  getIncrementTypeListRepo,
  getPayScaleListRepo,
  getGradeListRepo,
  getDesignationListRepo,
  getBillListRepo,
  saveIncrementPromotionRepo,
  updateDocumentRepo
};