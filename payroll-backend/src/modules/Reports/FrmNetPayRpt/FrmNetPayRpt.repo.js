const { executeQuery } = require("../../../db/queryExecutor");

async function getNetPayDataRepo({ ulbId, departmentId, lastDate }) {
  console.log("Repo: Fetch Net Pay Data", { ulbId, departmentId, lastDate });

  const sql = `
    SELECT 
      accno,
      branchname,
      empid,
      empname,
      netsal,
      deptname,
      empclass,
      saldate
    FROM vw_netpay
    WHERE saldate = :lastDate
      AND ulbid = :ulbId
      AND deptid = :departmentId
    ORDER BY empid
  `;

  const binds = {
    ulbId,
    departmentId,
    lastDate
  };

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getVacantPostsDataRepo({ ulbId, departmentId, lastDate }) {
  console.log("Repo: Fetch Vacant Posts Data", { ulbId, departmentId, lastDate });

  const sql = `
    SELECT 
      EMPID,
      ENGNAME,
      SALDATE,
      ULBID,
      DEPTID,
      DEPTNAMEE,
      desigid,
      desigename
    FROM vw_vacantposts
    WHERE saldate = :lastDate
      AND ulbid = :ulbId
      AND deptid = :departmentId
    ORDER BY EMPID
  `;

  const binds = {
    ulbId,
    departmentId,
    lastDate
  };

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

module.exports = {
  getNetPayDataRepo,
  getVacantPostsDataRepo
};