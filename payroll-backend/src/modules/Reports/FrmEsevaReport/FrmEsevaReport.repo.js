const oracledb = require("oracledb");
const getConnection = require("../../../config/db");
const { executeQuery } = require("../../../db/queryExecutor");

async function searchEmployeeRepo({ ulbId, empCode }) {
  const specialUlbs = ["751", "1690", "870"];

  let sql;
  const binds = {
    ulbId,
    empCode,
  };

  if (specialUlbs.includes(String(ulbId))) {
    sql = `
      SELECT *
      FROM VW_ESEVAPERSONALINFO
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `;
  } else {
    sql = `
      SELECT
        ESEVAEMP_NAME,
        DESIGNATIONNAME,
        JOINDATE,
        CORPORATION_ADDRESS,
        AADHARNO,
        PANNO,
        FATHERNAME,
        MOTHERNAME,
        DOB,
        DATEOFSUPERANNUATION,
        NATIONALITY,
        CATEGORY,
        EMAIL,
        PHOTOIMAGE,
        EMPCODE,
        OLDEMPNO
      FROM VW_ESEVAPERSONALINFO
      WHERE ULBID = :ulbId
    `;

    if (String(ulbId) === "770") {
      sql += ` AND SLIPNO = :empCode`;
    } else if (String(ulbId) === "1630") {
      sql += ` AND OLDEMPNO = :empCode`;
    } else {
      sql += ` AND EMPCODE = :empCode`;
    }
  }

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows || [];
}

