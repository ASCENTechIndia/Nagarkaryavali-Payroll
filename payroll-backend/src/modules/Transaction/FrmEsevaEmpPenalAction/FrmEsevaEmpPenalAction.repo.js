const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

const getActionTypeListRepo = async () => {
  let qry = "";
  qry += " select var_actiontype_name, num_actiontype_id from aopr_actiontype_mas  ";

  const dt = await executeQuery(qry);
  return dt;
};

const getPensionImpactListRepo = async () => {
  let qry = "";
  qry += " select var_pensionImpact_name, num_pensionImpact_id from aopr_pensionImpact_mas  ";

  const dt = await executeQuery(qry);
  return dt;
};

// Get Penal Action Details
const getPenalActionDetailsRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = " select * from aopr_PenAction_det ";
  qry += " where num_penaction_ulbid = '" + ulbId + "' and num_penaction_empcode = '" + empId + "' and num_penaction_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);
  return dt;
};

// Insert / Update Penal Action
const insertPenalActionRepo = async (payload) => {
  const result = await executeProcedure({
    sql: `
      BEGIN
        aopr_PenAction_ins(
          :in_UserId,
          :in_Mode,
          :in_esevaid,
          :in_empcode,
          :in_ulbid,
          :in_actiontyp,
          :in_reason,
          :in_currstatus,
          :in_caseno,
          :in_details,
          :in_orderno,
          :in_orderdat,
          :in_orderdetails,
          :in_whetherimpact,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
    `,
    binds: {
      in_UserId: payload.userId,
      in_Mode: payload.mode,
      in_esevaid: payload.esevaEmpId,
      in_empcode: payload.empId,
      in_ulbid: payload.ulbId,

      in_actiontyp: payload.actionType === 0 || payload.actionType === null ? null : payload.actionType,

      in_reason: payload.reason,
      in_currstatus: payload.currentStatus,
      in_caseno: payload.caseNumber,
      in_details: payload.details,
      in_orderno: payload.ifRevokeOrderNo,
      in_orderdat: payload.dateOfOrder
        ? { val: new Date(payload.dateOfOrder), dir: oracledb.BIND_IN, type: oracledb.DATE }
        : { val: null, dir: oracledb.BIND_IN, type: oracledb.DATE },
      in_orderdetails: payload.detailsOfOrder,

      in_whetherimpact: payload.impactOnPension === 0 || payload.impactOnPension === null ? null : payload.impactOnPension,

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

  console.log("Penal Action Procedure Result =>", JSON.stringify(result, null, 2));

  return {
    success: true,
    errorCode: result.outBinds.out_ErrorCode,
    errorMsg: result.outBinds.out_ErrorMsg,
  };
};

module.exports = {
  getActionTypeListRepo,
  getPensionImpactListRepo,
  getPenalActionDetailsRepo,
  insertPenalActionRepo
};
