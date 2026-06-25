const { executeQuery } = require("../../../db/queryExecutor");

async function searchEmployeeRepo({ ulbId, empCode }) {
  let sql = "";
  const binds = { ulbId };

  const specialUlbs = ["751", "1690", "870"];
  
  if (!specialUlbs.includes(String(ulbId))) {
    sql = `
      SELECT ESEVAEMP_NAME, DESIGNATIONNAME, JOINDATE, CORPORATION_ADDRESS, 
             AADHARNO, PANNO, FATHERNAME, MOTHERNAME, DOB, 
             DATEOFSUPERANNUATION, NATIONALITY, CATEGORY, EMAIL, 
             PHOTOIMAGE, empcode, oldempno
      FROM vw_esevapersonalinfo
      WHERE ulbid = :ulbId
    `;
    
    if (String(ulbId) === "770") {
      sql += ` AND slipno = :empCode`;
      binds.empCode = empCode;
    } else if (String(ulbId) === "1630") {
      sql += ` AND oldempno = :empCode`;
      binds.empCode = empCode;
    } else {
      sql += ` AND empcode = :empCode`;
      binds.empCode = empCode;
    }
  } else {
    sql = `
      SELECT * FROM vw_esevapersonalinfo 
      WHERE ulbid = :ulbId AND empcode = :empCode
    `;
    binds.empCode = empCode;
  }

  const result = await executeQuery(sql, binds);
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getPersonalInfoRepo({ ulbId, empCode, isSpecialUlb }) {
  let sql = "";
  const binds = { ulbId, empCode };

  if (!isSpecialUlb) {
    sql = `
      SELECT ESEVAEMP_NAME, DESIGNATIONNAME, JOINDATE, CORPORATION_ADDRESS, 
             AADHARNO, PANNO, FATHERNAME, MOTHERNAME, DOB, 
             DATEOFSUPERANNUATION, NATIONALITY, CATEGORY, EMAIL, 
             PHOTOIMAGE, empcode, oldempno
      FROM vw_esevapersonalinfo
      WHERE ulbid = :ulbId AND empcode = :empCode
    `;
  } else {
    sql = `
      SELECT * FROM vw_esevapersonalinfo 
      WHERE ulbid = :ulbId AND empcode = :empCode
    `;
  }

  const result = await executeQuery(sql, binds);
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getAddressDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT STATUS, SPOUSENAME, PARMADDRES, PERADDRESS2, PCITY, DISTRICT, 
           STATE, COUNTRY, POSTOFFICE, PINCODE, COMMADDRESS, COMMADDRESS2, 
           COMMDISTRICT, COMMSTATE, COMMCOUNTRY, COMMPOSTOFF, COMMPINCODE, 
           MOBNO, ALTERMOBNO, TELNUMBER, EMPCODE, ULBID
    FROM vw_esevaempaddrdtls
    WHERE ULBID = :ulbId AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getEmergencyDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT * FROM VW_Emerg_contact
    WHERE ulb = :ulbId AND emp_code = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getFamilyDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT * FROM VW_Family_particulars
    WHERE ULBID = :ulbId AND emp_code = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getEducationDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT EMPCODE, ESEVAID, ULBID, DEGREE, UNIVERSITY, PASSYEAR
    FROM vw_EsevaeducationInfo
    WHERE ULBID = :ulbId AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getAdditionalTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT EMPCODE, ULBID, ESEVAID, COURSENAME, ORGDETAILS, COMMENCEDATE
    FROM vw_EsevaAddnTraining
    WHERE ULBID = :ulbId AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getPTTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT EMPCODE, ULBID, ESEVAID, DEGREE, UNIVERSITY, PASSYEAR
    FROM vw_EsevaPTTraining
    WHERE ULBID = :ulbId AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT * FROM vw_esevatraining
    WHERE num_emptraining_ulbid = :ulbId AND num_emptraining_empcode = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getNominationDetailsRepo({ ulbId, empCode, isSMKC }) {
  let sql = "";
  const binds = { ulbId, empCode };

  if (!isSMKC) {
    sql = `
      SELECT * FROM vw_esevanomination
      WHERE ulbid = :ulbId AND empcode = :empCode
    `;
  } else {
    sql = `
      SELECT * FROM vw_esevanominationsmkc
      WHERE num_nominee_ulbid = :ulbId AND num_nominee_empid = :empCode
    `;
  }

  const result = await executeQuery(sql, binds);
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

async function getPostingRecordsRepo({ ulbId, empCode }) {
  const binds = { ulbId, empCode };

  // Get ESEVA ID first
  const esevaSql = `
    SELECT num_esevaemp_id as esevaid 
    FROM aopr_esevaemp_mas 
    WHERE num_esevaemp_ulbid = :ulbId AND num_esevaemp_empcode = :empCode
  `;
  const esevaResult = await executeQuery(esevaSql, binds);
  
  const postingData = {
    esevaInfo: esevaResult.success ? esevaResult.rows[0] || {} : {},
    previousService: [],
    foreignService: [],
    verifiedService: []
  };

  // Previous Service Records (serviceid = 1)
  const prevRecSql = `
    SELECT * FROM vw_esevapostrec_prvrec
    WHERE num_postingrecord_ulbid = :ulbId 
      AND num_postingrecord_empcode = :empCode 
      AND num_postingrecord_serviceid = 1
  `;
  const prevResult = await executeQuery(prevRecSql, binds);
  if (prevResult.success) postingData.previousService = prevResult.rows;

  // Foreign Service Records (serviceid = 2)
  const fsSql = `
    SELECT * FROM vw_esevapostrec_forserv
    WHERE num_postingrecord_ulbid = :ulbId 
      AND num_postingrecord_empcode = :empCode 
      AND num_postingrecord_serviceid = 2
  `;
  const fsResult = await executeQuery(fsSql, binds);
  if (fsResult.success) postingData.foreignService = fsResult.rows;

  // Verified Service Records (serviceid = 3)
  const vsSql = `
    SELECT * FROM vw_esevapostrec_veriserv
    WHERE num_postingrecord_ulbid = :ulbId 
      AND num_postingrecord_empcode = :empCode 
      AND num_postingrecord_serviceid = 3
  `;
  const vsResult = await executeQuery(vsSql, binds);
  if (vsResult.success) postingData.verifiedService = vsResult.rows;

  return postingData;
}

async function getLeaveRecordsRepo({ ulbId, empCode }) {
  const binds = { ulbId, empCode };
  
  const leaveData = {
    earnedLeave: [],
    earnedLeaveHPL: [],
    leaveAvail: [],
    leaveAvailHPL: [],
    casualLeave: [],
    extraOrdinaryLeave: [],
    commutedLeave: [],
    maternityLeave: [],
    paternityLeave: [],
    otherLeave: [],
    ltaLeave: []
  };

  const queries = {
    earnedLeave: `SELECT * FROM VW_ESevaErnedLeave WHERE ulbid = :ulbId AND empcode = :empCode`,
    earnedLeaveHPL: `SELECT * FROM VW_ESevaErnedLeaveHpl WHERE ulbid = :ulbId AND empcode = :empCode`,
    leaveAvail: `SELECT * FROM VW_ESEVALeaveAvail WHERE ulbid = :ulbId AND empcode = :empCode`,
    leaveAvailHPL: `SELECT * FROM VW_ESEVALeaveAvailhpl WHERE ulbid = :ulbId AND empcode = :empCode`,
    casualLeave: `SELECT * FROM VW_ESEVALeaveAvailCasual WHERE ulbid = :ulbId AND empcode = :empCode`,
    extraOrdinaryLeave: `SELECT * FROM VW_ESEVALeaveAvailExtraOrd WHERE ulbid = :ulbId AND empcode = :empCode`,
    commutedLeave: `SELECT * FROM VW_ESEVALeaveCC WHERE ulbid = :ulbId AND empcode = :empCode`,
    maternityLeave: `SELECT * FROM VW_MATLEAVE WHERE ulbid = :ulbId AND empcode = :empCode`,
    paternityLeave: `SELECT * FROM VW_PATLEAVE WHERE ulbid = :ulbId AND empcode = :empCode`,
    otherLeave: `SELECT * FROM VW_OTHERLEAVE WHERE ulbid = :ulbId AND empcode = :empCode`,
    ltaLeave: `SELECT * FROM vw_leavedtlsLTA WHERE num_leavedetslta_ulbid = :ulbId AND num_leavedetslta_empcode = :empCode`
  };

  for (const [key, sql] of Object.entries(queries)) {
    const result = await executeQuery(sql, binds);
    if (result.success && result.rows.length > 0) {
      leaveData[key] = result.rows;
    }
  }

  return leaveData;
}

async function getLoanAdvanceRecordsRepo({ ulbId, empCode }) {
  const binds = { ulbId, empCode };
  
  const loanData = {
    interestBearingAdvances: [],
    interestBearingAdvanceInstallments: []
  };

  // Interest Bearing Advances
  const loanSql = `
    SELECT num_loanadv_esevaid as esevaid, num_loanadv_empcode as emp_code, 
           num_loanadv_ulbid as uldid, num_loanadv_sanctionedamt as sanctionedamt,
           var_loanadv_purpose as purpose, num_loanadv_numofinstall as numofinstall,
           var_loanadv_roi as roi, var_loanadv_sanctorderno as sanctorderno,
           dat_loanadv_sanctdate as sanctdate, dat_loanadv_finstalldat as finstalldat,
           num_loanadv_monthinstall as monthinstall
    FROM aopr_loanadv_det 
    WHERE num_loanadv_ulbid = :ulbId AND num_loanadv_empcode = :empCode
  `;
  const loanResult = await executeQuery(loanSql, binds);
  if (loanResult.success) loanData.interestBearingAdvances = loanResult.rows;

  // Installment Details
  const installSql = `
    SELECT num_loanadv_esevaid AS esevaid, num_loanadv_empcode as emp_code,
           num_loanadv_ulbid as uldid, var_loanadv_financyear as financyear,
           var_loanadv_intberadv as intberadv, num_loanadv_amtos as amtos,
           num_loanadv_amtrecover as amtrecover, var_loanadv_intacc as intacc,
           blob_loanadv_signdet as signdet, var_loanadv_remark as remark
    FROM aopr_loanadv_det 
    WHERE num_loanadv_ulbid = :ulbId AND num_loanadv_empcode = :empCode
  `;
  const installResult = await executeQuery(installSql, binds);
  if (installResult.success) loanData.interestBearingAdvanceInstallments = installResult.rows;

  return loanData;
}

async function getAppendixRepo({ ulbId, empCode }) {
  const sql = `
    SELECT num_esevaemp_id esevaid, num_esevaemp_empcode empcode, 
           num_esevaemp_ulbid ulbid 
    FROM aopr_esevaemp_mas 
    WHERE num_esevaemp_ulbid = :ulbId AND num_esevaemp_empcode = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });
  if (!result.success) throw new Error(result.error);
  return result.rows;
}

module.exports = {
  searchEmployeeRepo,
  getPersonalInfoRepo,
  getAddressDetailsRepo,
  getEmergencyDetailsRepo,
  getFamilyDetailsRepo,
  getEducationDetailsRepo,
  getAdditionalTrainingRepo,
  getPTTrainingRepo,
  getTrainingRepo,
  getNominationDetailsRepo,
  getPostingRecordsRepo,
  getLeaveRecordsRepo,
  getLoanAdvanceRecordsRepo,
  getAppendixRepo
};