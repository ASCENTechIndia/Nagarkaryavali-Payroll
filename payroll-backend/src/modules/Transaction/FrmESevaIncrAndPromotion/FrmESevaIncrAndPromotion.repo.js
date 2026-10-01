const oracledb = require("oracledb");
const { executeQuery } = require("../../../db/queryExecutor");
const { executeProcedure } = require("../../../db/procedureExecutor");

const getIncrementListRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry +=
    " SELECT a.var_increment_originalpayscale originalpayscale,b.payscalename originalpayscalen,a.var_increment_revisedpayscale revisedpayscale,c.payscalename revisedpayscalen, a.var_increment_orderno orderno,to_char(a.dat_increment_orderdate,'dd/MM/yyyy') orderdate, a.var_increment_details details from aopr_increment_det a";
  qry += " left join vw_PayScaleconf b on b.ulbid = a.num_increment_ulbid and b.payscaleid = a.var_increment_originalpayscale ";
  qry += " left join vw_PayScaleconf c on c.ulbid = a.num_increment_ulbid and c.payscaleid = a.var_increment_revisedpayscale ";
  qry += " where  num_increment_ulbid = '" + ulbId + "' and  num_increment_empcode  = '" + empId + "' and  num_increment_esevaid = '" + esevaEmpId + "' ";

  const dt = await executeQuery(qry);

  return dt;
};

const getPromotionListRepo = async (ulbId, empId, esevaEmpId) => {
  let qry = "";

  qry += " SELECT a.var_promotion_originaldesig originaldesignation,a.var_promotion_originaldept originaldept, a.var_promotion_originalpayscale originalpayscale, ";
  qry += " a.var_promotion_reviseddesig reviseddesignation, a.var_promotion_reviseddept reviseddept,a.var_promotion_revisedpayscale revisedpayscale, a.var_promotion_orderno orderno, ";
  qry += " to_char(a.dat_promotion_orderdate,'dd/MM/yyyy') orderdate, a.var_promotion_details details, ";
  qry += " b.payscalename originalpayscalen,c.payscalename revisedpayscalen,d.deptname originaldeptn,e.deptname reviseddeptn, ";
  qry += " f.var_desigmst_designationname originaldesignationn,g.var_desigmst_designationname reviseddesignationn ";
  qry += " FROM aopr_promotion_det a ";
  qry += " left join vw_PayScaleconf b on b.ulbid = a.num_promotion_ulbid and b.payscaleid = a.var_promotion_originalpayscale ";
  qry += " left join vw_PayScaleconf c on c.ulbid = a.num_promotion_ulbid and c.payscaleid = a.var_promotion_revisedpayscale ";
  qry += " left join vw_deptconfig d on d.ulbid = a.num_promotion_ulbid and d.deptid = a.var_promotion_originaldept ";
  qry += " left join vw_deptconfig e on e.ulbid = a.num_promotion_ulbid and e.deptid = a.var_promotion_reviseddept ";
  qry += " left join aopr_designationmst_def f on f.num_desigmst_designationid = a.var_promotion_originaldesig ";
  qry += " left join aopr_designationmst_def g on g.num_desigmst_designationid = a.var_promotion_reviseddesig ";
  qry += " where  num_promotion_ulbid = '" + ulbId + "' and  num_promotion_empcode  = '" + empId + "' and  num_promotion_esevaid = '" + esevaEmpId + "' ";
  // console.log("qry", qry);
  const dt = await executeQuery(qry);

  return dt;
};

const insertIncrementAndPromotionRepo = async (payload) => {
  const result = await executeProcedure({
    sql: `
      BEGIN
        aopr_increment_ins(
          :in_UserId,
          :in_Mode,
          :in_empcode,
          :in_UlbId,
          :in_esevaid,
          :in_incstr,
          :in_prostr,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
    `,
    binds: {
      in_UserId: payload.userId,
      in_Mode: payload.mode,
      in_empcode: payload.empId,
      in_UlbId: payload.ulbId,
      in_esevaid: payload.esevaEmpId,
      in_incstr: payload.incStr,
      in_prostr: payload.proStr,

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

  console.log("Increment & Promotion Procedure Result =>", JSON.stringify(result, null, 2));

  return {
    success: true,
    errorCode: result.outBinds.out_ErrorCode,
    errorMsg: result.outBinds.out_ErrorMsg,
  };
};

module.exports = {
  getIncrementListRepo,
  getPromotionListRepo,
  insertIncrementAndPromotionRepo,
};
