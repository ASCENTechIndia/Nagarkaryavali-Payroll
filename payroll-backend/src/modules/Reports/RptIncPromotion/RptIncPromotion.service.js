const repo = require("./RptIncPromotion.repo")

const getIncPromotionReportService = async(payload) => {
    console.log("📥 Service: Fetch Increment Promotion Report",payload);

    const data = await repo.getIncPromotionReportRepo(payload);
    return {
        success: true,
        count: data.length,
        data,
    };
}

module.exports = {
    getIncPromotionReportService
}