const repo = require("./FrmESevaEmpPostingRecord.repo");

async function getServiceDropdownService() {
    const data = await repo.getServiceDropdownRepo();
    return { success: true, count: data.length, data };
}

async function getPostingRecordService(payload) {
    const data = await repo.getPostingRecordRepo(payload);
    return { success: true, count: data.length, data };
}

async function insertPostingRecordService(payload) {
    console.log("Service: Insert Posting Record");
    console.log("   signatures:",
        (payload.signatures || []).map(s => ({
            recordId: s.recordId,
            hasBuffer: !!s.imageBuffer,
            size: s.imageBuffer?.length ?? 0
        }))
    );

    const result = await repo.insertPostingRecordRepo(payload);
    console.log("📤 Procedure Result:", result);

    if (result.out_ErrorCode === 9999) {

        const sigs = Array.isArray(payload.signatures) ? payload.signatures : [];

        for (const sig of sigs) {
            if (sig.imageBuffer && Buffer.isBuffer(sig.imageBuffer) && sig.imageBuffer.length > 0) {
                console.log(`Updating BLOB: recordId=${sig.recordId}, size=${sig.imageBuffer.length} bytes`);

                const updResult = await repo.updateSignatureBlobRepo({
                    recordId:    sig.recordId,
                    imageBuffer: sig.imageBuffer,
                    empId:       payload.empid,
                    ulbid:       payload.ulbid,
                    esevaEmpId:  payload.esevaempid,
                });

                console.log(` Update result for recordId=${sig.recordId}:`, updResult);
            } else {
                console.log(` Skipping BLOB for recordId=${sig.recordId} — imageBuffer is null/empty`);
            }
        }

        return {
            success: true,
            errorCode: result.out_ErrorCode,
            message: result.out_ErrorMsg || "Posting record saved successfully",
        };
    }

    return {
        success: false,
        errorCode: result.out_ErrorCode,
        message: result.out_ErrorMsg || "Failed to save posting record",
    };
}

module.exports = {
    getServiceDropdownService,
    getPostingRecordService,
    insertPostingRecordService,
};