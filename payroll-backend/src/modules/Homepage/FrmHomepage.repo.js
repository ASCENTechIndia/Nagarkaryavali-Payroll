const { executeQuery } = require("../../db/queryExecutor");

// ===============================
// Department Wise Employee Count
// ===============================
const getDepartmentWiseEmployeeRepo = async (ulbId) => {
  const query = `
        select * from view_deptWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

// ===============================
// Grade Wise Employee Count
// ===============================
const getGradeWiseEmployeeRepo = async (ulbId) => {
  const query = `
        select * from view_GradeWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

// ===============================
// Department Wise Salary
// ===============================
const getDepartmentWiseSalaryRepo = async (ulbId) => {
  const query = `
        select department,salary
        from view_deptWiseEmpCount
        where ulbid = :ulbId
    `;

  return await executeQuery(query, { ulbId });
};

module.exports = {
  getDepartmentWiseEmployeeRepo,
  getGradeWiseEmployeeRepo,
  getDepartmentWiseSalaryRepo,
};
