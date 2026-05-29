import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignaturePhotoTab = ({ 
  signatureImage, photoImage, thumbImage, 
  setSignatureFile, setPhotoFile, setThumbFile,
  ulbId, mode 
}) => {
  
  const isMarathi = ulbId === 751 || ulbId === 870;
  
  const handleFileChange = (event, setFile, setPreview) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(isMarathi ? "प्रतिमेचा कमाल आकार 3MB आहे" : "Max Image size is 3MB");
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-3 text-center p-4 border rounded-lg">
          <Label className="text-base font-semibold">
            {isMarathi ? "स्वाक्षरी" : "Signature"}
          </Label>
          <div className="flex justify-center">
            {signatureImage ? (
              <img 
                src={signatureImage} 
                alt="Signature" 
                className="border border-gray-300 rounded-lg"
                style={{ height: "150px", width: "170px", objectFit: "contain" }}
              />
            ) : (
              <div className="border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center"
                   style={{ height: "150px", width: "170px" }}>
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/jpg,image/jpeg"
              onChange={(e) => handleFileChange(e, setSignatureFile, (preview) => {
              })}
              className="h-9"
            />
            <p className="text-xs text-gray-500">
              {isMarathi ? "फाईल निवडा" : "Choose File"}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-center p-4 border rounded-lg">
          <Label className="text-base font-semibold">
            {isMarathi ? "छायाचित्र" : "Photo"}
          </Label>
          <div className="flex justify-center">
            {photoImage ? (
              <img 
                src={photoImage} 
                alt="Photo" 
                className="border border-gray-300 rounded-lg"
                style={{ height: "150px", width: "170px", objectFit: "contain" }}
              />
            ) : (
              <div className="border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center"
                   style={{ height: "150px", width: "170px" }}>
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/jpg,image/jpeg"
              onChange={(e) => handleFileChange(e, setPhotoFile, (preview) => {
                // setPhotoImage would be handled by parent
              })}
              className="h-9"
            />
            <p className="text-xs text-gray-500">
              {isMarathi ? "फाईल निवडा" : "Choose File"}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-center p-4 border rounded-lg">
          <Label className="text-base font-semibold">
            {isMarathi ? "बोटांचे ठसे" : "Thumb"}
          </Label>
          <div className="flex justify-center">
            {thumbImage ? (
              <img 
                src={thumbImage} 
                alt="Thumb" 
                className="border border-gray-300 rounded-lg"
                style={{ height: "150px", width: "170px", objectFit: "contain" }}
              />
            ) : (
              <div className="border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center"
                   style={{ height: "150px", width: "170px" }}>
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/jpg,image/jpeg"
              onChange={(e) => handleFileChange(e, setThumbFile, (preview) => {
                // setThumbImage would be handled by parent
              })}
              className="h-9"
            />
            <p className="text-xs text-gray-500">
              {isMarathi ? "फाईल निवडा" : "Choose File"}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          <span className="text-red-500">*</span> 
          {isMarathi ? "टीप: प्रतिमेचा कमाल आकार 3MB आहे" : "Note: Max Image size is 3MB"}
        </p>
      </div>
    </div>
  );
};

export default SignaturePhotoTab;