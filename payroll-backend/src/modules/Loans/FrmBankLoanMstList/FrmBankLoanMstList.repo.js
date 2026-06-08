const {executeQuery} = require("../../../db/queryExecutor")

const getULBwiseEmployeeRepo = async({ulbid}) => {
    console.log(" Repo: Fetch Employee List", { ulbid });
    const binds = {ulbid}

    let sql=``

     if ([1750, 770].includes(Number(ulbid))) {
    sql = `
      SELECT
        num_employee_empid || ' - ' || var_employee_engname AS EMPNAME,
        TO_CHAR(num_employee_empid) AS NUM_EMPLOYEE_EMPID
      FROM aopr_employee_def
      WHERE num_employee_ulbid = :ulbid
      ORDER BY var_employee_engname
    `;
  } else {
    sql = `
      SELECT
        NVL(var_deptslip_sequence, num_employee_empid)
          || ' - ' ||
        var_employee_engname AS EMPNAME,
        TO_CHAR(num_employee_empid) AS NUM_EMPLOYEE_EMPID
      FROM aopr_employee_def
      LEFT JOIN aopr_deptslip_mas
        ON num_deptslip_ulbid = num_employee_ulbid
       AND num_deptslip_empid = num_employee_empid
      WHERE num_employee_ulbid = :ulbid
      ORDER BY var_employee_engname
    `;
  }

  const result = await executeQuery(sql,binds)

  if (!result) {
    throw new Error(result.error)
  }
  return result.rows
}

const getPayHead =async({ulbid}) => {
    console.log("Repo: Fetch PayHead List", ulbid)

    const binds = {ulbid}

    const sql=`
    select var_payheads_ename ,num_payheads_id, num_payhead_subheadid  from view_payheads where 
    num_payhead_subheadid='56' AND 
    num_payheads_ulbid=:ulbid
    order by var_payheads_ename
    `
    const result = await executeQuery(sql, binds)

    if (!result) {
        throw new Error(result.error)
    }

    return result.rows
}

async function getBankLoanListRepo({ulbid, zoneid, deptid, empid, payheadid}) {
  console.log("📤 Repo: Fetch Bank Loan List", {ulbid, zoneid, deptid, empid, payheadid});

  const binds = { ulbid };
  const conditions = [
    "num_bankloan_ulbid = :ulbid"
  ];

  if (zoneid !== null && zoneid !== undefined) {
    conditions.push("b.num_employee_zone = :zoneid");
    binds.zoneid = zoneid;
  }
  if (deptid !== null && deptid !== undefined) {
    conditions.push("b.num_employee_deptid = :deptid");
    binds.deptid = deptid;
  }
  if (empid !== null && empid !== undefined) {
    conditions.push("b.num_employee_empid = :empid");
    binds.empid = empid;
  }
  if (payheadid !== null && payheadid !== undefined) {
    conditions.push("num_bankloan_payheads_id = :payheadid");
    binds.payheadid = payheadid;
  }

  const sql = `
    SELECT
      num_bankloan_id,
      num_bankloan_empid,
      p.var_payheads_ename,
      b.var_employee_engname,
      num_bankloan_payheads_id,
      num_bankloan_bankaccno,
      num_bankloan_interestamt,
      num_bankloan_loanamt,
      num_bankloan_installamt,
      num_bankloan_intrate,
      num_bankloan_balance,
      var_bankloan_active,
      var_bankloan_remark,
      CM.var_category_name AS CATEGORYNAME,
      ZM.var_zone_name AS ZONENAME,
      DM.var_deptmst_deptnamee AS DEPTNAME
    FROM aopr_bankloan_def
    INNER JOIN aopr_employee_def b
      ON num_bankloan_empid = b.num_employee_empid
     AND num_bankloan_ulbid = b.num_employee_ulbid
    INNER JOIN view_payheads p
      ON num_bankloan_payheads_id = p.num_payheads_id
     AND num_bankloan_ulbid = p.num_payheads_ulbid
    INNER JOIN aopr_category_mas CM
      ON b.num_employee_paysheettype = CM.num_category_id
    INNER JOIN aopr_zone_mas ZM
      ON b.num_employee_zone = ZM.num_zone_id
    INNER JOIN aopr_deptmst_def DM
      ON b.num_employee_deptid = DM.num_deptmst_deptid
    WHERE ${conditions.join(" AND ")}
    ORDER BY num_bankloan_id
  `;

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }
  return result.rows;
}

module.exports = {
    getULBwiseEmployeeRepo,
    getPayHead,
    getBankLoanListRepo
}