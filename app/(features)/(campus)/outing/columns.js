import { ColumnDef } from "@tanstack/react-table"
import { date, string } from "yup"
import dayjs from 'dayjs'

import { ArrowUpDown, MoreHorizontal } from "lucide-react" 
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import { Separator } from "@/app/components/ui/separator"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export const OutingRequest = {
  requestId: string,
  collegeId: string,
  username: string,
  description: string,
  requestStatus: "Submitted" | "Approved" | "Issued" | "InOuting" | "Returned" | "Rejected" | "Cancelled",
  requestFrom: date,
  requestTo: date,
  type: string
}

export const columns = [
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
    //     accessorKey: "collegeId",
    //     header: "CollegeId",
    //     cell: ({ row }) => {
    //       return <div>{row.getValue('collegeId')}<br/><span className="text-xs text-muted-foreground">{row.getValue('username')}</span></div>
    //     },
    // },
    // {
    //   accessorKey: "collegeId",
    //   header: "CollegeId"
    // },
    
    {
      accessorKey: "collegeId",
      header: "Student",
      cell: ({ row }) => {
        return <div className="flex w-[100px] px-2 py-1 text-md focus:outline-none text-foreground"
        style={{cursor:'pointer'}}>
                 
                 <Sheet>
                  <SheetTrigger className="text-green-700 underline underline-offset-4 text-md text-foreground">{ row.getValue("collegeId")}</SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Student Details</SheetTitle>
                      <SheetDescription>
                      <h1 className="text-black-700 text-xl text-foreground">{ row.getValue("username")}</h1>
                      <h1 className="text-black-700 text-xl text-foreground">{ row.getValue("collegeId")}</h1>
                      
                      <br/>
                      <br/>

                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Full name:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("username")}</p>
                        </div>
                        <Separator />
                        
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>College Regd Id:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("collegeId")}</p>
                        </div>
                        <Separator />
                        
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Branch:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("year")} year, { row.getValue("branch")} Dept</p>
                        </div>
                        <Separator />
                        
                        {( row.getValue("type") == 'Hostel' || row.getValue("type") == 'hostel') ? 
                            <div style={{width:'100%'}}>
                                <div className="flex flex-wrap justify-between items-center py-2.5">
                                    <p>Type:</p>
                                    <p className="text-black-700 text-md ont-semibold text-foreground">Hosteler</p>
                                </div>
                                <Separator />
                            </div>
                            : 
                            <div style={{width:'100%'}}>
                                <div className="flex flex-wrap justify-between items-center py-2.5">
                                    <p>Type:</p>
                                    <p className="text-black-700 text-md ont-semibold text-foreground">Day scholar</p>
                                </div>
                                <Separator />
                            </div>
                        }

                        {( row.getValue("type") != '-') ? 
                            <div style={{width:'100%'}}>
                                <div className="flex flex-wrap justify-between items-center py-2.5">
                                    <p>Outing type:</p>
                                    <p className="text-black-700 text-md ont-semibold text-foreground">{( row.getValue("outingType") == 'yes') ? 'Self permitted' : 'Not-self permitted'}</p>
                                </div>
                                <Separator />
                            </div>
                            :
                            ''
                        }
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Email:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("email")}</p>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Mobile:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("phoneNumber")}</p>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Hostel:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("hostelName")}</p>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Room number:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("roomNumber")}</p>
                        </div>
                        <Separator />
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>

                  
                </div>
      },
    },
    // {
    //   // accessorKey: "type",
    //   accessorKey: ({val}) =>{
    //     <div>{val}</div>
    //   },
    //   // header: "type",
    //   header: ({ column }) => {
    //     return (
    //       <div hidden>
    //         Type
            
    //       </div>
    //     )
    //   },
      
    //   enableHiding: true,
    //   isVisible: false,
    //   show: false
    // },

   
    
    {
      accessorKey: "campusId",
      header: "College"
    },
    {
      accessorKey: "hostelName",
      header: "Hostel"
    },
    {
      accessorKey: "roomNumber",
      header: "Room"
    },
    {
      accessorKey: "username",
      header: "Username"
    },
    {
      accessorKey: "requestStatus",
      // header: "Status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Current status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    
    {
      accessorKey: "requestType",
      header: "Outing Type",
      cell: ({ row }) => {
        return <div className="flex w-[100px] rounded-md border px-2 py-1 text-xs font-semibold focus:outline-none text-foreground">
                  { (row.getValue("requestType")==1) ? 
                        <span>LOCAL</span> : 
                          (row.getValue("requestType")==2) ? 
                          <span>OUT-CITY</span> :  
                              (row.getValue("requestType")==3) ? 
                              <span>OFFICIAL</span> : <span>TEMPORARY</span>}
                </div>
      },
    },
    // {
    //   accessorKey: "requestFrom",
    //   header: "From",
    //   cell: ({ row }) => {
    //     return <div className="flex space-x-2">
                
    //           <TooltipProvider className="flex space-x-2 truncate">
    //             <Tooltip>
    //               <TooltipTrigger className="max-w-[200px] truncate"> 
    //               {dayjs(row.getValue("requestFrom")).format("DD/MM/YY")} - {dayjs(row.getValue("requestTo")).format("DD/MM/YY")}
    //               </TooltipTrigger>
    //               <TooltipContent>
    //                 {dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm A")} - {dayjs(row.getValue("requestTo")).format("DD/MM/YY hh:mm A")}
    //               </TooltipContent>
    //             </Tooltip>
    //           </TooltipProvider>
    //         </div>
    //     // <div className="max-w-[400px]">
    //     // <div className="text-xs text-muted-foreground">{dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm A")}<br/>{dayjs(row.getValue("requestTo")).format("DD/MM/YY hh:mm A")}</div>
    //     // </div>
    //     // return <div>{dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm A")}</div>
    //   },
    // },
    {
      accessorKey: "requestFrom",
      // header: "From",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            From
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>{dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm A")}</div>
      },
    },
    {
      accessorKey: "requestTo",
      // header: "To",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            To
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>{dayjs(row.getValue("requestTo")).format("DD/MM/YY hh:mm A")}</div>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      // header: ({ column }) => (
      //   <DataTableColumnHeader column={column} title="Description" />
      // ),
      cell: ({ row }) => {
        // const label = labels.find(label => label.value === row.original.label)
  
        return (
          <div className="flex space-x-2">
            {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
            {/* <span className="max-w-[200px] truncate">
              {row.getValue("description")}
            </span> */}
            

          <TooltipProvider className="flex space-x-2 truncate">
              <Tooltip>
                <TooltipTrigger className="max-w-[200px] truncate"> 
                    {row.getValue("description")}
                </TooltipTrigger>
                <TooltipContent>
                  {/* <p>Add to library</p> */}
                  {row.getValue("description")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

        )
      }
    },
    {
      accessorKey: "requestDate",
      // header: "Submitted",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>{dayjs(row.getValue("requestDate")).format("DD/MM/YY hh:mm A")}</div>
      },
    },

    {
      accessorKey: "checkoutOn",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Check out
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (row.getValue("checkoutOn")!=null) ? 
        <div>{dayjs(row.getValue("checkoutOn")).format("DD/MM/YY hh:mm A")}</div> : 
        <div>––</div> 
      },
    },

    {
      accessorKey: "returnedOn",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Returned
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (row.getValue("returnedOn")!=null) ? 
        <div>{dayjs(row.getValue("returnedOn")).format("DD/MM/YY hh:mm A")}</div> : 
        <div>––</div> 
      },
    },
    
    {
      accessorKey: "branch",
      header: "Branch",
      // cell: ({ row }) => {
      //   return <div>{dayjs(row.getValue("branch")).format("DD/MM/YY hh:mm A")}</div>
      // },
    },
    {
      accessorKey: "year",
      // header: "Year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Year
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      // cell: ({ row }) => {
      //   return <div>{dayjs(row.getValue("year")).format("DD/MM/YY hh:mm A")}</div>
      // },
    },

    /// HIDDEN COLUMNS
       
    {
      accessorKey: "type",
      header: ({ column }) => { return ( <div hidden> Type </div> ) },
      cell: ({ row }) => { return <div hidden>{row.getValue('type')}</div>
      },
  },
  {
      accessorKey: "email",
      header: ({ column }) => { return ( <div hidden> email </div> ) },
      cell: ({ row }) => { return <div hidden>{row.getValue('email')}</div>
      },
  },
  {
      accessorKey: "phoneNumber",
      header: ({ column }) => { return ( <div hidden> phoneNumber </div> ) },
      cell: ({ row }) => { return <div hidden>{row.getValue('phoneNumber')}</div>
      },
  },
  {
      accessorKey: "outingType",
      header: ({ column }) => { return ( <div hidden> outingType </div> ) },
      cell: ({ row }) => { return <div hidden>{row.getValue('outingType')}</div>
      },
  },
 

    // {
    //   accessorKey: "requestFrom",
    //   // header: "Request dates"
    //   header: () => <div>Request dates</div>,
    //   cell: ({ row }) => {
    //     console.log(dayjs(row.getValue("requestFrom")).format("DD/MM/YY"));
    //     const formatted = (dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm A") + '\n' + dayjs(row.getValue("requestTo")).format("DD/MM/YY hh:mm A"))
    //     // const formatted = (dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm:ss") + '-' + row.getValue("requestTo"))
    //     // const formatted = (dayjs(row.getValue("requestFrom")).format("DD/MM/YY hh:mm:ss") + '-' + dayjs(row.getValue("requestTo")).format("DD/MM/YY"))
    //     // const formatted = new Intl.NumberFormat("en-US", {
    //     //   style: "currency",
    //     //   currency: "USD",
    //     // }).format(amount)
  
    //     return <div>{formatted}</div>
    //   },
    // },




    ///////////////////
    // ACTIONS OF A ROW
    ///////////////////
    // {
    //   id: "actions",
    //   cell: ({ row }) => {
    //     const payment = row.original
   
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(payment.id)}
    //           >
    //             Copy payment ID
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem>View customer</DropdownMenuItem>
    //           <DropdownMenuItem>View payment details</DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     )
    //   },
    // },

  ]
  