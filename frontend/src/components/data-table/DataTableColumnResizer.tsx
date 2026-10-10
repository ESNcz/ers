"use client";

import type { Header } from "@tanstack/react-table";
import type { PointerEvent } from "react";

import classes from "./DataTable.module.css";

interface DataTableColumnResizerProps<TData, TValue> {
  header: Header<TData, TValue>;
}

/**
 * Drag handle on the header cell edge.
 *
 * TanStack's resize handler starts from `getSize()`, which is only the minimum of a growing column,
 * so dragging starts from the width the column is rendered with instead. The result is stored as the
 * column size, which turns the column into a fixed width one until it's reset by double click.
 */
export function DataTableColumnResizer<TData, TValue>({ header }: DataTableColumnResizerProps<TData, TValue>) {
  const { column } = header;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();

    const handle = event.currentTarget;
    const cell = handle.parentElement;
    if (!cell) return;

    const startX = event.clientX;
    const startWidth = cell.getBoundingClientRect().width;
    const { minSize = 0, maxSize = Number.MAX_SAFE_INTEGER } = column.columnDef;

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const width = Math.min(maxSize, Math.max(minSize, Math.round(startWidth + moveEvent.clientX - startX)));
      header.getContext().table.setColumnSizing((current) => ({ ...current, [column.id]: width }));
    };
    const handlePointerUp = () => {
      handle.removeEventListener("pointermove", handlePointerMove);
      handle.removeEventListener("pointerup", handlePointerUp);
      handle.removeEventListener("pointercancel", handlePointerUp);
    };

    // Pointer capture keeps the move events coming when the pointer leaves the handle
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener("pointermove", handlePointerMove);
    handle.addEventListener("pointerup", handlePointerUp);
    handle.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div
      className={classes.resizer}
      onPointerDown={handlePointerDown}
      onDoubleClick={() => column.resetSize()}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column, double click to reset"
    />
  );
}
