"use client";

import { CustomColumn } from "@components/shared/DynamicSearch";
import { Table } from "@mantine/core";

/** Props for the Dynamic Table */
export interface CustomDynamicColumnsProps {
  customColumns: CustomColumn[];
}

const CustomColumnsTHead = ({ customColumns }: CustomDynamicColumnsProps) => {
  return customColumns.map((col, index) => {
    return <Table.Th key={`custom-dynamic-header-label-${index}`}>{col.headerLabel}</Table.Th>;
  });
};

export default CustomColumnsTHead;
