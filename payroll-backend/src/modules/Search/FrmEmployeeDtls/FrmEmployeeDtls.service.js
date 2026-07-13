  const repo = require("./FrmEmployeeDtls.repo")

const getEmployeeDetailsService = async (ulbid, empid) => {
    console.log("Service: Get Employee Details", ulbid, empid);
    
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
}

const getEmployeeImagesService = async (ulbid, empid) => {
    console.log("Service: Get Employee Images", ulbid, empid);
    
    const data = await repo.getEmployeeImagesRepo(ulbid, empid);
    
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No images found for employee"
        }
    }

    return {
        success: true,
        data: data[0]
    }
}

const getOfficeGradeListService = async (ulbid) => {
    console.log("Service: Get Office Grade List", ulbid);
    
    const data = await repo.getOfficeGradeListRepo(ulbid);
    
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No office grade data found"
        }
    }

    return {
        success: true,
        count: data.length,
        data
    }
}

module.exports = {
    getEmployeeDetailsService,
    getEmployeeImagesService,
    getOfficeGradeListService
}