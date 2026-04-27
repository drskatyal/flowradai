"use client";
import { useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectRoleProps {
  field: ControllerRenderProps<any, "role">;
}

export const SelectRole = ({ field }: SelectRoleProps) => {
  const [userRoles] = useState([]);
  return (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field?.onChange} defaultValue={field?.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {/* {userRoles.map((role) => (
            <SelectItem key={role?.value} value={role?.value}>
              {role?.label}
            </SelectItem>
          ))} */}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
