'use client'

import { Inter } from 'next/font/google'
import { SpinnerGap, Receipt, ArrowDown, CheckCircle } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import { getStorage } from "firebase/storage";
// const storage = getStorage();
import firebase from '../../../firebase';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from '@/app/components/ui/select'
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"



const storage = getStorage(firebase, "gs://smartcampusimages-1.appspot.com");
// import fs from 'fs'


const xlsx = require('xlsx');



// import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Toaster } from "../../../../app/components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"
import { Button } from "@/app/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/app/components/ui/table"
  
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from "../../../../app/components/ui/card"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../../../app/components/ui/sheet"


// get all confirmation events so far
const getAllConfirmationEventsAPI = async (pass) => 
  
fetch("/api/v2/confirmations/"+pass+"/C1", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get confirmations by Event
const getConfirmationsByEventAPI = async (pass, eventId) => 
  
fetch("/api/v2/confirmations/"+pass+"/C2/"+eventId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// create confirmation event by Admin
const createConfirmationEventAPI = async (pass, eventDate) => 
  
fetch("/api/v2/confirmations/"+pass+"/C6/"+eventDate, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add comment by admin
const addCommentByAdminAPI = async (pass, id, comment) => 
  
fetch("/api/v2/confirmations/"+pass+"/C7/"+id+"/"+comment, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



// pass state variable and the method to update state variable
export default function Confirmations() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [selectedStatus, setselectedStatus] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [selectedConfirmation,  setSelectedConfirmation] = useState('');
    const [selectedConfirmationForDelete,  setSelectedConfirmationForDelete] = useState('');
    const [offset, setOffset] = useState(0);
    const [updatingInvoice, setUpdatingInvoice] = useState(false);
    const [deletingInvoice, setDeletingInvoice] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    const [completed, setCompleted] = useState(false);
    const [searching, setSearching] = useState(true);
    const [searchingOther, setOtherSearching] = useState(true);
    const [confirmationCreationLoading, setConfirmationCreationLoading] = useState(false);
    const [loadingIds, setLoadingIds] = useState(new Set());
    const [file, setFile] = useState(null); 
    const [addingComment, setAddingComment] = useState(false);
    const [createProgress, setCreatingInvoice] = useState(false);
    
    // get all sales people for changing the value
    const [allSalesPeople, setAllSalesPeople] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [allConfirmationEvents, setAllConfirmationEvents] = useState([]);
    const [allConfirmationEventsFiltered, setAllConfirmationEventsFiltered] = useState([]);
    const [allConfirmations, setAllConfirmations] = useState([]);
    const [allConfirmationEventsCount, setAllConfirmationEventsCount] = useState(0);

    // State variables for each input field
    const [selectedTotalAmount, setSelectedTotalAmount] = useState(0);
    const [selectedAmountPaid, setSelectedAmountPaid] = useState(0);
    const [selectedPendingAmount, setSelectedPendingAmount] = useState(0);

    // State variables for each input field for create confirmation
    const [inputInvoiceNo, setInputInvoiceNo] = useState('');
    const [inputInvoiceDate, setInputInvoiceDate] = useState('');
    const [inputInvoiceDealer, setInputInvoiceDealer] = useState('');
    const [inputInvoiceTotalAmount, setInputInvoiceTotalAmount] = useState(0);
    const [inputInvoiceAmountPaid, setInputInvoiceAmountPaid] = useState(0);
    const [inputInvoiceBoxes, setInputInvoiceBoxes] = useState(0);
    
    
    // const [currentStatus, setCurrentStatus] = useState('All');
    //create new date object
    const today = new dayjs();
    
    const [showBlockOuting, setShowBlockOuting] = useState(false);
    
    
    ///////////////////////////////
    // IMPORTANT
    ///////////////////////////////
    
    // get the user and fire the data fetch
    useEffect(()=>{
        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                // setRole(obj.role);
                
                // if(!completed){
                //     getAllInvoices(initialDatesValues.from,initialDatesValues.to);
                // }
                // else {
                //     console.log("DONE READING");
                // }
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[]);


    useEffect(() => {
        if (user && user.id && !completed) {
            getAllConfirmations();
        }
    }, [user, completed]);

    // Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal',  // Use 'currency' for currency formatting
        minimumFractionDigits: 2,  // Minimum number of digits after the decimal
        maximumFractionDigits: 2   // Maximum number of digits after the decimal
    });


    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllConfirmations(){
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getAllConfirmationEventsAPI(process.env.NEXT_PUBLIC_API_PASS) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){

                    if(allConfirmationEvents.length > 0){
                        setAllConfirmationEvents(allConfirmationEvents.push(queryResult.data));
                        setAllConfirmationEventsFiltered(allConfirmationEvents.push(queryResult.data));
                        setAllConfirmationEventsCount(queryResult.total);

                        // setSelectedEvent(queryResult.data[0]);
                        // getMatchingConfirmations(queryResult.data[0].id);
                    }
                    else{
                        
                        setAllConfirmationEvents(queryResult.data);
                        setAllConfirmationEventsFiltered(queryResult.data);
                        setAllConfirmationEventsCount(queryResult.total);
                    }

                    setSearching(false);
                setCompleted(false);
                 

                        setSelectedEvent(queryResult.data[0]);
                        getMatchingConfirmations(queryResult.data[0].id);
                    
                    
                }
                else {
                     
                }

                setSearching(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401) {
                
                setSearching(false);
                 
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllConfirmationEvents([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                setSearching(false);
                 
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                
                setSearching(false);
                 
                setCompleted(true);
            }
        }
        catch (e){
            console.log(e);
            toast({
                description: "Issue loading. Please refresh or try again later!",
              })
            // setTimeout(function(){
            //     setResultType('');
            //     setResultMessage('');
            // }, 3000);
        }
}

    async function getMatchingConfirmations(eventId){
        
        
        setOtherSearching(false);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getConfirmationsByEventAPI(process.env.NEXT_PUBLIC_API_PASS, eventId) 
            const queryResult = await result.json() // get data
console.log(queryResult);

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    setAllConfirmations(queryResult.data);
                }
                

                setOtherSearching(true);
            }
            else if(queryResult.status == 401) {
                
                setOtherSearching(true);
                 
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllConfirmationEvents([]);
                toast({
                    description: "No more confirmations",
                  })
                  
                  setOtherSearching(true);
                 
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                
                setOtherSearching(true);
                 
                setCompleted(true);
            }
        }
        catch (e){
            console.log(e);
            
            // show and hide message
            // setResultType('error');
            // setResultMessage('Issue loading. Please refresh or try again later!');
            toast({
                description: "Issue loading. Please refresh or try again later!",
              })
            // setTimeout(function(){
            //     setResultType('');
            //     setResultMessage('');
            // }, 3000);
        }
}


    async function createConfirmation(){
        
        
        setConfirmationCreationLoading(true);
        // setOffset(offset+0); // update the offset for every call
        var eventInstance = dayjs(today).format('YYYY-MM-DD hh:mm:ss');
        try {    
            const result  = await createConfirmationEventAPI(process.env.NEXT_PUBLIC_API_PASS, eventInstance) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                setConfirmationCreationLoading(false);

                const newEvent = { id: queryResult.id, eventDate: eventInstance };
                setAllConfirmationEvents([...allConfirmationEvents, newEvent]);

            }
            else {
                
                setConfirmationCreationLoading(false);
            }
        }
        catch (e){
            console.log(e);
            
            // show and hide message
            // setResultType('error');
            // setResultMessage('Issue loading. Please refresh or try again later!');
            toast({
                description: "Issue loading. Please refresh or try again later!",
              })
            // setTimeout(function(){
            //     setResultType('');
            //     setResultMessage('');
            // }, 3000);
        }
}
    
    // add comment by admin
    async function addComment(id, comment){
        
        setAddingComment(true);
        
        try {    
            const result  = await addCommentByAdminAPI(process.env.NEXT_PUBLIC_API_PASS, id, comment) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                setAddingComment(false);
                const updatedConfirmations = allConfirmations.map((confirmation) => {
                    if (confirmation.id === id) {
                        return { ...confirmation, comment: comment };
                    }
                    return confirmation;
                });
                setAllConfirmations(updatedConfirmations);

                setSelectedConfirmation({ ...selectedConfirmation, comment: '' });
                
            }
            else {
                
                setAddingComment(false);
            }
        }
        catch (e){
            console.log(e);
            
            // show and hide message
            // setResultType('error');
            // setResultMessage('Issue loading. Please refresh or try again later!');
            toast({
                description: "Issue loading. Please refresh or try again later!",
              })
            // setTimeout(function(){
            //     setResultType('');
            //     setResultMessage('');
            // }, 3000);
        }
}
    
    // Filter the dealers list by states
    async function filterByStates(e){
        
        setselectedStatus(e);
        if(e == 'All'){
            setAllConfirmationEventsFiltered(allConfirmationEvents);
        }
        else {
            const filteredDealers = allConfirmationEvents.filter(dealer => dealer.status === e);
            setAllConfirmationEventsFiltered(filteredDealers);
        }
    }
    
    
  // Function to handle search input change
  const handleSearchChange = (e) => {
    if(e.target.value.length == 0){
        setSearchQuery('');
        setAllConfirmationEvents(allConfirmationEvents);
        setAllConfirmationEventsFiltered(allConfirmationEvents);
    }
    else {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter the confirmation based on the search query
        const filtered = allConfirmationEvents.filter(confirmation => confirmation.name.toLowerCase().includes(query) );

        if(filtered.length > 0){
            // console.log('OK');
            setAllConfirmationEventsFiltered(filtered); // Update the filtered dealers list
        }
        else {
            // console.log('NOT OK');
            getMatchingAllInvoices(e.target.value.toLowerCase());
        }
    }
  };

  // Function to handle row click and open the sheet
  const handleRowClick = (confirmation) => {

    // setSelectedTotalAmount(confirmation.totalAmount);
    // setSelectedAmountPaid(confirmation.amountPaid);
    // setSelectedPendingAmount(confirmation.pending);
     setSelectedConfirmation(confirmation); // Set the selected dealer
    
  };

  // Function to handle row click and open the sheet
  const handleDeleteClick = (confirmation) => {

    //  setSelectedConfirmation(confirmation); // Set the selected dealer
     setSelectedConfirmationForDelete(confirmation); // Set the selected dealer
    setIsDialogOpen(true); // Open the sheet
    
  };


  // Change amount changes
  const handleTotalAmountChange = (e) => {

    if(e.target.value.length == 0){
        setSelectedAmountPaid(selectedConfirmation.totalAmount);
        setSelectedPendingAmount(Math.abs(selectedConfirmation.amountPaid-selectedAmountPaid));
    }
    else {
        setSelectedTotalAmount(parseFloat(e.target.value) || 0)
        setSelectedPendingAmount(Math.abs(selectedAmountPaid-parseFloat(e.target.value)));

    }
  };
  
  // Change amount changes
  const handleAmountPaidChange = (e) => {

    if(e.target.value.length == 0){
        setSelectedAmountPaid(selectedConfirmation.amountPaid);
        setSelectedPendingAmount(Math.abs(selectedAmountPaid-selectedConfirmation.amountPaid));
    }
    else if(parseFloat(e.target.value) > selectedTotalAmount ){
        toast({description: "Amount Paid is more than the confirmation amount",});
    }
    else {
        setSelectedAmountPaid(parseFloat(e.target.value) || 0)
        setSelectedPendingAmount(Math.abs(selectedTotalAmount-parseFloat(e.target.value)));

    }
  };
  function validateInvoiceNo(confirmationNo) {
    const regex = /^[A-Za-z0-9]{3}-..-..\/\d{4}$/;
    return regex.test(confirmationNo);
  }
  
  
  // Function to handle closing the sheet and resetting selectedDealer
  const handleSheetClose = () => {
    
    // reset the numbers to 0
     setSelectedConfirmation('');
    setSelectedTotalAmount(0);
    setSelectedAmountPaid(0);
    setSelectedPendingAmount(0);
    setUpdatingInvoice(false);
    
    // setRemainingCredit(0);
    // setTotalCredit(0);
    // setSelectedDealer(null); // Reset the selected dealer
  };
  
  function navigateToCreate(){
    // biscuits.set('selectedTab', 'Dashboard', {path: '/', expires: new Date(Date.now() + 10800000)})
    router.push('/confirmations/create')
  }



  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Invoices</h2>
              
              
                
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="text-white bg-blue-600"><CheckCircle className='font-bold text-lg'/>&nbsp; Request Confirmation</Button>
                    </SheetTrigger>
                    <SheetContent className='overflow-y-scroll'>
                        <SheetHeader>
                        <SheetTitle>Create Invoice</SheetTitle>
                        <SheetDescription>
                            Make sure you enter all details correctly. Click Create now to create.
                        </SheetDescription>
                        </SheetHeader>
                        
                    
                        
                        <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={createConfirmation}>Create now</Button>
                        </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                {confirmationCreationLoading ? <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Creating ...</CardTitle>
                        <CardDescription>Do not close</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Skeleton className="h-4 w-[100px] h-[20px]" />
                            </div>
                            
                        </div>
                        </form>
                    </CardContent>
                </Card> : null}

              <Toaster />
          </div>      

            {/* <div style={{width:'100%',display:'flex', flexDirection:'row',justifyContent:'space-between'}}>
                <div className={styles.horizontalsection}>
                <Button  onClick={getDataData}>
                  <Plus className="mr-2 h-4 w-4" /> Declare outing
                </Button>
                    <div className={`${styles.primarybtn} `} style={{display:'flex', flexDirection:'row', width:'fit-content', cursor:'pointer', gap:'4px'}} onClick={toggleShowBlockOuting}> 
                        <Plus />
                        <p className={`${inter.className}`}>Declare outing</p>
                    </div> */}
                    {/* <BlockDatesBtn titleDialog={false} /> */}
                    {/* <OutingRequest /> */}
                    {/* <div className={`${styles.overlayBackground} ${showBlockOuting ? styles.hideshowdivshow : styles.hideshowdiv}`}>
                        <BlockDatesBtn toggleShowBlockOuting={toggleShowBlockOuting} titleDialog={false} /> 
                    </div>
                </div>
               
            </div> */}
          
           
          
         
    <div className={styles.verticalsection} style={{height:'80vh', width:'100%',gap:'8px'}}>

