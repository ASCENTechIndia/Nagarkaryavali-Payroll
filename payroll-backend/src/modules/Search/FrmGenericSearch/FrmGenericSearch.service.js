const repo = require("./FrmGenericSearch.repo")

const getCorporationService = async () => {
    console.log("Service: Corporation List Service");
    const data = await repo.getCorporationRepo()
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found for Corporation List"
        }
    }

    return {
        success: true,
        couunt: data.length,
        data
    }
}

const getEmployeeSearchService = async (payload) => {
    console.log("Service: Employee Search", payload);

    const data = await repo.getEmployeeSearchRepo(payload);
    if (!data || data.length === 0) {
        return {
            success: false,
            message: "No data Found for Corporation List"
        }
    }
    return {
        success: true,
        count: data.length,
        data,
    };
};


module.exports = {
    getCorporationService,
    getEmployeeSearchService
}