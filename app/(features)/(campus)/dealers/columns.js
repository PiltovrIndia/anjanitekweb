import dayjs from 'dayjs'
import { Button } from "@/app/components/ui/button"
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
// get message to dealers
const sendDealerMessage = async (pass, sender, receiver, sentAt, message, seen, state) => 
  
  fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
      },
  });
  



const sendMessageNow = async (e) => {
    
  setMessaging(true);
  
  try {    
      
      const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS, 
          JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId, 'All', dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), document.getElementById('message').value,0,'-') 
      const queryResult = await result.json() // get data

      console.log(queryResult);
      // check for the status
      if(queryResult.status == 200){

          setMessaging(false);
          toast("Data is uploaded", {
              description: "Message sent to all dealers",
              action: {
                label: "Okay",
                onClick: () => console.log("Okay"),
              },
            });

      }
      else if(queryResult.status != 200) {
          
          setMessaging(false);
      }
  }
  catch (e){
      
      // show and hide message
      setMessaging(false);
      setResultType('error');
      setResultMessage('Issue loading. Please refresh or try again later!');
      setTimeout(function(){
          setResultType('');
          setResultMessage('');
      }, 3000);
  }
  
}

    
// Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
const formatter = new Intl.NumberFormat('en-IN', {
  style: 'decimal',  // Use 'currency' for currency formatting
  minimumFractionDigits: 2,  // Minimum number of digits after the decimal
  maximumFractionDigits: 2   // Maximum number of digits after the decimal
});


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
    //     accessorKey: "userId",
    //     header: "userId",
    //     cell: ({ row }) => {
    //       return <div>{row.getValue('userId')}<br/><span className="text-xs text-muted-foreground">{row.getValue('accountName')}</span></div>
    //     },
    // },
    // {
    //   accessorKey: "userId",
    //   header: "userId"
    // },
    
    {
      accessorKey: "userId",
      header: "Dealer",
      cell: ({ row }) => {
        return <div className="flex w-[100px] px-2 py-1 text-md focus:outline-none text-foreground"
        style={{cursor:'pointer'}}>
                 
                 <Sheet>
                  <SheetTrigger className="text-green-700 underline underline-offset-4 text-md text-foreground">{ row.getValue("userId")}</SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Dealer Details</SheetTitle>
                      <SheetDescription>
                      <p className="text-black-700 text-xl text-foreground">{ row.getValue("accountName")}</p>
                      {/* <p className="text-black-700 text-xl text-foreground">{ row.getValue("userId")}</p> */}
                      
                      <br/>
                      <br/>

                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Account name:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("accountName")}</p>
                        </div>
                        <Separator />
                        
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Dealer Id:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("userId")}</p>
                        </div>
                        <Separator />
                        
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>City,State:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">{ row.getValue("city")}, { row.getValue("state")}</p>
                        </div>
                        <Separator />
                        
                  
                        {/* <Separator /> */}
                        <div className="flex flex-wrap justify-between items-center py-2.5">
                            <p>Pending:</p>
                            <p className="text-black-700 text-md ont-semibold text-foreground">₹{ (row.getValue("pending") != null) ? formatter.format(row.getValue("pending")) :'–'}</p>
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
   
    {
      accessorKey: "address1",
      header: "Address",
      // header: ({ column }) => (
      //   <DataTableColumnHeader column={column} title="Description" />
      // ),
      cell: ({ row }) => {
        // const label = labels.find(label => label.value === row.original.label)
  
        return (
          <div className="flex space-x-2">
          <TooltipProvider className="flex space-x-2 truncate">
              <Tooltip>
                <TooltipTrigger className="max-w-[200px] truncate"> 
                    {row.getValue("address1")}
                </TooltipTrigger>
                <TooltipContent>
                  {/* <p>Add to library</p> */}
                  {row.getValue("address1")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

        )
      }
    },
    
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "dealerId",
      header: "Message",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">

          {(!messaging) ?
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
                        <Button type="submit" onClick={sendMessageNow}>Send now</Button>
                        {/* <Button type="submit" onClick={sendMessageNow}>Send now</Button> */}
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Broadcasting...</Label>
                </div>
      }
          </div>

        )
      }
    },

  ]
  