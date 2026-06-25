import React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FrmMonthlyBankUploadReport = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
     
    >
      <Card >
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-2xl md:text-3xl font-bold ">
            Monthly Bank Upload Report
          </CardTitle>
        </CardHeader>

        {/* Form */}
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Department */}
            <div className="space-y-2">
              <Label required>Department</Label>

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">
                    Water Department
                  </SelectItem>

                  <SelectItem value="2">
                    Administration
                  </SelectItem>

                  <SelectItem value="3">
                    Health Department
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label required>Year</Label>

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <Label required>Month</Label>

              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              type="button"
             
            >
              Print
            </Button>

            <Button
              type="button"
              variant="outline"
             
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmMonthlyBankUploadReport;