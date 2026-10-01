const { executeQuery } = require("../../../db/queryExecutor");
const oracledb = require("oracledb");
const { executeProcedure } = require("../../../db/procedureExecutor");

const getESevaEmpLeaveRecordRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT num_leavedetails_leavetypeid as leavetypeid,num_leavedetails_empcode  as emp_code,num_leavedetails_ulbid as ulbid, ";
  qry += " num_leavedetails_esevaid as esevaid,dat_leavedetails_year as year,num_leavedetails_prevbal_1 as prevbal_1,var_leavedetails_cr1stjan as cr1stjan, ";
  qry += " num_leavedetails_debited_1 as debited_1,num_leavedetails_currbal_1 as currbal_1,var_leavedetails_cr1stjuly as cr1stjuly,num_leavedetails_prevbal_2 as prevbal_2, ";
  qry += " num_leavedetails_debited_2 as debited_2,num_leavedetails_currbal_2 as currbal_2,var_leavedetails_ltc as ltc FROM  aopr_leavedetails_det ";
  qry += " where  num_leavedetails_ulbid = '" + ulbId + "' and  num_leavedetails_empcode  = '" + empId + "' and  num_leavedetails_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  if (dt.length > 0) {
    for (let i = 0; i < dt.length; i++) {
      const row = dt[i];

      let leave = "";

      let query = " select var_leave_name, num_leave_id from aopr_leavesmkc_mas ";
      query += " where num_leave_ulbid = '" + ulbId + "' and num_leave_id = '" + row.LEAVETYPEID + "' ";

      const dtleave = await executeQuery(query);

      if (dtleave.length > 0) {
        leave = dtleave[0].VAR_LEAVE_NAME;
      }

      dt[i].LEAVE = leave;
    }
  }

  return dt;
};

const getLeaveTakenAndEarnedRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT a.num_leavedetset_id, a.num_leavedetset_leavetypeid leavetypeid,a.num_leavedetset_empcode, a.num_leavedetset_ulbid, ";
  qry += " a.num_leavedetset_esevaid, to_char(a.dat_leavedetset_fromdate,'dd/MM/yyyy') fromdate,to_char(a.dat_leavedetset_todate,'dd/MM/yyyy') todate, a.var_leavedetset_purpose purpose, ";
  qry += " a.num_leavedetset_noofdays noofdays, a.num_leavedetset_balance balance FROM aopr_leavedetset_det a ";
  qry += " where  num_leavedetset_ulbid = '" + ulbId + "' and  num_leavedetset_empcode  = '" + empId + "' and  num_leavedetset_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  if (dt.length > 0) {
    for (let i = 0; i < dt.length; i++) {
      const row = dt[i];

      let leave = "";

      let query = " select var_leave_name, num_leave_id from aopr_leavesmkc_mas ";
      query += " where num_leave_ulbid = '" + ulbId + "' and num_leave_id = '" + row.LEAVETYPEID + "' ";

      const dtleave = await executeQuery(query);

      if (dtleave.length > 0) {
        leave = dtleave[0].VAR_LEAVE_NAME;
      }

      dt[i].LEAVE = leave;
    }
  }

  return dt;
};

const getLeaveDetails2Repo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT a.num_leavedetsmat_id, a.num_leavedetsmat_leavetypeid leavetypeid,a.num_leavedetsmat_totaldays totaldays, ";
  qry += " a.num_leavedetsmat_debited debited, a.num_leavedetsmat_balance balance from aopr_leavedetsmat_det a ";
  qry += " where  num_leavedetsmat_ulbid = '" + ulbId + "' and  num_leavedetsmat_empcode  = '" + empId + "' and  num_leavedetsmat_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  if (dt.length > 0) {
    for (let i = 0; i < dt.length; i++) {
      const row = dt[i];

      let leave = "";

      let query = " select var_leave_name, num_leave_id from aopr_leavesmkc_mas ";
      query += " where num_leave_ulbid = '" + ulbId + "' and num_leave_id = '" + row.LEAVETYPEID + "' ";

      const dtleave = await executeQuery(query);

      if (dtleave.length > 0) {
        leave = dtleave[0].VAR_LEAVE_NAME;
      }

      dt[i].LEAVE = leave;
    }
  }

  return dt;
};

const getFinalLeaveDetailsRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT a.num_leavedetsother_leavetypeid leavetypeid,a.var_leavedetsother_defleave defleave,to_char(a.dat_leavedetsother_fromdate,'dd/MM/yyyy') fromdate, to_char(a.dat_leavedetsother_todate,'dd/MM/yyyy') todate, ";
  qry += " a.num_leavedetsother_total total, a.var_leavedetsother_remark remark from aopr_leavedetsother_det a ";
  qry += " where  num_leavedetsother_ulbid = '" + ulbId + "' and  num_leavedetsother_empcode  = '" + empId + "' and  num_leavedetsother_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  if (dt.length > 0) {
    for (let i = 0; i < dt.length; i++) {
      const row = dt[i];

      let leave = "";

      let query = " select var_leave_name, num_leave_id from aopr_leavesmkc_mas ";
      query += " where num_leave_ulbid = '" + ulbId + "' and num_leave_id = '" + row.LEAVETYPEID + "' ";

      const dtleave = await executeQuery(query);

      if (dtleave.length > 0) {
        leave = dtleave[0].VAR_LEAVE_NAME;
      }

      dt[i].LEAVE = leave;
    }
  }

  return dt;
};

const getLeaveAvailabilityRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT VAR_LEAVEDETSLTA_BLOCKYEAR, VAR_LEAVEDETSLTA_AVAILYEAR, VAR_LEAVEDETSLTA_NAME, NUM_LEAVEDETSLTA_RELID, VAR_LEAVEDETSLTA_RELNAME, ";
  qry += " NUM_LEAVEDETSLTA_AGE, VAR_LEAVEDETSLTA_PLACE, VAR_LEAVEDETSLTA_LEAVEENC, NUM_LEAVEDETSLTA_OUTOFMAX from aopr_leavedetsLTA_det ";
  qry += " where  NUM_LEAVEDETSLTA_ULBID = '" + ulbId + "' and  NUM_LEAVEDETSLTA_EMPCODE  = '" + empId + "' and  NUM_LEAVEDETSLTA_ESEVAID = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  return dt;
};

async function insertLeaveRecordRepo(payload) {
  const result = await executeProcedure({
    sql: `
            BEGIN
                aopr_leavedetails_ins(
                    :in_UserId,
                    :in_Mode,
                    :in_empcode,
                    :in_ulbid,
                    :in_esevaid,
                    :in_LeaveStr,
                    :in_LeaveStr_ed,
                    :in_leavestr_mat,
                    :in_leavestr_Otr,
                    :in_leavestr_LA,
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

      in_LeaveStr: payload.leaveStr,
      in_LeaveStr_ed: payload.leaveStrEd,
      in_leavestr_mat: payload.leaveStrMat,
      in_leavestr_Otr: payload.leaveStrOtr,
      in_leavestr_LA: payload.leaveStrLA,

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

  console.log("Leave Procedure Result =>", JSON.stringify(result, null, 2));

  return {
    success: true,
    errorCode: result.outBinds.out_ErrorCode,
    errorMsg: result.outBinds.out_ErrorMsg,
  };
}

const getLeaveTypeListRepo = async () => {
  let qry = "";
  qry += " select var_leave_name, num_leave_id from aopr_leavesmkc_mas where num_leave_id in (1,2,3,4,9)  ";

  const dt = await executeQuery(qry);
  return dt;
};

const getLeaveTypeChildListRepo = async () => {
  let qry = "";
  qry += " select var_leave_name, num_leave_id from aopr_leavesmkc_mas where num_leave_id in (5) ";

  const dt = await executeQuery(qry);
  return dt;
};

const getLeaveTypeOtherListRepo = async () => {
  let qry = "";
  qry += "select var_leave_name, num_leave_id from aopr_leavesmkc_mas where  num_leave_id in (6,7,8) ";

  const dt = await executeQuery(qry);
  return dt;
};

const getLeaveTypeTEListRepo = async () => {
  let qry = "";
  qry += " select var_leave_name, num_leave_id from aopr_leavesmkc_mas where num_leave_id in (1,2,3,4,9)  ";

  const dt = await executeQuery(qry);
  return dt;
};

module.exports = {
  getESevaEmpLeaveRecordRepo,
  getLeaveTakenAndEarnedRepo,
  getLeaveDetails2Repo,
  getFinalLeaveDetailsRepo,
  getLeaveAvailabilityRepo,
  insertLeaveRecordRepo,
  getLeaveTypeListRepo,
  getLeaveTypeChildListRepo,
  getLeaveTypeOtherListRepo,
  getLeaveTypeTEListRepo,
};
