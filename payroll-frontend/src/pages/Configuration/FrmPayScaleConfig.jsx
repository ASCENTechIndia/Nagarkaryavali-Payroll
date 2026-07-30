import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ShadCNTable from "@/components/ui/table";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FrmPayScaleConfig = () => {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const token = user?.token;
  const userId = user?.userId || localStorage.getItem("UserId");

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [payScaleData, setPayScaleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedULB, setSelectedULB] = useState("");
  const [mode, setMode] = useState(1);
  const [payScaleConfigId, setPayScaleConfigId] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); 
  
  const tableHeaders = [
    "निवडा",
    "Pay Scale"
  ];

  const keyMapping = {
    "निवडा": "checked",
    "Pay Scale": "payscalename"
  };

  const columnStyles = {
    "निवडा": { width: "10%", minWidth: "60px" },
    "Pay Scale": { width: "90%", minWidth: "200px" }
  };

  let swalLoader = null;

  // useEffect(() => {
  //   if (ulbId && token) {
  //     fetchCorporation();
  //   }
  // }, [ulbId, token]);

    
  
    useEffect(() => {
      if (ulbId && token) {
        showLoader();
        fetchAllData();
      } else {
        setIsPageLoading(false);
      }
    }, [ulbId, token]);
        
    const showLoader = () => {
      Swal.fire({
        title: 'Loading...',
        text: 'Please wait while data is being loaded',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    };
    
    const hideLoader = () => {
      Swal.close();
      setIsPageLoading(false);
    };
  
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchCorporation(),
        ]);
        
        hideLoader();
      } catch (error) {
        console.error("Error loading initial data:", error);
        hideLoader();
        Swal.fire({
          title: 'Error',
          text: 'Failed to load initial data. Please refresh the page.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

  const fetchCorporation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/FrmDesignationConfig/corporation-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const apiData = res.data?.data || res.data?.data?.data || [];
      
      if (apiData.length > 0) {
        const formatted = apiData.map((item) => ({
          label: item.CORPORATIONNAME || item.corporationname || item.name,
          value: String(item.CORPORATIONID || item.corporationid || item.id),
        }));
        setCorporationOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching corporation:", err);
    }
  };

  const getData = async (ulbIdValue) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/PayScaConfig/payscalelist`,
        { ulbId: Number(ulbIdValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Pay Scale API Response:", response.data);

      let data = [];
      if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
        data = response.data.data.rows;
      } else if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data) {
        data = response.data.data;
      }

      console.log("Pay Scale data:", data);

      if (data.length > 0) {
        const formattedData = data.map((item) => ({
          payscaleid: item.NUM_PAYSCALEMST_PAYSCALEID || item.payscaleid || "",
          payscalename: item.VAR_PAYSCALEMST_PAYSCALENAME || item.payscalename || "-",
          payscalemname: item.VAR_PAYSCALEMST_PAYSCALEMNAME || item.payscalemname || "-",
          groupname: item.VAR_PAYSCALEMST_GROUPNAME || item.groupname || "-",
          groupid: item.NUM_PAYSCALEMST_GROUPID || item.groupid || "",
          status: item.VAR_PAYSLCONFIG_ACTIVEFLAG || item.status || "N",
          checked: false,
          IsChecked: false,
          previousStatus: "N",
          currentStatus: "N"
        }));
        
        console.log("Formatted Data:", formattedData);
        return formattedData;
      } else {
        return [];
      }
    } catch (err) {
      console.error("Error fetching pay scale data:", err);
      throw err;
    }
  };

  const loadConfiguredData = async (ulbIdValue) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/PayScaConfig/configuredpayscalelist`,
        { ulbId: Number(ulbIdValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Configured response:", response.data);

      let configData = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        configData = response.data.data.data;
      } else if (response.data?.data?.rows && Array.isArray(response.data.data.rows)) {
        configData = response.data.data.rows;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        configData = response.data.data;
      } else if (Array.isArray(response.data)) {
        configData = response.data;
      }

      console.log("Configured pay scales:", configData);
      return configData;
    } catch (err) {
      console.error("Error fetching configured pay scales:", err);
      throw err;
    }
  };

  const loadAllData = async (ulbIdValue) => {
    try {
      // Show loader
      swalLoader = Swal.fire({
        title: 'Loading...',
        text: 'Please wait while data is being loaded',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const [payScaleList, configuredList] = await Promise.all([
        getData(ulbIdValue),
        loadConfiguredData(ulbIdValue)
      ]);

      console.log("Pay Scale List:", payScaleList);
      console.log("Configured List:", configuredList);

      // Close loader
      if (swalLoader) {
        swalLoader.close();
      }

      if (payScaleList.length > 0) {
        const configuredIds = new Set(
          configuredList.map(item => String(item.CONFIPAYSCALE_ID || item.payscaleid))
        );

        console.log("Configured IDs:", configuredIds);

        const updatedData = payScaleList.map(item => {
          const isConfigured = configuredIds.has(String(item.payscaleid));
          return {
            ...item,
            checked: isConfigured,
            IsChecked: isConfigured,
            previousStatus: isConfigured ? "Y" : "N",
            currentStatus: isConfigured ? "Y" : "N"
          };
        });

        updatedData.sort((a, b) => {
          if (a.checked === b.checked) return 0;
          return a.checked ? -1 : 1;
        });

        console.log("Final Updated Data:", updatedData);

        setPayScaleData(updatedData);
        setPayScaleConfigId(configuredList);
        setMode(configuredList.length > 0 ? 2 : 1);
        setSelectedULB(ulbIdValue);
        setIsDataLoaded(true);
        
        return updatedData;
      } else {
        setPayScaleData([]);
        setPayScaleConfigId([]);
        setMode(1);
        setIsDataLoaded(true);
        return [];
      }
    } catch (err) {
      // Close loader on error
      if (swalLoader) {
        swalLoader.close();
      }
      
      console.error("Error loading data:", err);
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.response?.data?.message || "Failed to load data",
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setIsDataLoaded(false);
      return [];
    }
  };

  const handleULBChange = async (value) => {
    setSelectedULB(value);
    
    if (value && value !== "0") {
      await loadAllData(value);
    } else {
      setPayScaleData([]);
      setPayScaleConfigId([]);
      setMode(1);
      setIsDataLoaded(false);
    }
  };

  const handleSelectAllChange = (checked) => {
    const updatedData = payScaleData.map(item => ({
      ...item,
      checked: checked === true,
      IsChecked: checked === true,
      currentStatus: checked === true ? "Y" : "N"
    }));
    setPayScaleData(updatedData);
  };

  const handleRowCheckChange = (row, checked) => {
    const updatedData = payScaleData.map(item => {
      if (item.payscaleid === row.payscaleid) {
        return {
          ...item,
          checked: checked,
          IsChecked: checked,
          currentStatus: checked ? "Y" : "N"
        };
      }
      return item;
    });
    setPayScaleData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedULB || selectedULB === "0") {
      Swal.fire({
        text: "Select ULB Name",
        confirmButtonText: 'OK'
      });
      return;
    }
    
    let paramStr = "";
    let chkFlag = false;

    for (const item of payScaleData) {
      const payScaleId = item.payscaleid || "";
      const isChecked = item.checked || false;
      
      const chkedCount = payScaleConfigId.filter(config => 
        String(config.CONFIPAYSCALE_ID || config.payscaleid) === String(payScaleId)
      ).length;

      if (mode === 1) {
        if (isChecked) {
          paramStr += `${payScaleId}#N#Y$`;
          chkFlag = true;
        } else {
          paramStr += `${payScaleId}#N#N$`;
        }
      } else {
        if (isChecked && chkedCount > 0) {
          paramStr += `${payScaleId}#Y#Y$`;
          chkFlag = true;
        } else if (isChecked && chkedCount <= 0) {
          paramStr += `${payScaleId}#N#Y$`;
          chkFlag = true;
        } else if (!isChecked && chkedCount > 0) {
          paramStr += `${payScaleId}#Y#N$`;
          chkFlag = true;
        } else if (!isChecked && chkedCount <= 0) {
          paramStr += `${payScaleId}#N#N$`;
        }
      }
    }

    if (paramStr.length > 0 && chkFlag) {
      paramStr = paramStr.slice(0, -1);
    } else {
      Swal.fire({
        text: "Select atleast one pay scale to save",
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setLoading(true);

    
      swalLoader = Swal.fire({
        title: 'Saving...',
        text: 'Please wait while data is being saved',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const payload = {
        userId: userId,
        ulbId: Number(selectedULB),
        payScaleStr: paramStr,
        mode: mode
      };

      console.log("Save payload:", payload);

      const res = await axios.post(
        `${BASE_URL}/api/PayScaConfig/savepayscaleconfiguration`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

     
      if (swalLoader) {
        swalLoader.close();
      }

      const responseData = res.data?.data || res.data || {};
      const errorCode = responseData.errorCode || responseData.ErrorCode || 0;
      const errorMsg = responseData.errorMsg || responseData.ErrorMsg || responseData.message || "";

      if (errorCode === 9999 || errorCode === 0 || responseData.success === true) {
        await Swal.fire({
          title: 'Success',
          text: errorMsg || "Pay scale configuration saved successfully",
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        if (selectedULB) {
          await loadAllData(selectedULB);
        }
      } else {
        await Swal.fire({
          title: 'Error',
          text: errorMsg || "An error occurred",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      
      if (swalLoader) {
        swalLoader.close();
      }
      
      console.error("Submit Error", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to save data";
      if (errorMessage.toLowerCase().includes("inserted successfully") || 
          errorMessage.toLowerCase().includes("successfully") ||
          errorMessage.toLowerCase().includes("success") ||
          errorMessage.toLowerCase().includes("saved")) {
        await Swal.fire({
          title: 'Success',
          text: errorMessage,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        if (selectedULB) {
          await loadAllData(selectedULB);
        }
      } else {
        await Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-2xl font-semibold">
            Pay Config
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Label className="font-semibold whitespace-nowrap min-w-[140px]">
              नगरपालिकेचे नाव :
            </Label>
            <Select
              value={selectedULB}
              onValueChange={handleULBChange}
            >
              <SelectTrigger className="flex-1 max-w-md h-10">
                <SelectValue placeholder="-- Select Option --" />
              </SelectTrigger>
              <SelectContent>
                {corporationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table Section */}
          {payScaleData.length > 0 && (
            <div className="mt-4">
              <ShadCNTable
                headers={tableHeaders}
                data={payScaleData}
                keyMapping={keyMapping}
                columnStyles={columnStyles}
                pagination={false}
                onSelectAllChange={handleSelectAllChange}
                onRowCheckChange={handleRowCheckChange}
                className="border border-gray-300 rounded-lg overflow-hidden"
              />
            </div>
          )}

          {selectedULB && selectedULB !== "0" && payScaleData.length === 0 && isDataLoaded && (
            <div className="text-center py-8 text-gray-500">
              निवडलेल्या नगरपालिकेसाठी कोणतीही वेतनश्रेणी डेटा उपलब्ध नाही.
            </div>
          )}

          {/* Buttons - Only shown when data is loaded */}
          {isDataLoaded && payScaleData.length > 0 && (
            <div className="flex justify-center gap-3 mt-8 pt-4 border-t">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "साठवा"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                path="/HomePage/FrmHomePage"
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                परत
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FrmPayScaleConfig;