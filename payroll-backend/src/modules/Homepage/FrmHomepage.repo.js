const { executeQuery } = require("../../db/queryExecutor");

const getDepartmentWiseEmployeeRepo = async (ulbId) => {
  const query = `
        select * from view_deptWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

const getGradeWiseEmployeeRepo = async (ulbId) => {
  const query = `
        select * from view_GradeWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

const getDepartmentWiseSalaryRepo = async (ulbId) => {
  const query = `
        select department,salary
        from view_deptWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

async function getDesignation({deptId, ulbId}) {
  console.log("📤 Repo: Fetch Dessignation", {deptId, ulbId});

  const sql = `
      SELECT COUNT(empid)EmpCount, designationname, designationid from VW_Dashbord 
      where ulbid = :ulbId and deptid = :deptId
      group by  designationname, designationid having  COUNT(empid) > 0
  `;

  const binds = { deptId, ulbId };

  const result = await executeQuery(sql, binds);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.rows;
}

async function getDepartment({ ulbId }) {
    console.log("📤 Repo: Fetch Department List", { ulbId });

    const sql = `
        SELECT COUNT(empid) AS EmpCount, deptnamee, deptid
        FROM VW_Dashbord
        WHERE ulbid = :ulbId
        GROUP BY deptnamee, deptid
        HAVING COUNT(empid) > 0
    `;

    const binds = { ulbId };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

async function getEmployee({ ulbId, deptId, designationId }) {
    console.log("📤 Repo: Fetch Employee List", { ulbId, deptId, designationId });

    const sql = `
        SELECT * FROM VW_Dashbord
        WHERE ulbid = :ulbId
          AND deptid = :deptId
          AND designationid = :designationId
    `;

    const binds = { ulbId, deptId, designationId };
    const result = await executeQuery(sql, binds);

    if (!result.success) {
        throw new Error(result.error);
    }
    return result.rows;
}

module.exports = {
  getDepartmentWiseEmployeeRepo,
  getGradeWiseEmployeeRepo,
  getDepartmentWiseSalaryRepo,
  getDesignation,
  getDepartment,
  getEmployee
};
