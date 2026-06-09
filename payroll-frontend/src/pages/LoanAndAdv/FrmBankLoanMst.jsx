import React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DatePicker } from "@/components/ui/calendar";

const FrmBankLoanMst = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
     
    >
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">
            Loans And Advances
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-5">
            {/* ID */}
            <div className="space-y-2">
              <Label text="ID" />
              <Input
                disabled
                className="bg-[#BFD4EB]"
              />
            </div>

            {/* Employee */}
            <div className="space-y-2">
              <Label text="Employee" required />
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Employee Name
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pay Head */}
            <div className="space-y-2">
              <Label text="Pay Head" required />
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Festival Advance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label text="Account Number" required className="min-w-[180px]" />
              <Input />
            </div>

            {/* Loan Amount */}
            <div className="space-y-2">
              <Label text="Loan Amount" required />
              <Input type="number" />
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label text="Interest Rate" required />
              <Input type="number" />
            </div>

            {/* Balance Amount */}
            <div className="space-y-2">
              <Label text="Balance Amount" required className="min-w-[180px]" />
              <Input type="number" />
            </div>

            {/* Installment Amount */}
            <div className="space-y-2">
              <Label text="Installment Amount" required className="min-w-[180px]" />
              <Input type="number" />
            </div>

            {/* Interest Amount */}
            <div className="space-y-2">
              <Label text="Interest Amount" required className="min-w-[180px]" />
              <Input type="number" />
            </div>

            {/* Active */}
            <div className="space-y-2">
              <Label text="Active" />

              <div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="status"
                    defaultChecked
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center gap-2">
                  <Input
                    type="radio"
                    name="status"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Bank */}
            <div className="space-y-2">
              <Label text="Bank" required />
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    State Bank
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label text="Branch" required />
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Option --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Main Branch
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loan Start Date */}
            <div className="space-y-2">
              <Label text="Loan Start Date" required className="min-w-[180px]" />
              <DatePicker />
            </div>

            {/* Loan End Date */}
            <div className="space-y-2">
              <Label text="Loan End Date" required />
              <DatePicker />
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label text="Remark" />
              <Textarea
                rows={2}
                className="min-h-[42px]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 pt-8">
            <Button type="button">
              Save
            </Button>

            <Button
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FrmBankLoanMst;