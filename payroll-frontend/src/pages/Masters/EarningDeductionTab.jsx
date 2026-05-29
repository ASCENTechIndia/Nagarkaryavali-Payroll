import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShadCNTable from "@/components/ui/table";

const EarningDeductionTab = ({ 
  earningList, deductionList, setEarningList, setDeductionList,
  ulbId, basicSalary, setBasicSalary, mode
}) => {
  
  const isMarathi = ulbId === 751 || ulbId === 870;
  
  const earningHeaders = [isMarathi ? "मिळकत" : "Earning", isMarathi ? "रक्कम" : "Amount"];
  const deductionHeaders = [isMarathi ? "कटाई" : "Deduction", isMarathi ? "रक्कम" : "Amount"];
  
  const [totalEarnings, setTotalEarnings] = React.useState(0);
  const [totalDeductions, setTotalDeductions] = React.useState(0);
  const [netPayable, setNetPayable] = React.useState(0);

  useEffect(() => {
    let earningsTotal = parseFloat(basicSalary) || 0;
    earningList.forEach(item => {
      earningsTotal += parseFloat(item.amount) || 0;
    });
    setTotalEarnings(earningsTotal);
    
    let deductionsTotal = 0;
    deductionList.forEach(item => {
      deductionsTotal += parseFloat(item.amount) || 0;
    });
    setTotalDeductions(deductionsTotal);
    
    setNetPayable(earningsTotal - deductionsTotal);
  }, [earningList, deductionList, basicSalary]);

  const handleEarningChange = (index, value) => {
    const updated = [...earningList];
    updated[index].amount = value.replace(/[^0-9]/g, "");
    setEarningList(updated);
  };

  const handleDeductionChange = (index, value) => {
    const updated = [...deductionList];
    updated[index].amount = value.replace(/[^0-9]/g, "");
    setDeductionList(updated);
  };

  const transformedEarningData = earningList.map((item, index) => ({
    [isMarathi ? "मिळकत" : "Earning"]: item.name,
    [isMarathi ? "रक्कम" : "Amount"]: (
      <Input
        value={item.amount}
        onChange={(e) => handleEarningChange(index, e.target.value)}
        className="h-8 w-32 text-right"
      />
    )
  }));

  const transformedDeductionData = deductionList.map((item, index) => ({
    [isMarathi ? "कटाई" : "Deduction"]: item.name,
    [isMarathi ? "रक्कम" : "Amount"]: (
      <Input
        value={item.amount}
        onChange={(e) => handleDeductionChange(index, e.target.value)}
        className="h-8 w-32 text-right"
      />
    )
  }));

  if (mode !== 2) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10 text-gray-500">
          
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <ShadCNTable
              headers={earningHeaders}
              data={transformedEarningData}
              keyMapping={{
                [earningHeaders[0]]: earningHeaders[0],
                [earningHeaders[1]]: earningHeaders[1]
              }}
              pagination={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <ShadCNTable
              headers={deductionHeaders}
              data={transformedDeductionData}
              keyMapping={{
                [deductionHeaders[0]]: deductionHeaders[0],
                [deductionHeaders[1]]: deductionHeaders[1]
              }}
              pagination={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "मूळ वेतन" : "Basic Salary"} />
            <span>:</span>
          </div>
          <Input
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-9 w-48 text-right"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "एकूण मिळकत" : "Total Earning"} />
            <span>:</span>
          </div>
          <Input
            value={totalEarnings.toFixed(2)}
            readOnly
            className="h-9 w-full"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:w-36 shrink-0 flex justify-start sm:justify-between items-center">
            <Label text={isMarathi ? "एकूण कटाई" : "Total Deduction"} />
            <span>:</span>
          </div>
          <Input
            value={totalDeductions.toFixed(2)}
            readOnly
            className="h-9 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default EarningDeductionTab;