async function getPersonalInfoRepo({ ulbId, empCode, isSpecialUlb }) {
  const binds = { ulbId, empCode };

  const sql = isSpecialUlb
    ? `
      SELECT *
      FROM VW_ESEVAPERSONALINFO
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `
    : `
      SELECT
        ESEVAEMP_NAME,
        DESIGNATIONNAME,
        JOINDATE,
        CORPORATION_ADDRESS,
        AADHARNO,
        PANNO,
        FATHERNAME,
        MOTHERNAME,
        DOB,
        DATEOFSUPERANNUATION,
        NATIONALITY,
        CATEGORY,
        EMAIL,
        PHOTOIMAGE,
        EMPCODE,
        OLDEMPNO
      FROM VW_ESEVAPERSONALINFO
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getAddressDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT
      STATUS,
      SPOUSENAME,
      PARMADDRES,
      PERADDRESS2,
      PCITY,
      DISTRICT,
      STATE,
      COUNTRY,
      POSTOFFICE,
      PINCODE,
      COMMADDRESS,
      COMMADDRESS2,
      COMMDISTRICT,
      COMMSTATE,
      COMMCOUNTRY,
      COMMPOSTOFF,
      COMMPINCODE,
      MOBNO,
      ALTERMOBNO,
      TELNUMBER,
      EMPCODE,
      ULBID
    FROM VW_ESEVAEMPADDRDTLS
    WHERE ULBID = :ulbId
      AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getEmergencyDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT *
    FROM VW_EMERG_CONTACT
    WHERE ULB = :ulbId
      AND EMP_CODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getFamilyDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT *
    FROM VW_FAMILY_PARTICULARS
    WHERE ULBID = :ulbId
      AND EMP_CODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getEducationDetailsRepo({ ulbId, empCode }) {
  const sql = `
    SELECT
      EMPCODE,
      ESEVAID,
      ULBID,
      DEGREE,
      UNIVERSITY,
      PASSYEAR
    FROM VW_ESEVAEDUCATIONINFO
    WHERE ULBID = :ulbId
      AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getAdditionalTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT
      EMPCODE,
      ULBID,
      ESEVAID,
      COURSENAME,
      ORGDETAILS,
      COMMENCEDATE
    FROM VW_ESEVAADDNTRAINING
    WHERE ULBID = :ulbId
      AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getPTTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT
      EMPCODE,
      ULBID,
      ESEVAID,
      DEGREE,
      UNIVERSITY,
      PASSYEAR
    FROM VW_ESEVAPTTRAINING
    WHERE ULBID = :ulbId
      AND EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getTrainingRepo({ ulbId, empCode }) {
  const sql = `
    SELECT *
    FROM VW_ESEVATRaining
    WHERE NUM_EMPTRAINING_ULBID = :ulbId
      AND NUM_EMPTRAINING_EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getNominationDetailsRepo({ ulbId, empCode, isSMKC }) {
  const binds = { ulbId, empCode };

  const sql = isSMKC
    ? `
      SELECT *
      FROM VW_ESEVANOMINATIONSMKC
      WHERE NUM_NOMINEE_ULBID = :ulbId
        AND NUM_NOMINEE_EMPID = :empCode
    `
    : `
      SELECT *
      FROM VW_ESEVANOMINATION
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getPostingRecordsRepo({ ulbId, empCode }) {
  const binds = { ulbId, empCode };

  const esevaSql = `
    SELECT NUM_ESEVAEMP_ID AS ESEVAID
    FROM AOPR_ESEVAEMP_MAS
    WHERE NUM_ESEVAEMP_ULBID = :ulbId
      AND NUM_ESEVAEMP_EMPCODE = :empCode
  `;

  const esevaResult = await executeQuery(esevaSql, binds);

  const postingData = {
    esevaInfo: esevaResult.success ? esevaResult.rows[0] || {} : {},
    previousService: [],
    foreignService: [],
    verifiedService: [],
  };

  const prevRecSql = `
    SELECT *
    FROM VW_ESEVAPOSTREC_PRVREC
    WHERE NUM_POSTINGRECORD_ULBID = :ulbId
      AND NUM_POSTINGRECORD_EMPCODE = :empCode
      AND NUM_POSTINGRECORD_SERVICEID = :serviceId
  `;

  const prevResult = await executeQuery(prevRecSql, {
    ...binds,
    serviceId: 1,
  });

  if (prevResult.success) {
    postingData.previousService = prevResult.rows;
  }

  const fsSql = `
    SELECT *
    FROM VW_ESEVAPOSTREC_FORSERV
    WHERE NUM_POSTINGRECORD_ULBID = :ulbId
      AND NUM_POSTINGRECORD_EMPCODE = :empCode
      AND NUM_POSTINGRECORD_SERVICEID = :serviceId
  `;

  const fsResult = await executeQuery(fsSql, {
    ...binds,
    serviceId: 2,
  });

  if (fsResult.success) {
    postingData.foreignService = fsResult.rows;
  }

  const vsSql = `
    SELECT *
    FROM VW_ESEVAPOSTREC_VERISERV
    WHERE NUM_POSTINGRECORD_ULBID = :ulbId
      AND NUM_POSTINGRECORD_EMPCODE = :empCode
      AND NUM_POSTINGRECORD_SERVICEID = :serviceId
  `;

  const vsResult = await executeQuery(vsSql, {
    ...binds,
    serviceId: 3,
  });

  if (vsResult.success) {
    postingData.verifiedService = vsResult.rows;
  }

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
    ltaLeave: [],
  };

  const queries = {
    earnedLeave: `
      SELECT *
      FROM VW_ESEVAERNEDLEAVE
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    earnedLeaveHPL: `
      SELECT *
      FROM VW_ESEVAERNEDLEAVEHPL
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    leaveAvail: `
      SELECT *
      FROM VW_ESEVALEAVEAVAIL
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    leaveAvailHPL: `
      SELECT *
      FROM VW_ESEVALEAVEAVAILHPL
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    casualLeave: `
      SELECT *
      FROM VW_ESEVALEAVEAVAILCASUAL
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    extraOrdinaryLeave: `
      SELECT *
      FROM VW_ESEVALEAVEAVAILEXTRAORD
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    commutedLeave: `
      SELECT *
      FROM VW_ESEVALeaveCC
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    maternityLeave: `
      SELECT *
      FROM VW_MATLEAVE
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    paternityLeave: `
      SELECT *
      FROM VW_PATLEAVE
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    otherLeave: `
      SELECT *
      FROM VW_OTHERLEAVE
      WHERE ULBID = :ulbId
        AND EMPCODE = :empCode
    `,
    ltaLeave: `
      SELECT *
      FROM vw_leavedtlsLTA
      WHERE NUM_LEAVEDETSLTA_ULBID = :ulbId
        AND NUM_LEAVEDETSLTA_EMPCODE = :empCode
    `,
  };

  for (const [key, sql] of Object.entries(queries)) {
    const result = await executeQuery(sql, binds);

    if (result.success && result.rows?.length) {
      leaveData[key] = result.rows;
    }
  }

  return leaveData;
}

async function getLoanAdvanceRecordsRepo({ ulbId, empCode }) {
  const binds = { ulbId, empCode };

  const loanData = {
    interestBearingAdvances: [],
    interestBearingAdvanceInstallments: [],
  };

  let connection;
  try {
    connection = await getConnection();

    const loanSql = `
      SELECT
        NUM_LOANADV_ESEVAID       AS ESEVAID,
        NUM_LOANADV_EMPCODE       AS EMP_CODE,
        NUM_LOANADV_ULBID         AS ULDID,
        NUM_LOANADV_SANCTIONEDAMT AS SANCTIONEDAMT,
        VAR_LOANADV_PURPOSE       AS PURPOSE,
        NUM_LOANADV_NUMOFINSTALL  AS NUMOFINSTALL,
        VAR_LOANADV_ROI           AS ROI,
        VAR_LOANADV_SANCTORDERNO  AS SANCTORDERNO,
        DAT_LOANADV_SANCTDATE     AS SANCTDATE,
        DAT_LOANADV_FINSTALLDAT   AS FINSTALLDAT,
        NUM_LOANADV_MONTHINSTALL  AS MONTHINSTALL
      FROM AOPR_LOANADV_DET
      WHERE NUM_LOANADV_ULBID   = :ulbId
        AND NUM_LOANADV_EMPCODE = :empCode
    `;

    const loanResult = await connection.execute(loanSql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    loanData.interestBearingAdvances = loanResult.rows || [];

    const installSql = `
      SELECT
        NUM_LOANADV_ESEVAID       AS ESEVAID,
        NUM_LOANADV_EMPCODE       AS EMP_CODE,
        NUM_LOANADV_ULBID         AS ULDID,
        VAR_LOANADV_FINANCYEAR    AS FINANCYEAR,
        VAR_LOANADV_INTBERADV     AS INTBERADV,
        NUM_LOANADV_AMTOS         AS AMTOS,
        NUM_LOANADV_AMTRECOVER    AS AMTRECOVER,
        VAR_LOANADV_INTACC        AS INTACC,
        BLOB_LOANADV_SIGNDET      AS SIGNDET,
        VAR_LOANADV_REMARK        AS REMARK
      FROM AOPR_LOANADV_DET
      WHERE NUM_LOANADV_ULBID   = :ulbId
        AND NUM_LOANADV_EMPCODE = :empCode
    `;

    const installResult = await connection.execute(installSql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const readLob = async (lob) => {
      if (!lob) return null;
      if (Buffer.isBuffer(lob)) return lob;
      if (lob && typeof lob === "object" && typeof lob.on === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          lob.on("data", (chunk) => chunks.push(chunk));
          lob.on("error", reject);
          lob.on("end", () => resolve(Buffer.concat(chunks)));
        });
      }
      return null;
    };

    const rows = await Promise.all(
      (installResult.rows || []).map(async (row) => {
        const signBuffer = await readLob(row.SIGNDET);
        return {
          ESEVAID:    row.ESEVAID,
          EMP_CODE:   row.EMP_CODE,
          ULDID:      row.ULDID,
          FINANCYEAR: row.FINANCYEAR,
          INTBERADV:  row.INTBERADV,
          AMTOS:      row.AMTOS,
          AMTRECOVER: row.AMTRECOVER,
          INTACC:     row.INTACC,
          REMARK:     row.REMARK,
          SIGNDET: signBuffer ? signBuffer.toString("base64") : null,
        };
      })
    );

    loanData.interestBearingAdvanceInstallments = rows;

    console.log("loanData.interestBearingAdvanceInstallments: ", loanData.interestBearingAdvanceInstallments);

    return loanData;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("[REPO] Error closing connection:", err);
      }
    }
  }
}

async function getAppendixRepo({ ulbId, empCode }) {
  const sql = `
    SELECT
      NUM_ESEVAEMP_ID AS ESEVAID,
      NUM_ESEVAEMP_EMPCODE AS EMPCODE,
      NUM_ESEVAEMP_ULBID AS ULBID
    FROM AOPR_ESEVAEMP_MAS
    WHERE NUM_ESEVAEMP_ULBID = :ulbId
      AND NUM_ESEVAEMP_EMPCODE = :empCode
  `;

  const result = await executeQuery(sql, { ulbId, empCode });

  if (!result.success) {
    throw new Error(result.error);
  }

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
  getAppendixRepo,
};