{!searching ?
<div className="mx-auto" style={{width:'100%',height:'100%'}}>
{/* <div className="container mx-auto py-10"> */}

<div className='flex flex-row justify-between items-center mb-2'>
    <div className='pb-2 text-slate-700 font-semibold'>{allConfirmations.length} Confirmations in total</div>
    
    {/* {(selectedStatus == 'All') ?
    <div className='pb-2 text-slate-700 font-semibold'></div>
    : <div className='pb-2 text-green-700 font-semibold text-xs'>{allConfirmationEvents.length} Invoices with {selectedStatus} status</div>
    // : <div className='pb-2 text-green-700 font-semibold'>{allConfirmationEventsFiltered.length} Dealers in {selectedStatus.split('-')[1]}</div>
    } */}
    </div>

    {/* <div className="flex flex-row gap-4 w-full">
        {Array.from(new Set(allConfirmationEvents.map(confirmation => confirmation.status))).map((status) => (
            <Card key={status} className="w-full p-2">
                <CardHeader className="p-2">
                    <CardTitle className='text-md'>{status}</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <p className="text-2xl font-bold">
                        {allConfirmationEvents.filter(confirmation => confirmation.status === status).length}
                    </p>
                    {(status !='Paid') ?
                    <p className="text-sm text-red-500 font-semibold">
                        Total Pending: ₹{formatter.format(allConfirmationEvents.filter(confirmation => confirmation.status === status).reduce((acc, confirmation) => acc + confirmation.pending, 0))}
                    </p> :
                    <p className="text-sm text-blue-500">
                       
                    </p>}
                </CardContent>
            </Card>
        ))}
    </div> */}

    {(allConfirmationEvents.length > 0) ?
    <div className='flex flex-row justify-between items-center'>
        <div className='flex flex-row gap-4 items-center'>
            <Input
                type="text"
                placeholder="Search Dealer"
                value={searchQuery}
                onChange={handleSearchChange}
                className="my-4 w-[300px]" // You can adjust width and margin as needed
        />

        {(searchQuery.length > 0) ? <div className='pb-2 text-slate-600'>{allConfirmationEvents.length} matching confirmations</div> : ''}

        {!searchingOther ?
        <div className="flex flex-row m-12">    
            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
            <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
        </div>
        : ''}
        </div>

        
        <div className='flex flex-row gap-4 items-center'>
        {allConfirmationEvents.length == 0 ?
            <div className="flex flex-row m-12">    
            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
            <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
            </div>
            :
            <Select defaultValue={selectedStatus} onValueChange={(e)=>filterByStates(e)} >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectItem key={'All'} value={'All'}>All</SelectItem>
                {Array.from(new Set(allConfirmationEvents.map(event => event.eventDate))).map((eventDate, index) => (
                <SelectItem key={index} value={eventDate} >{dayjs(eventDate).format("MMM-YYYY")}</SelectItem>))}
                </SelectGroup>
            </SelectContent>
            </Select>
        }
        
        <Button variant="outline" > <ArrowDown className="mr-2 h-4 w-4"/> Download</Button>
        </div>
        
        </div>
    : ''    
    }

    <Card>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Dealer</TableHead>
            <TableHead>Dealer Amount</TableHead>
            <TableHead>Anjani Amount</TableHead>
            <TableHead>Confirmation Date</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Attachment</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            
            {(allConfirmations==null) ? '' :
            allConfirmations.map((row) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row)} className="cursor-pointer">
                <TableCell>
                <div className='flex flex-row gap-2 items-center text-blue-600 font-semibold py-4 w-max'>
                    {row.name} 
                </div>
                </TableCell>
                <TableCell>
                <div className="w-fit">
                    {row.dealerAmount} 
                </div>
                </TableCell>
                <TableCell>
                <div className="w-fit">
                    {row.anjaniAmount} 
                </div>
                </TableCell>
                <TableCell>{dayjs(row.confirmationOn).format("DD/MM/YY")}</TableCell>
                <TableCell >{row.response}</TableCell>
                <TableCell>{row.comment}</TableCell>
                <TableCell>
                <img 
                    src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${row.media}?alt=media`} 
                    alt="Attachment" 
                    width={85} 
                    height={70} 
                    className="mt-2 h-full object-cover rounded-lg" 
                />
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </Card>

    <Sheet open={!!selectedConfirmation} onOpenChange={handleSheetClose}>
        <SheetContent className='overflow-auto'>
        <SheetHeader>
            <SheetTitle>Balance Confirmation Details</SheetTitle>
        </SheetHeader>
        {selectedConfirmation && (

            <div className="pt-4">
                <div className="mb-4">
                    <label className="block font-semibold">Dealer:</label>
                    <p>{selectedConfirmation.name}</p>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Dealer Amount:</label>
                    <p>{selectedConfirmation.dealerAmount}</p>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Anjani Amount:</label>
                    <p>{selectedConfirmation.anjaniAmount}</p>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Confirmation Date:</label>
                    <p>{dayjs(selectedConfirmation.confirmationOn).format("DD/MM/YY")}</p>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Response:</label>
                    <p>{selectedConfirmation.response}</p>
                </div>
                <div className="mb-4">
                    <label className="block font-semibold">Reason from dealer:</label>
                    <p>{selectedConfirmation.responseReason}</p>
                </div>
                {/* <div className="mb-4">
                    <label className="block font-semibold">Comment from Anjanitek:</label>
                    <p>{selectedConfirmation.comment}</p>
                </div> */}
                {selectedConfirmation.comment && (
                    <div className="mb-4">
                    <label className="block font-semibold">Comment from Anjanitek:</label>
                    <p>{selectedConfirmation.comment}</p>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block font-semibold">Attachment:</label>
                    <img
                    src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${selectedConfirmation.media}?alt=media`}
                    alt="Attachment"
                    width={150}
                    height={120}
                    className="mt-2 h-full object-cover rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Add Comment:</label>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        rows="4"
                        placeholder="Write your comment here..."
                        // value={''}
                        value={selectedConfirmation.comment || ''}
                        onChange={(e) => {
                            const updatedInvoice = { ...selectedConfirmation, comment: e.target.value };
                             setSelectedConfirmation(updatedInvoice);
                        }}
                    ></textarea>
                    {!addingComment ? (
                        <Button
                            className="mt-2"
                            onClick={() => {
                                if (selectedConfirmation.comment) {
                                    addComment(selectedConfirmation.id, selectedConfirmation.comment);
                                } else {
                                    toast({ description: "Please write a comment before sending." });
                                }
                            }}
                        >
                            Send
                        </Button>
                    ) : (
                        <div className="mt-2 flex items-center gap-2">
                            <SpinnerGap className="animate-spin" />
                            <span>Submitting...</span>
                        </div>
                    )}
                </div>
            </div>

            // <div className="p-4">
            // <p><strong>Dealer:</strong> {selectedConfirmation.dealer}</p>
            // <p><strong>Dealer Amount:</strong> {selectedConfirmation.dealerAmount}</p>
            // <p><strong>Anjani Amount:</strong> {selectedConfirmation.anjaniAmount}</p>
            // <p><strong>Confirmation Date:</strong> {dayjs(selectedConfirmation.confirmationOn).format("DD/MM/YY")}</p>
            // <p><strong>Response:</strong> {selectedConfirmation.response}</p>
            // <p><strong>Comment:</strong> {selectedConfirmation.comment}</p>
            // <img 
            //     src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${selectedConfirmation.media}?alt=media`} 
            //     alt="Attachment" 
            //     width={150} 
            //     height={120} 
            //     className="mt-2 h-full object-cover rounded-lg" 
            // />
            // </div>
        )}
        </SheetContent>
    </Sheet>
                            {/* {(row.confirmationType == 'ATL') ?
                            <div className="text-xs font-bold text-rose-500 px-1.5 w-fit tracking-wider">
                                ATL
                            </div>
                            : <div className="text-xs font-bold text-red-700 px-1.5 w-fit tracking-wider">
                                VCL
                            </div>
                            }
                            
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="w-fit">
                            {row.dealerAmount} 
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="w-fit">
                            {row.anjaniAmount} 
                        </div>
                    </TableCell>
                    <TableCell>{dayjs(row.confirmationOn).format("DD/MM/YY")}</TableCell>
                    
                    <TableCell>{row.response}</TableCell>
                    <TableCell>{row.comment}</TableCell>
                    <TableCell>
                        <img 
                            src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${row.media}?alt=media`} 
                            alt="Attachment" 
                            width={85} 
                            height={70} 
                            className="mt-2 h-full object-cover rounded-lg" 
                        />
                        
                    </TableCell>
                    
                    
                </TableRow>
            ))}
        </TableBody>
    </Table>
</Card> */}

{/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent>
    <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
        Are you sure you want to delete this confirmation? This action cannot be undone.
        </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
        Cancel
        </Button>
        <Button variant="destructive" onClick={()=>deleteSelectedInvoice()}>
        Delete
        </Button>
    </DialogFooter>
    </DialogContent>
</Dialog> */}


      {/* <DataTable data={allConfirmationEvents} dataOffset={offset} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/> */}
      {/* <DataTable columns={columns} data={allConfirmationEvents} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}
      
    </div>
:
<Skeleton className="h-4 w-[500px] h-[120px]" >
    <div className="flex flex-row m-12">    
        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
        <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
    </div>
</Skeleton> 
    


}

    {/* : null} */}



 {/* <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable data={allConfirmationEvents} columns={columns} />
      </div> 

                 <div className={styles.carddatasection} key={12345} style={{height:'100%',overflow:'scroll'}}>
                       
                    <div className={styles.verticalsection} >
                        <p className={`${inter.className} ${styles.text3_heading}`}>Students</p>
                        <div className={styles.horizontalsection}>
                            <p className={`${inter.className} ${styles.text3_heading}`}>Total:</p>
                            <div className={`${inter.className}`} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px'}}>
                                
                                {searching ? <div className={styles.horizontalsection}>
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                                </div> : ''}
                                <h1>{studentsInCampus}</h1>
                            </div>
                            
                            <div className={`${inter.className}`} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px'}}>
                                
                                <p className={`${inter.className} ${styles.text3_heading}`}>Registered:</p>
                                {searching ? <div className={styles.horizontalsection}>
                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} />
                                    <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                                </div> : ''}
                                <h1>{totalStudents}</h1>
                            </div>
                        </div>
                      </div>
                <div>
                    
                </div>
            </div>  */}
        {/* </div> */}
               
                
        </div>
    
    </div>
    
    
  );
}

