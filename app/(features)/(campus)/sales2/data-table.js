"use client"

import * as React from "react"
import { ArrowDown, CalendarBlank, SpinnerGap } from 'phosphor-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/components/ui/table"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import styles from '../../../../app/page.module.css'

import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { Checkbox } from "@/app/components/ui/checkbox"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import { Separator } from "@/app/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Toaster } from "../../../components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"

export function DataTable({ data, dataOffset, status, changeStatus, downloadNow, initialDates, dates, requestAgain, loadingIds, handleMessageSendClick}) {
// export function DataTable({ columns, data, status, changeStatus, downloadNow, initialDates, dates, requestAgain }) {
  
const [messaging, setMessaging] = React.useState(false);
const today = new dayjs();
const { toast } = useToast();

  //////////////////
  ////////This is Columns data
  //////////////////

  
  


// const sendMessageNow = async (e) => {
    
//   setMessaging(true);
  
//   try {    
      
//       const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS, 
//           JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).dealerId, 'All', dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), document.getElementById('message').value,0,'-') 
//       const queryResult = await result.json() // get data

//       console.log(queryResult);
//       // check for the status
//       if(queryResult.status == 200){

//           setMessaging(false);
//           toast("Data is uploaded", {
//               description: "Message sent to all dealers",
//               action: {
//                 label: "Okay",
//                 onClick: () => console.log("Okay"),
//               },
//             });

//       }
//       else if(queryResult.status != 200) {
          
//           setMessaging(false);
//       }
//   }
//   catch (e){
//       console.log(e);
//       // show and hide message
//       setMessaging(false);
//       setResultType('error');
//       setResultMessage('Issue loading. Please refresh or try again later!');
//       setTimeout(function(){
//           setResultType('');
//           setResultMessage('');
//       }, 3000);
//   }
  
// }

    
// Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
const formatter = new Intl.NumberFormat('en-IN', {
  style: 'decimal',  // Use 'currency' for currency formatting
  minimumFractionDigits: 2,  // Minimum number of digits after the decimal
  maximumFractionDigits: 2   // Maximum number of digits after the decimal
});


const columns = [
  // selection
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // columns
    // {
    //     accessorKey: "dealerId",
    //     header: "dealerId",
    //     cell: ({ row }) => {
    //       return <div>{row.getValue('dealerId')}<br/><span className="text-xs text-muted-foreground">{row.getValue('accountName')}</span></div>
    //     },
    // },
    // {
    //   accessorKey: "dealerId",
    //   header: "dealerId"
    // },
    
    {
      accessorKey: "dealerId",
      header: "Dealer",
      cell: ({ row }) => {
        return <div className="flex w-[100px] px-2 py-1 text-md focus:outline-none text-foreground" style={{cursor:'pointer'}}>
                 
            <Sheet>
            <SheetTrigger className="text-green-700 underline underline-offset-4 text-md text-foreground">{row.getValue("dealerId")}</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Dealer Details</SheetTitle>
                <SheetDescription>
                <p className="text-black-700 text-xl text-foreground">{row.getValue("accountName")}</p>
                {/* <p className="text-black-700 text-xl text-foreground">{ row.getValue("dealerId")}</p> */}
                
                <br/>
                <br/>

                  <div className="flex flex-wrap justify-between items-center py-2.5">
                      <p>Account name:</p>
                      <p className="text-black-700 text-md ont-semibold text-foreground">{row.getValue("accountName")}</p>
                  </div>
                  <Separator />
                  
                  <div className="flex flex-wrap justify-between items-center py-2.5">
                      <p>Dealer Id:</p>
                      <p className="text-black-700 text-md ont-semibold text-foreground">{row.getValue("dealerId")}</p>
                  </div>
                  <Separator />
                  
                  <div className="flex flex-wrap justify-between items-center py-2.5">
                      <p>City,State:</p>
                      <p className="text-black-700 text-md ont-semibold text-foreground">{row.getValue("city")}, {row.getValue("district")}, { row.getValue("state")}</p>
                  </div>
                  <Separator />
                  
            
                  {/* <Separator /> */}
                  <div className="flex flex-wrap justify-between items-center py-2.5">
                      <p>Pending:</p>
                      <p className="text-black-700 text-md ont-semibold text-foreground">₹{(row.getValue("pending") != null) ? formatter.format(row.getValue("pending")) :'–'}</p>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

        </div>
      },
    },
   
    {
      accessorKey: "accountName",
      header: "accountName"
    },
   
    {
      accessorKey: "pending",
      header: "Pending",
      cell: ({ row }) => {
        return <div className="flex w-[100px] text-xs font-semibold focus:outline-none text-foreground">
                  { (row.getValue("pending")==null) ? 
                        <span>-</span>  : <span>₹{formatter.format(row.getValue("pending"))}</span>}
                </div>
      },
    },
   
    // {
    //   accessorKey: "address1",
    //   header: "Address",
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex space-x-2">
    //       <TooltipProvider className="flex space-x-2 truncate">
    //           <Tooltip>
    //             <TooltipTrigger className="max-w-[200px] truncate"> 
    //                 {row.getValue("address1")}
    //             </TooltipTrigger>
    //             <TooltipContent>
    //               {/* <p>Add to library</p> */}
    //               {row.getValue("address1")}
    //             </TooltipContent>
    //           </Tooltip>
    //         </TooltipProvider>
    //       </div>

    //     )
    //   }
    // },
    
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "district",
      header: "District",
    },
    {
      accessorKey: "state",
      header: "State",
    },
    // {
    //   accessorKey: "dealerId",
    //   header: "Message",
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex space-x-2">

    //       {/* {(!messaging) ? */}
    //       {loadingIds.has(row.original.dealerId) ? (
    //         <SpinnerGap className={`${styles.icon} ${styles.load}`} />  // Placeholder for your progress indicator
    //     ) :
    //         <Sheet>
    //             <SheetTrigger asChild>
    //                 <Button variant="outline">Message now</Button>
    //             </SheetTrigger>
    //             <SheetContent>
    //                 <SheetHeader>
    //                 <SheetTitle>Send message</SheetTitle>
    //                 <SheetDescription>
    //                 <p className="text-black-700 text-xl text-foreground">To { row.getValue("accountName")}</p>
    //                     {/* To {row.getValue("accountName")}. */}
    //                 </SheetDescription>
    //                 </SheetHeader>
    //                 <div className="grid gap-4 py-4">
    //                     <br/>
    //                     <div className="grid w-full max-w-sm items-center gap-1.5">
    //                         <Label htmlFor="picture">Message</Label>
    //                         <Textarea id="message" placeholder="Type your message here." />
                            
    //                     </div>
    //                 </div>
    //                 <SheetFooter>
    //                 <SheetClose asChild>
    //                     <Button type="submit" onClick={handleMessageSendClick(row)}>Send now</Button>
    //                     {/* <Button type="submit" onClick={sendMessageNow}>Send now</Button> */}
    //                 </SheetClose>
    //                 </SheetFooter>
    //             </SheetContent>
    //             </Sheet>
    //             // :
    //             // <div>
    //             //     <Label htmlFor="picture">Sending...</Label>
    //             // </div>
    //   }
    //       </div>

    //     )
    //   }
    // },




     ///////////////////
    // ACTIONS OF A ROW
    ///////////////////
    {
      id: "actions",
      cell: ({ row }) => {
        // const payment = row.original
  //  console.log(payment);
        
        return <div>
              
                  {loadingIds.has(row.original.dealerId) ? 
                  <SpinnerGap className={`${styles.icon} ${styles.load}`} />  // Placeholder for your progress indicator
                  :     (
                      // <Button onClick={() => handleCompleteClick(row)}>Mark as complete</Button>
                      // <Dialog>
                      //   <DialogTrigger asChild>
                      //     <Button>Mark as complete</Button>
                      //   </DialogTrigger>
                      //   <DialogContent className="sm:max-w-[425px]">
                      //     <DialogHeader>
                      //       <DialogTitle>Meeting notes</DialogTitle>
                      //       <DialogDescription>
                      //         Update notes for this meeting here. It will help to recollect this discussion for later.
                      //       </DialogDescription>
                      //     </DialogHeader>
                      //     <div className="grid gap-4 py-4">
                      //       <div className="items-center gap-4">
                      //         <Label htmlFor="username" className="text-right">
                      //           Notes
                      //         </Label>
                      //         <Textarea ref={textareaRef} id="appointmentnotes" placeholder="Type your notes here." />
                      //       </div>
                      //     </div>
                      //     <DialogFooter>
                      //       <Button type="submit" onClick={() => handleNotesSaveChanges(row)}>Save changes</Button>
                      //       {/* <Button type="submit" onClick={() => handleCompleteClick(row, notes)}>Save changes</Button> */}
                      //     </DialogFooter>
                      //   </DialogContent>
                      // </Dialog>

                      <Sheet>
                      <SheetTrigger asChild>
                          <Button variant="outline">Message now</Button>
                      </SheetTrigger>
                      <SheetContent>
                          <SheetHeader>
                          <SheetTitle>Send message</SheetTitle>
                          <SheetDescription>
                          <p className="text-black-700 text-xl text-foreground">To { row.getValue("accountName")}</p>
                              {/* To {row.getValue("accountName")}. */}
                          </SheetDescription>
                          </SheetHeader>
                          <div className="grid gap-4 py-4">
                              <br/>
                              <div className="grid w-full max-w-sm items-center gap-1.5">
                                  <Label htmlFor="picture">Message</Label>
                                  <Textarea id="message" placeholder="Type your message here." />
                                  
                              </div>
                          </div>
                          <SheetFooter>
                          <SheetClose asChild>
                              <Button type="submit" onClick={()=>handleMessageSendClick(row)}>Send now</Button>
                              {/* <Button type="submit" onClick={sendMessageNow}>Send now</Button> */}
                          </SheetClose>
                          </SheetFooter>
                      </SheetContent>
                      </Sheet>
                      // <Button onClick={() => handleAcceptClick(row.original.appointmentId)}>Accept</Button>
                  )
                  
                  }
              
        </div>
        
        // <div>
        //       Start
        // </div>

      },
    },

  ]
  /////////////////
  /////End of columns data
  /////////////////

  const [sorting, setSorting] = React.useState([]) // sorting
  const [columnFilters, setColumnFilters] = React.useState([]) // filtering
  const [rowSelection, setRowSelection] = React.useState([]) // for cell selection
  const [statusHere, setStatusHere] = React.useState(status)
  // Set the initial state using today's date
  // const [date1, setDate1] = React.useState({from: dayjs(),to: dayjs().add(20, 'day'),});
  const [date, setDate] = React.useState({from: new Date(initialDates.from.format('YYYY-MM-DD')), to: new Date(initialDates.to.format('YYYY-MM-DD'))})
  // const [date, setDate] = React.useState({from: new  Date(2023,10,20), to: addDays(new Date(2023,10,20),20)})
  const [rowsCount, setRowsCount] = React.useState(10)

  const table = useReactTable({
    data,
    columns,
    initialState: {
      hiddenColumns: columns
      .filter(
        (column) =>
          typeof column.accessorFn !== "undefined" && column.getCanHide() && column.getIsVisible()
      ) 
    },
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
      
      {/* <div className={cn("grid gap-2")} style={{display:'flex', flexDirection:'column', alignItems:'start'}}>

          <Tabs defaultValue={statusHere} className="w-[400px]">
              <TabsList>
                <TabsTrigger value="InOuting" onClick={()=>changeStatus('InOuting')}>InOuting</TabsTrigger>
                <TabsTrigger value="Checkout" onClick={()=>changeStatus('Checkout')}>Checkout on</TabsTrigger>
                <TabsTrigger value="Returned" onClick={()=>changeStatus('Returned')}>Returned</TabsTrigger>
                <TabsTrigger value="Submitted" onClick={()=>changeStatus('Submitted')}>Pending</TabsTrigger>
                <TabsTrigger value="Approved" onClick={()=>changeStatus('Approved')}>Approved</TabsTrigger>
                <TabsTrigger value="Issued" onClick={()=>changeStatus('Issued')}>Issued</TabsTrigger>
                
              </TabsList>
            </Tabs>
     </div> */}


      {/* search input for filtering columns */}
      {/* search input for filtering columns */}
      {/* search input for filtering columns */}
      <div className="flex items-center py-2" style={{display:'flex', justifyContent:'space-between'}}>
        <Input
          placeholder="Filter dealers by Id"
          value={(table.getColumn("dealerId")?.getFilterValue()) ?? ""}
          onChange={(event) =>
            table.getColumn("dealerId")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        &nbsp;
        &nbsp;
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} dealers.
        </div> */}
        <div className="gap-2" style={{display:'flex'}}>
          {/* {(status == 'All') ?  */}
            {/* <div className="grid max-w-sm items-center gap-1" style={{display:'flex'}}>
            {(status == 'Checkout' || status == 'Returned') ? 
                <Label htmlFor="email" className="text-sm text-muted-foreground">{status} on:</Label> 
                : null}
                {(status == 'Checkout' || status == 'Returned' ) ? 
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarBlank className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                    />
                    {(date!=null) ?
                    <Button onClick={()=>dates(date)}>Apply selection</Button> : <br/>}
                  </PopoverContent>
                </Popover>
                : null }
                </div> */}
              
          
          {/* : <br/>} */}
          {/* <Button variant="outline" onClick={()=>downloadNow()}> <ArrowDown className="mr-2 h-4 w-4"/> Download</Button> */}
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
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow >
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
      <div className="flex items-center justify-end space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} dealers</div>
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
              requestAgain(dataOffset)
              
              // console.log(table.getRowModel().rows.length);
              // setRowsCount(rowsCount + table.getRowModel().rows.length)
              // console.log(rowsCount);
              // console.log(data.length);
              // if(rowsCount == data.length){
              //   // console.log('kkkkkkk');
              //   // if(!table.getCanNextPage()){
              //   // requestAgain(status)
              //   requestAgain(dataOffset)
              // }
              // requestAgain(status)
              table.nextPage()
            }}
            // disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
