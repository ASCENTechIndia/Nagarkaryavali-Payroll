const { success } = require("zod")
const repo = require("./RptLeaveStatus.repo")

const leaveTypeService = async() => {
    console.log("Service: Leave Status Dropdown")
    const data = await repo.leaveTypeRepo()

    if (!data || data.length === 0) {
        return{
            success:false,
            message: "No data found"
        }
    }

    return{
        success:true,
        count:data.length,
        data
    }
}

const getLeaveReportService = async(payload) => {
    console.log("📥 Service: Fetch Leave Report", payload);
    const data = await repo.getLeaveReportRepo(payload);

     if (!data || data.length === 0) {
        return{
            success:false,
            message: "No data found"
        }
    }
    return {
        success: true,
        count: data.length,
        data,
    };
}

module.exports = {
    leaveTypeService,
    getLeaveReportService
}