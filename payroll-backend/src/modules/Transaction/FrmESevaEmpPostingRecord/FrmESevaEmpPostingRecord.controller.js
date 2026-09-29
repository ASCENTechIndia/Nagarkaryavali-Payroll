const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const service = require("./FrmESevaEmpPostingRecord.service");

exports.getServiceDropdown = asyncHandler(async (req, res) => {
    const data = await service.getServiceDropdownService();
    return ok(res, data, "Service dropdown fetched successfully");
});

exports.getPostingRecord = asyncHandler(async (req, res) => {
    console.log("📥 Request Body:", req.body);

    const { ulbid, empId, esevaEmpId } = req.body;
    if (!ulbid)      throw new AppError("ulbid is required", 400);
    if (!empId)      throw new AppError("empId is required", 400);
    if (!esevaEmpId) throw new AppError("esevaEmpId is required", 400);

    const data = await service.getPostingRecordService({ ulbid, empId, esevaEmpId });
    return ok(res, data, "Posting record fetched successfully");
});

exports.insertPostingRecord = asyncHandler(async (req, res) => {
    console.log("📥 BODY  =>", req.body);
    console.log("📥 FILES =>", req.files?.map(f => ({ 
        fieldname: f.fieldname, 
        size: f.size, 
        mimetype: f.mimetype 
    })));

    const {
        userid,
        mode,
        empid,
        ulbid,
        esevaempid,
        STR,
        signatures,  
    } = req.body;

    if (!ulbid)      throw new AppError("ulbid is required", 400);
    if (!empid)      throw new AppError("empid is required", 400);
    if (!esevaempid) throw new AppError("esevaempid is required", 400);
    if (!STR)        throw new AppError("STR is required", 400);

    const filesArray = Array.isArray(req.files) ? req.files : [];
    console.log(`📥 Total files received: ${filesArray.length}`);

    const sigMeta = signatures ? JSON.parse(signatures) : [];
    console.log("📥 Signature metadata:", sigMeta);

    const sigArray = sigMeta.map((meta) => {
        const fieldName = `sign_${meta.recordId}`;
        const uploaded  = filesArray.find(f => f.fieldname === fieldName);

        console.log(`🔍 Field "${fieldName}" →`, uploaded 
            ? `FOUND (${uploaded.size} bytes)` 
            : `NOT FOUND`);

        return {
            recordId:    Number(meta.recordId),
            seq:         Number(meta.seq) || meta.recordId,
            imageBuffer: uploaded ? uploaded.buffer : null,
        };
    });

    console.log("Final signatures array:",
        sigArray.map(s => ({
            recordId:  s.recordId,
            seq:       s.seq,
            hasBuffer: !!s.imageBuffer,
            size:      s.imageBuffer?.length ?? 0
        }))
    );

    const payload = {
        userid,
        mode,
        empid,
        ulbid,
        esevaempid,
        STR,
        signatures: sigArray,
    };

    const data = await service.insertPostingRecordService(payload);

    if (data.success) {
        return ok(res, data, data.message);
    }
    return res.status(400).json({ ok: false, error: data.message });
});