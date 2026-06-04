import React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const FrmBillGeneration = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-5"
    >
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold">
            Bill Generation
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Date Section */}
            <div className="space-y-2">
              <Label required>Date</Label>

              <div className="flex gap-3">
                <Select defaultValue="2">
                  <SelectTrigger className="w-full">
                    <SelectValue />
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

                <Select defaultValue="2026">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label required>Department</Label>

              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">
                    महापालिका अतिरिक्त आयुक्त कार्यालय-1
                  </SelectItem>

                  <SelectItem value="2">
                    महापालिका अतिरिक्त आयुक्त कार्यालय-2
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="type"
                    value="generate"
                    className="h-4 w-4"
                  />
                  <span>Generate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="type"
                    value="print"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <span>Print</span>
                </label>
              </div>
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

export default FrmBillGeneration;