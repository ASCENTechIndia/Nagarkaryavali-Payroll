const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

const getLoanAdvanceListRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";
  qry += " select a.num_loanadv_sanctionedamt,a.var_loanadv_purpose, a.num_loanadv_numofinstall,a.var_loanadv_roi, a.var_loanadv_sanctorderno,  ";
  qry +=
    " to_char(a.dat_loanadv_sanctdate,'dd/MM/yyyy') dat_loanadv_sanctdate, to_char(a.dat_loanadv_finstalldat,'dd/MM/yyyy') dat_loanadv_finstalldat,a.num_loanadv_monthinstall, a.var_loanadv_financyear,a.var_loanadv_intberadv, a.num_loanadv_amtos,a.num_loanadv_amtrecover, a.var_loanadv_intacc,a.blob_loanadv_signdet, a.var_loanadv_remark from aopr_loanadv_det a ";
  qry += " where num_loanadv_ulbid = '" + ulbId + "' and num_loanadv_empcode = '" + empId + "' and num_loanadv_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);
  return dt;
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
  const qry = `
    UPDATE aopr_loanadv_det
    SET blob_loanadv_signdet = :img
    WHERE num_loanadv_empcode = :empId
      AND num_loanadv_ulbid = :ulbId
      AND num_loanadv_esevaid = :esevaEmpId
  `;

  const result = await executeQuery(qry, {
    img: imageBuffer,
    empId: empId,
    ulbId: ulbId,
    esevaEmpId: esevaEmpId,
  });
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
