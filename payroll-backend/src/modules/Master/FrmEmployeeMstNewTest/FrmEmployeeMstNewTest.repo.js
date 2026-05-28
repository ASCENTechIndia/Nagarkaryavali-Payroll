const { executeQuery } = require("../../../db/queryExecutor");

async function getEmployeeBankRepo({ empid, ulbid }) {
    console.log("📤 Repo: Fetch Employee Bank Details", { empid, ulbid, });

    const sql = `
    SELECT 
      a.num_empbank_bankid AS BANKID,
      a.var_empbank_name AS BANKNAME,
      NVL(b.num_empbank_amount, 0) AS AMOUNT,
      CASE 
        WHEN b.num_empbank_id IS NOT NULL 
        THEN 1 
        ELSE 0 
      END AS ISCHECKED
    FROM aopr_empbank_def a
    LEFT JOIN aopr_empbank_det b
      ON b.num_empbank_ulbid = a.num_empbank_ulbid
      AND b.var_empbank_bankid = a.num_empbank_bankid
      AND b.num_empbank_empid = :empid
    WHERE a.num_empbank_ulbid = :ulbid
      AND a.var_empbank_flag = 'Y'
    ORDER BY a.var_empbank_name
  `;

    const binds = { empid, ulbid, };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getSalaryEarningRepo({ empid, ulbid }) {
    console.log("📤 Repo: Fetch Salary Earnings", { empid, ulbid });

    const sql = `
    SELECT 
      num_payheads_id,
      CASE 
        WHEN (
          num_payheads_ulbid = '870'
          OR num_payheads_ulbid = '751'
        )
        THEN var_payheads_shortname
        ELSE var_payheads_ename
      END AS var_payheads_ename,
      var_paysubheads_type,
      NVL(
        (
          SELECT num_empallowded_amount
          FROM aopr_empallowded_def
          WHERE (
            num_empallowded_ulbid IS NULL
            OR num_empallowded_ulbid = :ulbid
          )
          AND num_empallowded_payheadid =
              num_payheads_id
          AND num_empallowded_empid = :empid
        ),
        0
      ) AS num_empallowded_amount
    FROM VIEW_PAYHEADS
    WHERE num_payhead_subheadid IN ('14','15','19')
      AND var_paysubheads_type = 'E'
      AND num_payheads_ulbid = :ulbid
    ORDER BY var_payheads_ename
  `;

    const binds = { empid, ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getSalaryDeductionRepo({ empid, ulbid }) {
    console.log("📤 Repo: Fetch Salary Deductions", { empid, ulbid });

    const sql = `
    SELECT 
      num_payheads_id,
      CASE 
        WHEN (
          num_payheads_ulbid = '870'
          OR num_payheads_ulbid = '751'
        )
        THEN var_payheads_shortname
        ELSE var_payheads_ename
      END AS var_payheads_ename,
      var_paysubheads_type,
      NVL(
        (
          SELECT num_empallowded_amount
          FROM aopr_empallowded_def
          WHERE (
            num_empallowded_ulbid IS NULL
            OR num_empallowded_ulbid = :ulbid
          )
          AND num_empallowded_payheadid =
              num_payheads_id
          AND num_empallowded_empid = :empid
        ),
        0
      ) AS num_empallowded_amount
    FROM VIEW_PAYHEADS
    WHERE num_payhead_subheadid IN ('54','55','61')
      AND var_paysubheads_type = 'D'
      AND num_payheads_ulbid = :ulbid
      AND NUM_PAYHEADS_ID NOT IN (367)
    ORDER BY var_payheads_ename
  `;

    const binds = { empid, ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getGradeListRepo() {
    console.log("📤 Repo: Fetch Grade List");

    const sql = `
    SELECT 
      var_grademst_gradename,
      num_grademst_gradeid
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
    console.log("📤 Repo: Fetch Designation List", { ulbid });

    const sql = `
    SELECT 
      desig_ename,
      desig_id
    FROM vw_desigconfig
    WHERE ulbid = :ulbid
    ORDER BY desig_ename
  `;

    const binds = { ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getPayScaleListRepo({ ulbid }) {
    console.log("📤 Repo: Fetch PayScale List", { ulbid });

    const sql = `
    SELECT 
      payscalename,
      payscaleid
    FROM vw_PayScaleconf
    WHERE ulbid = :ulbid
    ORDER BY payscalename
  `;

    const binds = { ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getReligionListRepo() {
    console.log("📤 Repo: Fetch Religion List");

    const sql = `
    SELECT 
      VAR_RELIGION_ENAME,
      NUM_RELIGION_ID
    FROM aopr_religion_mas
    ORDER BY VAR_RELIGION_ENAME
  `;

    const result = await executeQuery(sql);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getEmployeeCategoryRepo({ ulbid }) {
    console.log("📤 Repo: Fetch Employee Category", { ulbid });

    let sql = "";
    if (ulbid == 770 || ulbid == 1750 || ulbid == 930) {
        sql = `
      SELECT 
        CASE 
          WHEN UPPER(VAR_CATEGORY_NAME) = 'REGULAR'
          THEN 'Permanent'
          ELSE VAR_CATEGORY_NAME
        END AS VAR_CATEGORY_NAME,
        NUM_CATEGORY_ID
      FROM aopr_category_mas
      ORDER BY VAR_CATEGORY_NAME
    `;
    } else {
        sql = `
      SELECT 
        num_category_id,
        var_category_name
      FROM aopr_category_mas
      ORDER BY var_category_name
    `;
    }
    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getFestivalListRepo() {
    console.log("📤 Repo: Fetch Festival List");

    const sql = `
    SELECT 
      var_festival_name,
      num_festival_id
    FROM aopr_Festival_mas
    ORDER BY var_festival_name
  `;

    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getSelectionPostListRepo({ ulbid }) {
    console.log("📤 Repo: Fetch Selection Post List", { ulbid });

    const sql = `
    SELECT 
      POSTID,
      POST
    FROM vw_selectionpost
    WHERE ULBID = :ulbid
    ORDER BY POST
  `;
    const binds = { ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getCastCategoryListRepo() {
    console.log("📤 Repo: Fetch Cast Category List");

    const sql = `
    SELECT 
      var_castcategory_name,
      num_castcategory_id
    FROM aopr_castcategory_mas
    ORDER BY var_castcategory_name
  `;

    const result = await executeQuery(sql);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getBankBranchListRepo({ bankid, ulbid }) {
    console.log("📤 Repo: Fetch Bank Branch List", { bankid, ulbid });

    const sql = `
    SELECT 
      branchname,
      branchid
    FROM vw_BankBranchConf
    WHERE bankid = :bankid
      AND ulbid = :ulbid
    ORDER BY branchname
  `;

    const binds = { bankid, ulbid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getBranchMasterListRepo({ bankid }) {
    console.log("📤 Repo: Fetch Branch Master List", { bankid });

    const sql = `
    SELECT 
      num_branchmst_branchid AS BRANCHID,
      var_branchmst_branchname AS BRANCHNAME
    FROM aopr_branchmst_def
    WHERE num_branchmst_bankid = :bankid
    ORDER BY var_branchmst_branchname
  `;

    const binds = { bankid };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getEmployeeAutoFillRepo({ empid, ulbid }) {
  console.log("📤 Repo: Employee AutoFill", { empid, ulbid });

  const sql = `
    SELECT *
    FROM aopr_employee_def
    LEFT JOIN aopr_deptslip_mas
      ON num_deptslip_ulbid =
         num_employee_ulbid
      AND num_deptslip_empid =
          num_employee_empid
    WHERE num_employee_empid = :empid
      AND num_employee_ulbid = :ulbid
    ORDER BY num_employee_empid
  `;

  const binds = { empid, ulbid };
  const result = await executeQuery( sql, binds );

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function updateEmployeeImagesRepo(payload) {
  const { empid, corpid, BLOBSign, BLOBPhoto, BLOBThumb } = payload;

  const sql = `
    UPDATE aopr_empdoc_def
    SET
      blob_empdoc_signimage  = :BLOBSign,
      blob_empdoc_photoimage = :BLOBPhoto,
      blob_empdoc_thumbimage = :BLOBThumb
    WHERE num_empdoc_empid = :empid
      AND num_empdoc_corpid = :corpid
  `;

  const binds = { BLOBSign, BLOBPhoto, BLOBThumb, empid, corpid };
  const result = await executeQuery(sql, binds, { autoCommit: true });

  if (!result.success) {
    throw new Error(result.error);
  }
  return {
    success: true,
  };
}

module.exports = {
    getEmployeeBankRepo,
    getSalaryEarningRepo,
    getSalaryDeductionRepo,
    getGradeListRepo,
    getDesignationListRepo,
    getPayScaleListRepo,
    getReligionListRepo,
    getEmployeeCategoryRepo,
    getFestivalListRepo,
    getSelectionPostListRepo,
    getCastCategoryListRepo,
    getBankBranchListRepo,
    getBranchMasterListRepo,
    getEmployeeAutoFillRepo,
    updateEmployeeImagesRepo,
};