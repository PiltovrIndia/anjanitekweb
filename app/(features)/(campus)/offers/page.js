'use client'

import { Inter } from 'next/font/google'
import { SpinnerGap, Receipt, ArrowDown, CheckCircle, Tag, PhoneCall, X } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import { getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
// const storage = getStorage();
import firebase from '../../../firebase';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from '@/app/components/ui/select'
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"
import imageCompression from 'browser-image-compression';

import { ref } from "firebase/storage";
const storage = getStorage(firebase, "gs://anjanitek-communications.firebasestorage.app");



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


// get all offer events so far
const getAllOfferEventsAPI = async (pass) => 
  
fetch("/api/v2/offers/"+pass+"/1", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get responses by Event
const getResponsesByEventAPI = async (pass, offerId) => 
  
fetch("/api/v2/offers/"+pass+"/4/"+offerId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// create event
const createOfferEventAPI = async (pass, title, description, media, createdBy) => 
  
fetch("/api/v2/offers/"+pass+"/0/"+title+"/"+description+"/"+media+"/"+createdBy, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// close event
const closeEventAPI = async (pass, offerId) => 
  
fetch("/api/v2/offers/"+pass+"/5/"+offerId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// pass state variable and the method to update state variable
export default function Offers() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [selectedStatus, setselectedStatus] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [selectedOffer,  setSelectedOffer] = useState('');
    const [eventTitle,  setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventMedia, setEventMedia] = useState('-');
    const [compressedFileForUpload, setCompressedFileForUpload] = useState();
    const [imageError, setImageError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);


    const [completed, setCompleted] = useState(false);
    const [searching, setSearching] = useState(true);
    const [searchingOther, setOtherSearching] = useState(true);
    const [offerCreationLoading, setOfferCreationLoading] = useState(false);
    const [offerCloseLoading, setOfferCloseLoading] = useState(false);
    const [file, setFile] = useState(null); 
    const [addingComment, setAddingComment] = useState(false);
    const [createProgress, setCreatingInvoice] = useState(false);
    
    // get all sales people for changing the value
    const [allSalesPeople, setAllSalesPeople] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [allOfferEvents, setAllOfferEvents] = useState([]);
    const [allOfferEventsFiltered, setAllOfferEventsFiltered] = useState([]);
    const [allOfferResponses, setAllOfferResponses] = useState([]);
    const [allOfferEventsCount, setAllOfferEventsCount] = useState(0);

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
            getAllOffers();
        }
    }, [user, completed]);


    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllOffers(){
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getAllOfferEventsAPI(process.env.NEXT_PUBLIC_API_PASS) 
            const queryResult = await result.json() // get data

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){

                    if(allOfferEvents.length > 0){
                        setAllOfferEvents(allOfferEvents.push(queryResult.data));
                        setAllOfferEventsFiltered(allOfferEvents.push(queryResult.data));
                        setAllOfferEventsCount(queryResult.total);

                        // setSelectedEvent(queryResult.data[0]);
                        // getMatchingConfirmations(queryResult.data[0].id);
                    }
                    else{
                        
                        setAllOfferEvents(queryResult.data);
                        setAllOfferEventsFiltered(queryResult.data);
                        setAllOfferEventsCount(queryResult.total);
                    }

                    setSearching(false);
                setCompleted(false);
                 

                        setSelectedEvent(queryResult.data[0]);
                        // getMatchingConfirmations(queryResult.data[0].id);
                    
                    
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
                setAllOfferEvents([]);
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

    async function getEventResponses(eventId){
        
        
        setOtherSearching(false);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getResponsesByEventAPI(process.env.NEXT_PUBLIC_API_PASS, eventId) 
            const queryResult = await result.json() // get data
            console.log(queryResult);

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    setAllOfferResponses(queryResult.data);
                }
                else {
                    setAllOfferResponses([]);
                }
                

                setOtherSearching(true);
            }
            else  {
                
                setOtherSearching(true);
                 
                setCompleted(true);

                setAllOfferResponses([]);
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


    async function createOfferEvent(){
        
        
        setOfferCreationLoading(true);
        // setOffset(offset+0); // update the offset for every call
        var eventInstance = dayjs(today).format('YYYY-MM-DD hh:mm:ss');
        try {    
            console.log("/api/v2/offers/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+eventTitle+"/"+eventDescription+"/"+eventMedia+"/"+ JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id);
            
            const result  = await createOfferEventAPI(process.env.NEXT_PUBLIC_API_PASS, eventTitle, eventDescription, eventMedia, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id) 
            const queryResult = await result.json() // get data
            console.log(queryResult);
            

            // check for the status
            if(queryResult.status == 200){

                setOfferCreationLoading(false);
                const newOfferEvent = {
                    offerId: queryResult.data,
                    title: eventTitle,
                    description: eventDescription,
                    media: '-',
                    createdBy: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                    createdOn: eventInstance,
                    responses: 0,
                };
                setAllOfferEvents([...allOfferEvents, newOfferEvent]);

                setImageError('');
                setUploadProgress(0);
                setEventTitle('');
                setEventDescription('');
                setEventMedia('');

            }
            else {
                setOfferCreationLoading(false);
                
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
    
    async function closeEvent(offerId){
        
        
        setOfferCloseLoading(true);
        try {    
            // console.log("/api/v2/offers/"+process.env.NEXT_PUBLIC_API_PASS+"/5/"+offerId);
            
            const result  = await closeEventAPI(process.env.NEXT_PUBLIC_API_PASS, offerId) 
            const queryResult = await result.json() // get data
            console.log(queryResult);
            

            // check for the status
            if(queryResult.status == 200){

                setAllOfferEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event.offerId === offerId ? { ...event, isOpen: 0 } : event
                    )
                );

                setOfferCloseLoading(false);
            }
            else {
                setOfferCloseLoading(false);
                
            }
            toast({
                description: "Offer closed!",
              })
        }
        catch (e){
            console.log(e);
            toast({
                description: "Issue loading. Please refresh or try again later!",
              })
        }
}
    
    
    // Filter the dealers list by states
    async function filterByStates(e){
        
        setselectedStatus(e);
        if(e == 'All'){
            setAllOfferEventsFiltered(allOfferEvents);
        }
        else {
            const filteredDealers = allOfferEvents.filter(dealer => dealer.status === e);
            setAllOfferEventsFiltered(filteredDealers);
        }
    }
    
    
  // Function to handle search input change
  const handleSearchChange = (e) => {
    if(e.target.value.length == 0){
        setSearchQuery('');
        setAllOfferEvents(allOfferEvents);
        setAllOfferEventsFiltered(allOfferEvents);
    }
    else {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter the confirmation based on the search query
        const filtered = allOfferEvents.filter(confirmation => confirmation.title.toLowerCase().includes(query) );

        if(filtered.length > 0){
            // console.log('OK');
            setAllOfferEventsFiltered(filtered); // Update the filtered dealers list
        }
        else {
            // console.log('NOT OK');
            getMatchingAllInvoices(e.target.value.toLowerCase());
        }
    }
  };

  // Function to handle row click and open the sheet
  const handleRowClick = (confirmation) => {

    getEventResponses(confirmation.offerId);
    
    
    // setSelectedTotalAmount(confirmation.totalAmount);
    // setSelectedAmountPaid(confirmation.amountPaid);
    // setSelectedPendingAmount(confirmation.pending);
     setSelectedOffer(confirmation); // Set the selected dealer


    
  };

  // Function to handle row click and open the sheet
  const handleDeleteClick = (confirmation) => {

    //  setSelectedOffer(confirmation); // Set the selected dealer
     setSelectedOfferForDelete(confirmation); // Set the selected dealer
    setIsDialogOpen(true); // Open the sheet
    
  };


  
  
  // Function to handle closing the sheet and resetting selectedDealer
  const handleSheetClose = () => {
    
    // reset the numbers to 0
     setSelectedOffer('');
    setSelectedTotalAmount(0);
    setSelectedAmountPaid(0);
    setSelectedPendingAmount(0);
    
    // setRemainingCredit(0);
    // setTotalCredit(0);
    // setSelectedDealer(null); // Reset the selected dealer
  };
  

  const compressImageAndUpload = async (file) => {
    const options = {
        maxSizeMB: 0.049, // Slightly less than 50KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.9, // Start with high quality
    }

    try {
    let compressedFile = await imageCompression(file, options)

    // If the file is still too large, gradually reduce quality
    let currentQuality = 0.9
    while (compressedFile.size > 50 * 1024 && currentQuality > 0.5) {
        currentQuality -= 0.1
        options.initialQuality = currentQuality
        compressedFile = await imageCompression(file, options)
    }

    if (compressedFile.size <= 50 * 1024) {

        // compressedFile.name = 'ss333_1.jpeg';
        // compressedFile.name = name;

        // console.log(compressedFile.name);

        setCompressedFileForUpload(compressedFile)

        const metadata = {
            contentType: 'image/webp'
        };
        
        const storageRef = ref(storage, `uploads/offer_${dayjs(today).format('DD-MM-YYYY-hh-mm')}.jpeg`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);
        setUploadProgress(1);
        uploadTask.on('state_changed',
            (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(snapshot.bytesTransferred);
            
            setUploadProgress(progress);
            
            switch (snapshot.state) {
                case 'paused':
                
                break;
                case 'running':
                
                break;
            }
        }, 
        (error) => {
            console.log(error.message);
        switch (error.code) {
            
            case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
            case 'storage/canceled':
            // User canceled the upload
            break;

            // ...

            case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
        }, 
        () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setUploadProgress(100);
                console.log('File available at', downloadURL);
                setEventMedia(`offer_${dayjs(today).format('DD-MM-YYYY-hh-mm')}.jpeg`);
            });
        }
        );
    } else {
        setImageError("Image size if larger than expected")
        // console.log("Unable to compress image below 50KB while maintaining acceptable quality");
        
    }
    } catch (error) {
        setImageError("Error compressing image, upload another one")
        // console.log("Error compressing image:"+error.message)
    }
}



  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-xl font-semibold mr-4">Invoices</h2>
              
              
            
            <Sheet>
                <SheetTrigger asChild>
                <Button className="text-white bg-blue-600"><Tag className='font-bold text-lg'/>&nbsp; Create Offer</Button>
                </SheetTrigger>
                <SheetContent className='overflow-y-scroll'>
                <SheetHeader>
                <SheetTitle>Create Offer</SheetTitle>
                <SheetDescription>
                    Make sure you enter all details correctly. Click Create.
                </SheetDescription>
                </SheetHeader>

                <div className="grid w-full items-center gap-4 mt-8">
                    <div className="flex flex-col space-y-1.5">
                        
                    <label htmlFor="title" className="text-sm font-medium leading-none">
                        Title
                    </label>
                    <Input
                        id="title"
                        type="text"
                        placeholder="Enter title"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                    <label htmlFor="description" className="text-sm font-medium leading-none">
                        Description
                    </label>
                    <Input
                        id="description"
                        type="text"
                        placeholder="Enter description"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                    <label htmlFor="media" className="text-sm font-medium leading-none">
                        Image Upload
                    </label>

                    <Input
                        id="media"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        compressImageAndUpload(selectedFile);
                        }}
                    />

                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    </div>
                </div>
                
                {(imageError.length > 0) ?
                <p className={`${inter.className} ${styles.text3}`}>{imageError}</p> 
                : <p></p> 
                }
                
                <SheetFooter className="mt-8">
                <SheetClose asChild>
                {(uploadProgress > 0 && uploadProgress < 100) ?
                        <div className="flex flex-row m-12">    
                            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                            <p className={`${inter.className} ${styles.text3}`}>Uploading ...</p> 
                        </div>
                        : 
                        offerCreationLoading ?
                        <div className="flex flex-row m-12">    
                            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                            <p className={`${inter.className} ${styles.text3}`}>Creating offer ...</p> 
                        </div>
                        :
                        <Button type="submit" onClick={createOfferEvent}>Create</Button>
                    }
                </SheetClose>
                </SheetFooter>
                </SheetContent>
            </Sheet>

            {offerCreationLoading ? <Card className="w-[350px]">
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
    <div className='pb-2 text-slate-700 font-semibold'>{allOfferEvents.filter(event => event.isOpen === 1).length} offers in total</div>
    
    {/* {(selectedStatus == 'All') ?
    <div className='pb-2 text-slate-700 font-semibold'></div>
    : <div className='pb-2 text-green-700 font-semibold text-xs'>{allOfferEvents.length} Invoices with {selectedStatus} status</div>
    // : <div className='pb-2 text-green-700 font-semibold'>{allOfferEventsFiltered.length} Dealers in {selectedStatus.split('-')[1]}</div>
    } */}
    </div>

    {/* <div className="flex flex-row gap-4 w-full">
        {Array.from(new Set(allOfferEvents.map(confirmation => confirmation.status))).map((status) => (
            <Card key={status} className="w-full p-2">
                <CardHeader className="p-2">
                    <CardTitle className='text-md'>{status}</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <p className="text-2xl font-bold">
                        {allOfferEvents.filter(confirmation => confirmation.status === status).length}
                    </p>
                    {(status !='Paid') ?
                    <p className="text-sm text-red-500 font-semibold">
                        Total Pending: ₹{formatter.format(allOfferEvents.filter(confirmation => confirmation.status === status).reduce((acc, confirmation) => acc + confirmation.pending, 0))}
                    </p> :
                    <p className="text-sm text-blue-500">
                       
                    </p>}
                </CardContent>
            </Card>
        ))}
    </div> */}

    {(allOfferEvents.length > 0) ?
    <div className='flex flex-row justify-between items-center'>
        <div className='flex flex-row gap-4 items-center'>
            <Input
                type="text"
                placeholder="Search Title"
                value={searchQuery}
                onChange={handleSearchChange}
                className="my-4 w-[300px]" // You can adjust width and margin as needed
        />

        {(searchQuery.length > 0) ? <div className='pb-2 text-slate-600'>{allOfferEvents.length} matching confirmations</div> : ''}

        {!searchingOther ?
        <div className="flex flex-row m-12">    
            <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
            <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
        </div>
        : ''}
        </div>

        
        <div className='flex flex-row gap-4 items-center'>
        {/* {allOfferEvents.length == 0 ?
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
                {Array.from(new Set(allOfferEvents.map(event => event.eventDate))).map((eventDate, index) => (
                <SelectItem key={index} value={eventDate} >{dayjs(eventDate).format("MMM-YYYY")}</SelectItem>))}
                </SelectGroup>
            </SelectContent>
            </Select>
        } */}
        
        {/* <Button variant="outline" > <ArrowDown className="mr-2 h-4 w-4"/> Download</Button> */}
        </div>
        
        </div>
    : ''    
    }

    <Card>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Action</TableHead>
            {/* <TableHead>Comment</TableHead>
            <TableHead>Attachment</TableHead> */}
            </TableRow>
        </TableHeader>
        <TableBody>
            
            {(allOfferEvents==null) ? '' :
            allOfferEvents.map((row) => (
            <TableRow key={row.offerId}>
                
                <TableCell onClick={() => handleRowClick(row)} className="cursor-pointer">
                <div className="w-fit flex flex-row gap-1 items-center">
                    <span className="font-semibold text-slate-800 hover:text-blue-600">{row.title} </span>
                    {(row.isOpen == 1) ?
                    <span className='text-blue-600 text-xs font-normal w-max bg-blue-100 rounded-xl px-1.5'>
                        Active
                    </span>
                    :
                    <span className='text-grey-400 text-xs font-normal w-max bg-gray-200 rounded-xl px-1.5'>
                        Closed
                    </span>
                    }
                </div>
                </TableCell>
                <TableCell>
                <div className="w-fit">
                    {row.description} 
                </div>
                </TableCell>
                <TableCell>{dayjs(row.createdOn).format("DD/MM/YY")}</TableCell>
                <TableCell >{row.responses}</TableCell>
                {/* <TableCell>{row.comment}</TableCell> */}
                <TableCell>
                {row.media ? (
                        <img 
                            src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/uploads%2F${row.media}?alt=media`} 
                            alt="Attachment" 
                            width={85} 
                            height={70} 
                            className="mt-2 h-full object-cover rounded-lg" 
                        />
                    ) : (
                        <span>-</span>
                    )}
                </TableCell>
                <TableCell>
                    <Button variant='ghost' className="mx-1 px-2 text-red-600" onClick={() => closeEvent(row.offerId)}><X size={16} className="text-red-600"/> Close</Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </Card>

    <Sheet open={!!selectedOffer} onOpenChange={handleSheetClose}>
        <SheetContent className='overflow-auto'>
        <SheetHeader>
            <SheetTitle>Offer Responses</SheetTitle>
        </SheetHeader>
        {selectedOffer && (

            <div className="pt-4">
                
                <div className="flex flex-row mb-4 gap-1">
                    
                    <p>{selectedOffer.title}</p>
                </div>
                <div className="flex flex-row mb-4 gap-1">
                    <p className="block font-semibold">{selectedOffer.responses} </p> 
                    <p> Dealers responded</p>
                </div>

                {!searchingOther ? 
                    <div className="flex flex-row m-12">    
                        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                        <p className={`${inter.className} ${styles.text3}`}>Loading ...</p> 
                    </div>
                 : 
                    
                        // <div className="flex flex-row mb-4 gap-1">
                        //     <p className="block font-semibold">{allOfferResponses.length}</p>
                        //     <p>Responses found</p>
                        // </div>
                    (allOfferResponses.length > 0) ?
                        allOfferResponses.map((response, index) => (
                            <Card key={index} className="m-4 pt-2">
                                
                                <CardContent>
                                    <p className='font-semibold text-lg py-2'>{response.name}</p>
                                    <p className='font-semibold text-md flex items-center'>
                                        <PhoneCall className="mr-2" /> {response.mobile}
                                    </p>
                                    <br/>
                                    <p className='font-normal text-xs text-slate-500'>Responded on: {dayjs(response.createdOn).format("DD-MMM-YYYY hh:mm")}</p>
                                </CardContent>
                            </Card>
                        ))
                    :
                <p>-</p>}
                {/* <div className="mb-4">
                    <label className="block font-semibold">Attachment:</label>
                    <img
                    src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${selectedOffer.media}?alt=media`}
                    alt="Attachment"
                    width={150}
                    height={120}
                    className="mt-2 h-full object-cover rounded-lg"
                    />
                </div> */}

                
            </div>

            // <div className="p-4">
            // <p><strong>Dealer:</strong> {selectedOffer.dealer}</p>
            // <p><strong>Dealer Amount:</strong> {selectedOffer.dealerAmount}</p>
            // <p><strong>Anjani Amount:</strong> {selectedOffer.anjaniAmount}</p>
            // <p><strong>Confirmation Date:</strong> {dayjs(selectedOffer.confirmationOn).format("DD/MM/YY")}</p>
            // <p><strong>Response:</strong> {selectedOffer.response}</p>
            // <p><strong>Comment:</strong> {selectedOffer.comment}</p>
            // <img 
            //     src={`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/receipt%2F${selectedOffer.media}?alt=media`} 
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


      {/* <DataTable data={allOfferEvents} dataOffset={offset} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/> */}
      {/* <DataTable columns={columns} data={allOfferEvents} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}
      
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
        <DataTable data={allOfferEvents} columns={columns} />
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

