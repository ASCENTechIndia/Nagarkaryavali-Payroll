const repo = require("./FrmOTherEarnEntryRpt.repo");

const getEmployeeService = async() => {
    console.log("Service: FrmOtherEarnEntry Employee Data")
    const data = await repo.getEmployeeRepo()

    if (!data || data.length === 0 ) {
        return{
            success:false,
            message:"No data found"
        }
    }
    return{
        success: true,
        count: data.length,
        data
    }
}

const getEarnEntryService = async(payload) => {
    console.log("Service: FrmOtherEarnEntry Earning Report")
    const data = await repo.getEarnEntryRepo(payload);

    if (!data || data.length === 0) {
        return{
            success: false,
            message: "No data found"
        }
    }
    return{
        success:true,
        count:data.length,
        data
    }
}

module.exports = {
    getEmployeeService,
    getEarnEntryService
}