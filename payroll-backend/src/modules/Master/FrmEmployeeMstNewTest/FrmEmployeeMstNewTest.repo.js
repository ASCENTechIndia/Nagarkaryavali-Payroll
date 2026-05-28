const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");


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
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getCasteListRepo({ ulbid, religionid }) {
  console.log("📤 Repo: Fetch Caste List", { ulbid, religionid});

  const sql = `
    SELECT
      castenamem,
      casteid,
      religionid
    FROM vw_caste
    WHERE ulbid = :ulbid
      AND religionid = :religionid
    ORDER BY castenamem
  `;

  const binds = { ulbid, religionid};
  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

async function getSubCasteListRepo({ ulbid, casteid }) {
  console.log("📤 Repo: Fetch Sub Caste List", { ulbid, casteid });

  const sql = `
    SELECT
      SUBCASTEMNAME,
      SUBCASTEID
    FROM vw_subcaste
    WHERE ulbid = :ulbid
      AND CASTEID = :casteid
    ORDER BY SUBCASTEMNAME
  `;

  const binds = { ulbid, casteid };
  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

//Procedure Not working and procedure for ULB = 1750 ( NOT in DB)
async function saveEmployeeRepo(payload) {
    const result = await executeProcedure({
        sql: `
        BEGIN
        aopr_employee_ins(
            :in_UserId,
            :in_EmpId,
            :in_EmpNameE,
            :in_EmpNameM,
            :in_DOB,
            :in_Gender,
            :in_MobileNo,
            :in_TempAddress,
            :in_PermAddress,
            :in_machiAtten,
            :in_EmailId,
            :in_Handicap,
            :in_PanNo,
            :in_AadharNo,
            :in_EmpStatus,
            :in_JoinDate,
            :in_ConfirmDate,
            :in_RetireDate,
            :in_BankId,
            :in_BranchId,
            :in_AccNo,
            :in_GradeId,
            :in_DeptId,
            :in_DesigId,
            :in_PayscaleId,
            :in_PFNo,
            :in_BasicSal,
            :in_GradePay,
            :in_VehicleOccup,
            :in_SocMem,
            :in_HomeOccup,
            :in_pfpercent,
            :in_pffixamt,
            :in_defpfpercent,
            :in_defpffixamt,
            :in_CorpId,
            :in_paysheettype,
            :in_zone,
            :in_Mode,
            :in_SocietyAmt,
            :in_EmpEarDudStr,
            :in_currbasic,
            :in_currgradepay,
            :in_IC,
            :in_MOP,
            :in_BKMicr,
            :in_managementlevel,
            :in_DCPSRate,
            :in_UlbID,
            :in_TransferDate,
            :in_pranNo,
            :in_education,
            :in_SevaNivrutiFlag,
            :in_SevaNivrutiDate,
            :in_Cast,
            :in_subcast,
            :in_FestivalAdvanceID,
            :in_str,
            :in_subdeptId,
            :in_deductionType,
            :in_billno,
            :in_emptype,
            :in_jobchart,
            :in_jobtableno,
            :in_oldempno,
            :in_hsg_rent,
            :in_bank_rec,
            :in_karyavibhag,
            :in_empappno,
            :in_washallow,
            :in_bankstr,
            :in_disabldesc,
            :in_disablperc,
            :in_altmobno,
            :in_marstatus,
            :in_rectype,
            :in_ifsc,
            :in_voterid,
            :in_assemcondet,
            :in_partno,
            :in_religion,
            :in_castcat,
            :in_karyazone,
            :in_bankstramc,

            :out_EmpId,
            :out_ErrorCode,
            :out_ErrorMsg
        );
        END;
`,
        binds: {
            in_UserId: payload.userId,
            in_EmpId: payload.empId || 0,
            in_EmpNameE: payload.empNameE,
            in_EmpNameM: payload.empNameM,
            in_DOB: payload.dob ? new Date(payload.dob) : null,
            in_Gender: payload.gender,
            in_MobileNo: payload.mobileNo,
            in_TempAddress: payload.tempAddress,
            in_PermAddress: payload.permAddress,
            in_machiAtten: payload.machiAtten,
            in_EmailId: payload.emailId,
            in_Handicap: payload.handicap,
            in_PanNo: payload.panNo,
            in_AadharNo: payload.aadharNo,
            in_EmpStatus: payload.empStatus,
            in_JoinDate: payload.joinDate ? new Date(payload.joinDate) : null,
            in_ConfirmDate: payload.confirmDate ? new Date(payload.confirmDate) : null,
            in_RetireDate: payload.retireDate ? new Date(payload.retireDate) : null,
            in_BankId: payload.bankId,
            in_BranchId: payload.branchId,
            in_AccNo: payload.accNo,
            in_GradeId: payload.gradeId,
            in_DeptId: payload.deptId,
            in_DesigId: payload.desigId,
            in_PayscaleId: payload.payscaleId,
            in_PFNo: payload.pfNo,
            in_BasicSal: payload.basicSal,
            in_GradePay: payload.gradePay,
            in_VehicleOccup: payload.vehicleOccup,
            in_SocMem: payload.socMem,
            in_HomeOccup: payload.homeOccup,
            in_pfpercent: payload.pfpercent,
            in_pffixamt: payload.pffixamt,
            in_defpfpercent: payload.defpfpercent,
            in_defpffixamt: payload.defpffixamt,
            in_CorpId: payload.corpId,
            in_paysheettype: payload.paysheettype,
            in_zone: payload.zone,
            in_Mode: payload.mode,
            in_SocietyAmt: payload.societyAmt,
            in_EmpEarDudStr: payload.empEarDudStr,
            in_currbasic: payload.currbasic,
            in_currgradepay: payload.currgradepay,
            in_IC: payload.ic,
            in_MOP: payload.mop,
            in_BKMicr: payload.bkMicr,
            in_managementlevel: payload.managementlevel,
            in_DCPSRate: payload.dcpsRate,
            in_UlbID: payload.ulbId,
            in_TransferDate: payload.transferDate ? new Date(payload.transferDate) : null,
            in_pranNo: payload.pranNo,
            in_education: payload.education,
            in_SevaNivrutiFlag: payload.sevaNivrutiFlag,
            in_SevaNivrutiDate: payload.sevaNivrutiDate ? new Date(payload.sevaNivrutiDate) : null,
            in_Cast: payload.cast,
            in_subcast: payload.subcast,
            in_FestivalAdvanceID: payload.festivalAdvanceId,
            in_str: payload.str,
            in_subdeptId: payload.subdeptId,
            in_deductionType: payload.deductionType,
            in_billno: payload.billno,
            in_emptype: payload.emptype,
            in_jobchart: payload.jobchart,
            in_jobtableno: payload.jobtableno,
            in_oldempno: payload.oldempno,
            in_hsg_rent: payload.hsgRent,
            in_bank_rec: payload.bankRec,
            in_karyavibhag: payload.karyavibhag,
            in_empappno: payload.empappno,
            in_washallow: payload.washallow,
            in_bankstr: payload.bankstr,
            in_disabldesc: payload.disabldesc,
            in_disablperc: payload.disablperc,
            in_altmobno: payload.altmobno,
            in_marstatus: payload.marstatus,
            in_rectype: payload.rectype,
            in_ifsc: payload.ifsc,
            in_voterid: payload.voterid,
            in_assemcondet: payload.assemcondet,
            in_partno: payload.partno,
            in_religion: payload.religion,
            in_castcat: payload.castcat,
            in_karyazone: payload.karyazone,
            in_bankstramc: payload.bankstramc,
            out_EmpId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
        },
    });

    console.log("Procedure Result =>", result);

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.outBinds;
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
    getCasteListRepo,
    getSubCasteListRepo,
    saveEmployeeRepo,
    updateEmployeeImagesRepo,
};