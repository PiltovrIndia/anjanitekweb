import { ColumnDef } from "@tanstack/react-table"
import { date, string, number } from "yup"
import dayjs from 'dayjs'

import { ArrowUpDown, MoreHorizontal } from "lucide-react" 
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
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
export const HostelStrength = {
  hostelName: string,
  total: number,
  InOuting: number,
  InHostel: number
}

export const hostelstrengthscolumns = [
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
    {
      accessorKey: "hostelName",
      header: "Hostel"
    },
    {
      accessorKey: "total",
      header: "Total Strength",
      cell: ({ row }) => {
        return <div className="text-m font-mono text-foreground">
                  {row.getValue("total")}
                </div>
      },
    },
  
  {
      accessorKey: "InOuting",
      header: "In Outing",
      cell: ({ row }) => {
        return <div className="text-m font-mono text-foreground">
                  {row.getValue("InOuting")}
                </div>
      },
    },
  
  {
      accessorKey: "InHostel",
      header: "In Hostel",
      cell: ({ row }) => {
        return <div className="text-m font-mono text-foreground">
                  {row.getValue("InHostel")}
                </div>
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
  