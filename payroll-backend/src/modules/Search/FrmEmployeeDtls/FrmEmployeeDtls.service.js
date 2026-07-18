const repo = require("./FrmEmployeeDtls.repo");

const getEmployeeDetailsService = async (ulbid, empid) => {
    console.log(" Service: Get Employee Details", ulbid, empid);
    
    const data = await repo.getEmployeeDetailsRepo(ulbid, empid);
    
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No employee data found"
        }
    }

    return {
        success: true,
        data: data[0]
    }
};

module.exports = {
    getEmployeeDetailsService
};