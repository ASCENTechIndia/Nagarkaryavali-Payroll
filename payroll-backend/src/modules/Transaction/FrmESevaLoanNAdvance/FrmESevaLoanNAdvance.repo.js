const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");
const getConnection = require("../../../config/db");

const getLoanAdvanceListRepo = async (ulbId, empId, esevaEmpId) => {
  let connection;
  try {
    connection = await getConnection();

    const sql = `
      SELECT a.num_loanadv_sanctionedamt,
             a.var_loanadv_purpose,
             a.num_loanadv_numofinstall,
             a.var_loanadv_roi,
             a.var_loanadv_sanctorderno,
             TO_CHAR(a.dat_loanadv_sanctdate, 'dd/MM/yyyy')   AS dat_loanadv_sanctdate,
             TO_CHAR(a.dat_loanadv_finstalldat, 'dd/MM/yyyy') AS dat_loanadv_finstalldat,
             a.num_loanadv_monthinstall,
             a.var_loanadv_financyear,
             a.var_loanadv_intberadv,
             a.num_loanadv_amtos,
             a.num_loanadv_amtrecover,
             a.var_loanadv_intacc,
             a.blob_loanadv_signdet,
             a.var_loanadv_remark
      FROM   aopr_loanadv_det a
      WHERE  num_loanadv_ulbid   = :ulbId
        AND  num_loanadv_empcode = :empId
        AND  num_loanadv_esevaid = :esevaEmpId
    `;

    const result = await connection.execute(
      sql,
      { ulbId, empId, esevaEmpId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) return { rows: [] };

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
      result.rows.map(async (row) => {
        const signBuffer = await readLob(row.BLOB_LOANADV_SIGNDET);
        return {
          NUM_LOANADV_SANCTIONEDAMT: row.NUM_LOANADV_SANCTIONEDAMT,
          VAR_LOANADV_PURPOSE:       row.VAR_LOANADV_PURPOSE,
          NUM_LOANADV_NUMOFINSTALL:  row.NUM_LOANADV_NUMOFINSTALL,
          VAR_LOANADV_ROI:           row.VAR_LOANADV_ROI,
          VAR_LOANADV_SANCTORDERNO:  row.VAR_LOANADV_SANCTORDERNO,
          DAT_LOANADV_SANCTDATE:     row.DAT_LOANADV_SANCTDATE,
          DAT_LOANADV_FINSTALLDAT:   row.DAT_LOANADV_FINSTALLDAT,
          NUM_LOANADV_MONTHINSTALL:  row.NUM_LOANADV_MONTHINSTALL,
          VAR_LOANADV_FINANCYEAR:    row.VAR_LOANADV_FINANCYEAR,
          VAR_LOANADV_INTBERADV:     row.VAR_LOANADV_INTBERADV,
          NUM_LOANADV_AMTOS:         row.NUM_LOANADV_AMTOS,
          NUM_LOANADV_AMTRECOVER:    row.NUM_LOANADV_AMTRECOVER,
          VAR_LOANADV_INTACC:        row.VAR_LOANADV_INTACC,
          BLOB_LOANADV_SIGNDET:      signBuffer ? signBuffer.toString("base64") : null,
          VAR_LOANADV_REMARK:        row.VAR_LOANADV_REMARK,
        };
      })
    );

    console.log("rows: ", rows);
    return { rows };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};


const insertLoanAndAdvanceRepo = async (payload) => {
  const result = await executeProcedure({
    sql: `
      BEGIN
        aopr_loanadv_ins(
          :in_UserId,
          :in_Mode,
          :in_empcode,
          :in_ulbid,
          :in_esevaid,
          :in_loneadvstr,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
    `,
    binds: {
      in_UserId: payload.userId,
      in_Mode: payload.mode,
      in_empcode: payload.empId,
      in_ulbid: payload.ulbId,
      in_esevaid: payload.esevaEmpId,
      in_loneadvstr: payload.loanAdvStr,

      out_ErrorCode: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
      out_ErrorMsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
    },
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log("Loan & Advance Procedure Result =>", JSON.stringify(result, null, 2));

  return {
    success: true,
    errorCode: result.outBinds.out_ErrorCode,
    errorMsg: result.outBinds.out_ErrorMsg,
  };
};

const updateLoanAdvanceSignatureRepo = async (imageBuffer, empId, ulbId, esevaEmpId) => {
  console.log({imageBuffer, empId, ulbId, esevaEmpId});

  let connection;
  connection = await getConnection();
  const qry = `
    UPDATE aopr_loanadv_det
    SET blob_loanadv_signdet = :img
    WHERE num_loanadv_empcode = :empId
      AND num_loanadv_ulbid = :ulbId
      AND num_loanadv_esevaid = :esevaEmpId
  `;

  const result = await connection.execute(qry, 
   {
      img:        { val: imageBuffer, dir: oracledb.BIND_IN, type: oracledb.BLOB },
      empId:      Number(empId),
      ulbId:      Number(ulbId),
      esevaEmpId: Number(esevaEmpId),
  },
  { autoCommit: true }
);
  console.log({result, qry, 
    img: imageBuffer,
    empId: empId,
    ulbId: ulbId,
    esevaEmpId: esevaEmpId,
  });

  return result;
};

module.exports = {
  getLoanAdvanceListRepo,
  insertLoanAndAdvanceRepo,
  updateLoanAdvanceSignatureRepo
};
