"use client"

import * as React from "react"
import { ArrowDown, CalendarBlank } from 'phosphor-react'
import { addDays, format } from "date-fns"
import dayjs from 'dayjs'
import { DateRange } from "react-day-picker"
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from "@tanstack/react-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/components/ui/table"
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/app/components/ui/popover"
import { cn } from "@/app/lib/utils"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Calendar } from "@/app/components/ui/calendar"

export function HostelStrengthsDataTable({ columns, data, downloadNow, view}) {
  const [sorting, setSorting] = React.useState([]) // sorting
  const [columnFilters, setColumnFilters] = React.useState([]) // filtering
  const [rowSelection, setRowSelection] = React.useState([]) // for cell selection

  // Set the initial state using today's date
  // const [date1, setDate1] = React.useState({from: dayjs(),to: dayjs().add(20, 'day'),});
//   const [date, setDate] = React.useState({from: new Date(initialDates.from.format('YYYY-MM-DD')), to: new Date(initialDates.to.format('YYYY-MM-DD'))})
  // const [date, setDate] = React.useState({from: new  Date(2023,10,20), to: addDays(new Date(2023,10,20),20)})
//   const [rowsCount, setRowsCount] = React.useState(10)
  const [rowsCount, setRowsCount] = React.useState()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // pagination
    // sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })
  

  

  return (

    <div>
      

      {/* Filtered count */}
      {/* Filtered count */}
      {/* Filtered count */}
      {(table.getFilteredSelectedRowModel().rows.length > 0) ?
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      : null}
      

      {/* search input for filtering columns */}
      {/* search input for filtering columns */}
      {/* search input for filtering columns */}
      <div className="flex items-center py-2" style={{display:'flex', justifyContent:'space-between'}}>
        {(view == 'college') ?
        <Input
          placeholder="Filter by college"
          value={(table.getColumn("campusId")?.getFilterValue()) ?? ""}
          onChange={(event) =>
            table.getColumn("campusId")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> : 
        <Input
          placeholder="Filter by hostel"
          value={(table.getColumn("hostelName")?.getFilterValue()) ?? ""}
          onChange={(event) =>
            table.getColumn("hostelName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> }
        &nbsp;
        &nbsp;
        <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} {(view == 'college') ? 'Rows' : 'Hostels' }.
      </div>
        <div className="gap-2" style={{display:'flex'}}>
          {/* {(status == 'All') ?  */}
           
              
          
          {/* : <br/>} */}
          <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* {table.getRowModel().rows?.length ? ( */}
            {(true) ? (
              table.getFilteredRowModel().rows.map(row => (
            //   table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-start text-base leading-8">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-18 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* pagination */}
        {/* pagination */}
        {/* pagination */}
      {/* <div className="flex items-center justify-end space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} requests {table.getRowModel().rows.length} {data.length}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('ppppppppppp');
              console.log(table.getRowModel().rows.length);
              setRowsCount(rowsCount + table.getRowModel().rows.length)
              console.log(rowsCount);
              console.log(data.length);
              if(rowsCount == data.length){
                console.log('kkkkkkk');
              // if(!table.getCanNextPage()){
                requestAgain(status)
              }
              // requestAgain(status)
              table.nextPage()
            }}
            // disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div> */}
      </div>
    </div>
  )
}
