'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
import { XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Area, AreaChart } from 'recharts';
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel} from '@/app/components/ui/select'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/app/components/ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,} from "@/app/components/ui/drawer"
import { Separator } from "@/app/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { Skeleton } from "@/app/components/ui/skeleton"
import { 
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle, } from "@/app/components/ui/card"
import { Checkbox } from "@/app/components/ui/checkbox"

import Image from 'next/image'

import path from 'path'




// import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Toaster } from "../../../components/ui/sonner"
import { toast, ToastAction } from "sonner"
import Toast from '../../../components/myui/toast'
import { useToast } from "@/app/components/ui/use-toast"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"
import { Slider } from "@/app/components/ui/slider"
import { cn } from "@/app/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/app/components/ui/table"
  
// import {columns} from "./columns"
// import {DataTable} from "./data-table"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../../components/ui/sheet"

// import { columns } from "@/app/components/columns"
// import { DataTable } from "@/app/components/data-table"
import { UserNav } from "@/app/components/user-nav"
import { Input } from '@/app/components/ui/input';
import * as XLSX from 'xlsx';
import { get } from 'http';


const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'


// get dealer count by location
const getStats = async (pass, role, id) => 
  
    fetch("/api/v2/dealerstats/"+pass+"/0/"+role+"/"+id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get the dealers for SuperAdmin/Admin
const getAllDealersDataAPI = async (pass, role, offset, days, state, id) => 
  
fetch("/api/v2/user/"+pass+"/U5/"+role+"/"+offset+"/"+days+"/"+state+"/"+id, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


  // get the list of messages sent and received by a person to the admin
  const getSenderMessages = async (pass, sender, receiver) => 
    fetch("/api/v2/messaging/"+pass+"/4/"+sender+"/"+receiver, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get message to dealers
const sendBroadcastMessage = async (pass, sender, receiver, sentAt, message, seen, state) => 
  
fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});


// get message to dealers
const sendDealerMessage = async (pass, sender, receiver, sentAt, message, seen, state) => 
  
    fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// update the amount for a dealer
const sendPaymentUpdate = async (pass, dealer, amount, invoiceNo, transaction, date, adminId, message) => 
  
    fetch("/api/v2/payments/"+pass+"/websingle/"+dealer+"/"+amount+"/credit/"+invoiceNo.replace('/','***')+"/"+transaction+"/"+date+"/"+adminId+"/"+message, {
    // fetch("/api/v2/payments/"+pass+"/websingle/"+dealer+"/"+amount+"/credit/"+transaction+"/"+date+"/"+adminId+"/"+message+"/"+JSON.stringify(invoiceNo), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });


// const spaceRef = ref(storage, 'images/space.jpg');
// upload payments data
const updateUploadData = async (pass, items1, adminId) => 
    // userId, paymentAmount, type, transactionId, paymentDate,
    // userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
    // fetch("/api/v2/payments/"+pass+"/web/"+encodeURIComponent(JSON.stringify(items1))+"/"+adminId+"/-", {
    fetch("/api/v2/payments/"+pass+"/web/"+adminId+"/-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(items1),
    });
// upload invoices data
const updateUploadInvoicesData = async (pass, items1, adminId) => 
    // userId, paymentAmount, type, transactionId, paymentDate,
    // userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
    fetch("/api/v2/amount/"+pass+"/U7/"+adminId+"/-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(items1),
    });
    

// pass state variable and the method to update state variable
export default function AppReports() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [id, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [offset, setOffset] = useState(0);
    const [days, setDays] = useState(45);
    const [completed, setCompleted] = useState(false);
    const [loadingIds, setLoadingIds] = useState(new Set());
    
    // branch type selection whether all branches and years or specific ones
    const [viewTypeSelection, setViewTypeSelection] = useState('college');
        
    // for populating filters/selections
    const [selectedCampus, setSelectedCampus] = useState('All');
    const [hostelStrengths, setHostelStrengths] = useState([]);
    const [amountToUpdate, setAmountToUpdate] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [showMessageView, setShowMessageView] = useState(false);
    const [showPaymentView, setShowPaymentView] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const lastItemRef = useRef(null);
    const [file, setFile] = useState(null); 
    const [installCount, setInstallCount] = useState(null);
    const [error, setError] = useState(null);

    
    // branch type selection whether all branches and years or specific ones
    const [branchTypeSelection, setBranchTypeSelection] = useState('all');
    
    const [selectedBranchYears, setSelectedBranchYears] = useState([]);
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const [senderMessagesList, setSenderMessagesList] = useState([]);
    
    const [dataFound, setDataFound] = useState(true); 
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [searchingStats, setSearchingStats] = useState(false);
    const [searching, setSearching] = useState(false);
    const [messaging, setMessaging] = useState(false);

    const [regionsList, setRegionsList] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [initialDatesValues, setInititalDates] = React.useState({from: dayjs().subtract(0,'day'),to: dayjs(),});
    const [currentState, setCurrentState] = useState('All');
    //create new date object
    const today = new dayjs();
    



    
    // Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal',  // Use 'currency' for currency formatting
        minimumFractionDigits: 2,  // Minimum number of digits after the decimal
        maximumFractionDigits: 2   // Maximum number of digits after the decimal
    });

    ///////////////////////////////
    // IMPORTANT
    ///////////////////////////////
    

  // get messages of a specific receiver
  async function getSenderMessagesData(receiver){
        
    // console.log(receiver);
    
    setSearchingMessages(true);
    setSenderMessagesList([]);
    // setOffset(offset+10); // update the offset for every call

    try {    
        const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, receiver)
        const queryResult = await result.json() // get data
        // console.log(queryResult);
        // check for the status
        if(queryResult.status == 200){

            // check if data exits
            if(queryResult.data.length > 0){
                
                // get the messages list of the receiver
                setSenderMessagesList(queryResult.data);
                
                setDataFound(true);
                setSearchingMessages(false);
            }
            else {
                
                setDataFound(false);
            }
            setCompleted(false);
        }
        else {
            
            setSearchingMessages(false);
            setDataFound(false);
            setCompleted(true);
        }
    }
    catch (e){
        // show and hide message
        
    }
}


    // get the user and fire the data fetch
    useEffect(()=>{
        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                setRole(obj.role);
                setUserId(obj.id);
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[router]);

    useEffect(() => {
        if (user && user.id && !completed) {
            getAppStoreStats();
            getDealerStats();
            getAllRequests(days, currentState);
        }
    }, [user, completed]);


    // get dealer stats
    async function getAppStoreStats(){
        
        setSearchingStats(true);

        const fetchInstallations = async () => {
            try {
              const response = await fetch('/api/v2/appinstalls');
              if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
              }
              const data = await response.json();
              setInstallCount(data.installations);

              console.log(data.installations);

              setSearchingStats(false);
              
            } catch (err) {
              setError(err.message);
            }
          };

          fetchInstallations();
          
    }   

    async function getDealerStats(){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            
            const result  = await getStats(process.env.NEXT_PUBLIC_API_PASS, role, id)
            const queryResult = await result.json() // get data
            // console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    // console.log(queryResult.data);
                    // set the state
                    // total students
                    const result = queryResult.data;
                    
                    if (result && result.length > 0) {
                        
                        // Calculate total sum of pending amounts
                        // const totalSum = result.reduce((sum, invoice) => sum + invoice.pending, 0);
                        // console.log(totalSum);
                        

                            // Find the earliest expiry date
                            // const earliestExpiryDate = result
                            // .map(invoice => dayjs(invoice.expiryDate))  // Convert all expiry dates to dayjs objects
                            // .reduce((earliest, currentExpiry) => {
                            //     return earliest.isBefore(currentExpiry) ? earliest : currentExpiry;
                            // }, dayjs('9999-12-31'));
               
                            // // Calculate the difference in days
                            // const today = dayjs();  // Gets today's date
                            // const daysBetween = earliestExpiryDate.diff(today, 'day');  // 'day' ensures the difference is calculated in days

                            // // Format the earliest date in a friendly format, e.g., January 1, 2023
                            // // const formattedDate = formatDate(earliestExpiryDate, 'MMMM d, yyyy');
                            // const formattedDate = dayjs(earliestExpiryDate).format('MMMM D, YYYY');

                            setRegionsList(result);
                            // setTotalOutstanding(totalSum);
                            // setDueDate(formattedDate);
                            // setDaysLeft(daysBetween);
                        
                      } else {
                        console.log("No invoices data found.");
                      }
                   
                    setDataFound(true);
                    setSearchingStats(false);
                }
                else {
                    
                    setDataFound(false);
                }

                setSearchingStats(false);
                setCompleted(false);
            }
            else {
                
                setSearchingStats(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            console.log(e);
            // show and hide message
            setResultType('error');
            setResultMessage('Issue loading. Please refresh or try again later!');
            setTimeout(function(){
                setResultType('');
                setResultMessage('');
            }, 3000);
        }
}

    function updateDays(updatedDaysCount) {
        
        // getAllRequests(updatedDaysCount[0], currentState);
        setDays(updatedDaysCount[0]);
        
    }

    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllRequests(days, state){
        
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getAllDealersDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, offset, days, state, id ) 
            const queryResult = await result.json() // get data

            // console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){

                    // if(allRequests.length > 0){
                        
                    //     // setAllRequests(allRequests.push(queryResult.data));
                    //     // setAllRequests([]);
                    //     setAllRequests(allRequests.push(queryResult.data));
                    //     console.log("Checking");
                        
                    // }
                    // else{
                        setAllRequests(queryResult.data);
                        
                    // }
                    
                    setDataFound(true);
                }
                else {
                    setAllRequests([]);
                    setDataFound(false);
                }

                setSearching(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401) {
                
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllRequests([]);
                toast({
                    description: "Facing issues, try again later!",
                  })
                  
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                setAllRequests([]);
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            
            toast({
                description: "Issue loading, try again later!",
              })
        }
}

function downloadRequestsNow() {
    const result = allRequests;

    const worksheet = xlsx.utils.json_to_sheet(result);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook,worksheet,'Sheet 123');
    xlsx.writeFile(workbook, selectedCampus+'_'+currentState+'_'+dayjs(from).format("YYYY-MM-DD") + "," + dayjs(to).format("YYYY-MM-DD")+'.xlsx');
}

// Show Message View for selected user
function selectDealer(value) {
    
    // getAllRequests(days,value);
    setSelectedDealer(value);
    setShowMessageView(true);
    setShowPaymentView(false); // hide other view
    getSenderMessagesData(value);
    
}
// Show Payment View for selected user
function selectPaymentView(value) {
    
    // getAllRequests(days,value);
    setSelectedDealer(value);
    setShowPaymentView(true);
    setShowMessageView(false); // hide other view
    // getSenderMessagesData(value);
    
}
// update the currentState variable
function updateStatus(value) {
    
    getAllRequests(days,value);
    setCurrentState(value);
    
}
// update the currentState variable
function updateOffset(value) {
    
    console.log(value);
    getAllRequests(days,value);
    setOffset(value+10);
    
}

    


const sendMessageNow = async (e) => {
    
    setMessaging(true);
    
    try {    
        

        const result  = await sendBroadcastMessage(process.env.NEXT_PUBLIC_API_PASS, 
            JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, 'All', dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), document.getElementById('message').value,0,'-') 
        const queryResult = await result.json() // get data

        // console.log(queryResult);
        // check for the status
        if(queryResult.status == 200){

            setMessaging(false);
            toast("Message sent!", {
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


    // send message to a specific receiver
    async function sendMessageData(){
        // receiver is always the dealer
        
        setSendingMessage(true);
        // setOffset(offset+10); // update the offset for every call
        var message = document.getElementById('message').value;
        

        try {    
            // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+selectedReceiver.receiver+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+message+"/0/-");
            const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, selectedDealer, dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),message,"0","-");
        
            // const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId, receiver)
            const queryResult = await result.json() // get data
            // console.log(queryResult);
            var sentObj = {
                notificationId: 100000,
                sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                receiver: selectedDealer,
                sentAt: dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),
                message: document.getElementById('message').value,
                seen: 0,
                state: '-'
            };
            
            // check for the status
            if(queryResult.status == 200){

                    // get the messages list of the receiver
                    setSenderMessagesList([...senderMessagesList, sentObj]);
                    document.getElementById('message').value = ''; // clear the value
                    
                    toast({description: "Message Sent!",});
                    
                    // set the focus to the created message
                    if (lastItemRef.current) {
                        lastItemRef.current.focus();
                    }
                    
                    setDataFound(true);
                    setSendingMessage(false);
               
                setCompleted(false);
            }
            else {
                
                setSendingMessage(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            console.log(e);
            
            // show and hide message
            toast({description: "Facing issues, try again later!",});
        }
    }
  

    // updatePaymentData for a specific dealer
    async function updatePaymentData(invoiceNo){
        // receiver is always the dealer
        
        try {    
            // console.log("/api/v2/payments/"+process.env.NEXT_PUBLIC_API_PASS+"/websingle/"+selectedDealer+"/"+amountToUpdate+"/credit/"+encodeURIComponent(invoiceNo)+"/"+transactionId+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/-");
            const result  = await sendPaymentUpdate(process.env.NEXT_PUBLIC_API_PASS, selectedDealer, amountToUpdate, invoiceNo, transactionId, dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, '-');
        
            const queryResult = await result.json() // get data
            // console.log(queryResult);

            // check for the status
            if(queryResult.status == 200){

                const index = allRequests.findIndex(dealer => dealer.invoiceNo === invoiceNo);

                let updatedDealerPeople;
                if (index !== -1) {
                // If a matching dealer is found, update only the first match
                updatedDealerPeople = [
                    ...allRequests.slice(0, index),
                    {
                    ...allRequests[index],
                    pending: (allRequests[index].pending - parseFloat(amountToUpdate.trim())).toString(),
                    },
                    ...allRequests.slice(index + 1)
                ];
                } else {
                    // If no match is found, return the original array
                    updatedDealerPeople = allRequests;
                }

                // // update the dealer inline
                // const updatedDealerPeople = allRequests.map((dealer) => {
                //     if (dealer.invoiceNo === invoiceNo) {
                //       // Update the specific object with the new name
                //       console.log(dealer.pending);
                //       console.log(amountToUpdate.trim());
                //       console.log(parseFloat(amountToUpdate.trim()));
                      
                //       return { ...dealer, pending: (dealer.pending - parseFloat(amountToUpdate.trim())).toString };
                //     }
                //     return dealer; // Keep other objects unchanged
                //   });
              
                  setAllRequests(updatedDealerPeople);
                  toast({description: "Payment update success!",});

            }
            else {
                
            }
        }
        catch (e){
            console.log(e);
            
            // show and hide message
            toast({description: "Facing issues, try again later!",});
        }
    }


    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);  // Update state
        } else {
            console.log("No file selected.");
        }
    };
    
    // for payments upload
    const processData = (e) => {
        
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, {type: 'binary'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Specify date format directly in the read operation
                const data = XLSX.utils.sheet_to_json(worksheet, {
                    dateNF: 'yyyy-mm-dd hh:mm:ss', // Format date columns
                    raw: false, // Do not use raw values (this ensures that dates are processed)
                });
                
                // Optionally process amounts to ensure they are decimals with two decimal places
                const processedData = data.map(item => ({
                    ...item,
                    amount: typeof item.amount === 'number' ? parseFloat(item.amount.toFixed(2)) : item.amount,
                }));
    
    
                // setItems(data);
                getDataDetails(data);
                // const data = XLSX.utils.sheet_to_json(worksheet);
                // setItems(data);
                // getDataDetails(data);
            };
    
            reader.readAsBinaryString(file);
        } else {
            console.log("Please select a file first.");
        }
    }

    // get the requests data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getDataDetails(items1){
        
        setUploadProgress(true);
        
        try {    
            const result  = await updateUploadData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await result.json() // get data
            
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);

                toast({description: "Upload success. Refresh to view updated data"});

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
            }
        }
        catch (e){
            console.log(e);
            toast({description: "Issue loading. Please refresh or try again later!"});
        }
    }
    
    // for invocies upload
    const processInvoicesData = (e) => {
        // console.log('Check1');
        
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                const binaryString = event.target.result;
                const workbook = XLSX.read(binaryString, {type: 'binary'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Specify date format directly in the read operation
                const data = XLSX.utils.sheet_to_json(worksheet, {
                    dateNF: 'yyyy-mm-dd hh:mm:ss', // Format date columns
                    raw: false, // Do not use raw values (this ensures that dates are processed)
                });
                
                // Optionally process amounts to ensure they are decimals with two decimal places
                const processedData = data.map(item => ({
                    ...item,
                    amount: typeof item.amount === 'number' ? parseFloat(item.amount.toFixed(2)) : item.amount,
                }));
    
    
                // setItems(data);
                getInvoiceDataDetails(data);
                // const data = XLSX.utils.sheet_to_json(worksheet);
                // setItems(data);
                // getDataDetails(data);
            };
    
            reader.readAsBinaryString(file);
        } else {
            console.log("Please select a file first.");
        }
    }
    async function getInvoiceDataDetails(items1){
        
        setUploadProgress(true);
        
        try {    
            const result  = await updateUploadInvoicesData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await result.json() // get data
            
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);
                toast({description: "Upload success. Refresh to view updated data"});

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
            }
        }
        catch (e){
            console.log(e);
            toast({description: "Issue loading. Please refresh or try again later!"});
        }
    }
  
    
  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'row', alignItems:'flex-start',height:'100vh',gap:'8px'}}>
            
            
          {/* <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-lg font-semibold">Dealers Pending Payment</h2>

            {(!messaging) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button>Broadcast message</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Broadcast message</SheetTitle>
                    <SheetDescription>
                        Enter your message to send it to all the dealers.
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
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Broadcasting...</Label>
                </div>
                }
              <Toaster />
          </div>       */}

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
          
           
          
         
    <div className={styles.verticalsection} style={{height:'90vh', width:'100%',gap:'8px',overflow: 'auto', scrollBehavior:'smooth'}}>

    <div className='flex flex-row gap-2 items-center py-4' >
        <h2 className="text-lg font-semibold mr-4">Dashboard</h2>

            {/* <Sheet>
                <SheetTrigger asChild>
                    <Button className="text-white bg-green-600"><Receipt className='font-bold text-lg'/>&nbsp; Upload Invoices Data</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>File upload</SheetTitle>
                    <SheetDescription>
                        Make sure you use the correct format. Click Upload now when file is selected.
                    </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <br/>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Data file</Label>
                            <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
                        </div>
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={processInvoicesData}>Upload now</Button>
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet> */}
            
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="text-white bg-blue-700"><CurrencyInr className='font-bold text-lg'/>&nbsp; Upload Payments Data</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>File upload</SheetTitle>
                    <SheetDescription>
                        Make sure you use the correct format. Click Upload now when file is selected.
                    </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <br/>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Data file</Label>
                            <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
                        </div>
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={processData}>Upload now</Button>
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {uploadProgress ? <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Uploading ...</CardTitle>
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
                {/* <CardFooter className="flex justify-between">
                    <Button>Send messages</Button>
                </CardFooter> */}
            </Card> : null}
            {/* {(!messaging) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button className="bg-blue-600 text-white">Broadcast Message</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Broadcast Message</SheetTitle>
                    <SheetDescription>
                        Enter your message to send it to all the dealers.
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
                    </SheetClose>
                    </SheetFooter>
                </SheetContent>
                </Sheet>
                :
                <div>
                    <Label htmlFor="picture">Broadcasting...</Label>
                </div>
                } */}
              <Toaster />
          </div>

        {(viewTypeSelection == 'college') ? 
            <div className="flex items-center py-2" style={{gap:'10px'}}>       
            </div>
        :
            <div className="flex items-center py-2" style={{gap:'10px'}}>
            </div>
        }



{/* {(allRequests.length !=0) ? */}
<div className="mx-auto" style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',gap:'10px'}}>
{/* <div className="container mx-auto py-10"> */}
{/* <div>{allRequests.length}</div> */}
    
<div className={cn("grid gap-2 mb-4")} style={{display:'flex', flexDirection:'column', alignItems:'start'}}>

<Tabs defaultValue={currentState} className="w-[400px]">
    <TabsList>
      {/* <TabsTrigger value="All" onClick={()=>updateStatus('All')}>All States</TabsTrigger> */}

      {regionsList.map(regionItem => (
        <TabsTrigger key={regionItem.state} value={regionItem.state} onClick={()=>updateStatus(regionItem.state)}>{regionItem.state}</TabsTrigger>
        // <TabsTrigger value={regionItem.state} onClick={()=>updateStatus(regionItem.state)}>{regionItem.state.split('-')[1]}</TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
</div>

    {searchingStats ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
        <div className="flex flex-col gap-2 mb-4" >
            
            {(regionsList.length > 0) ?
                <div  className="flex flex-row gap-2">
                    <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={0}>
                        <div className="flex flex-row gap-2 items-center">
                            <p className='text-s text-gray-600 font-normal'>Total Outstanding</p>
                        </div>
                        <p className='text-xl text-black font-semibold tracking-wider'>₹{formatter.format(regionsList.find(item => item.state === currentState).pendingATL + regionsList.find(item => item.state === currentState).pendingVCL)}</p>
                    </Card>
                    <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={0}>
                        <div className="flex flex-row gap-2 items-center">
                            <p className='text-s text-gray-600 font-normal'>Outstanding </p>
                            <div className="text-sm font-semibold bg-rose-500 text-rose-100 px-1.5 w-fit border border-rose-600 rounded-2xl tracking-wider">
                                ATL
                            </div>
                        </div>
                        <p className='text-xl text-rose-500 font-semibold tracking-wider'>₹{formatter.format(regionsList.find(item => item.state === currentState).pendingATL)}</p>
                    </Card>
                    <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={1}>
                        <div className="flex flex-row gap-2 items-center">
                            <p className='text-s text-gray-600 font-normal'>Outstanding </p>
                            <div className="text-sm font-semibold bg-red-700 text-red-100 px-1.5 w-fit border border-red-800 rounded-2xl tracking-wider">
                                VCL
                            </div>
                        </div>
                        <p className='text-xl text-red-700 font-semibold tracking-wider'>₹{formatter.format(regionsList.find(item => item.state === currentState).pendingVCL)}</p>
                    </Card>
                    <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={2}>
                        <p className='text-s text-gray-600 font-normal'>Pending Invoices</p>
                        <p className='text-xl text-black-700 font-semibold tracking-wider'>{regionsList.find(item => item.state === currentState).invoices}</p>
                    </Card>
                    <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={3}>
                        <p className='text-s text-gray-600 font-normal'>Due / Total Dealers</p>
                        <p className='text-xl text-black-700 font-semibold tracking-wider'>{regionsList.find(item => item.state === currentState).dealersDue} / {regionsList.find(item => item.state === currentState).dealers}</p>
                    </Card>
                    {/* <Card className="w-[200px] px-3 py-3 flex flex-col gap-4" key={4}>
                        <p className='text-s text-gray-600 font-normal'>Total Dealers</p>
                        <p className='text-xl text-black-700 font-semibold tracking-wider'>{regionsList.find(item => item.state === currentState).dealers}</p>
                    </Card> */}
                </div>
                    : null}

            {/* <div  className="flex flex-row gap-2">
            {regionsList.map(regionItem => (
                    <Card className="w-[200px] px-3 py-3" key={regionItem.state}>
                        <form>
                            <p className='text-m text-green-700'>{regionItem.state.split('-')[1]}</p>
                            <Label className='text-l font-semibold'>₹{formatter.format(regionItem.pending)}</Label>
                        </form>
                    </Card>
                
                ))}
            </div> */}
        </div>
            }
        

        <Card className="w-fit px-3 py-3 flex flex-row justify-between items-center gap-8">
            <div>
                {/* <p className='text-m text-green-700'>{regionItem.state.split('-')[1]}</p>
                <Label className='text-l font-semibold'>₹{formatter.format(regionItem.pending)}</Label> */}
                {days == 0 ?
                    <p className="text-m font-semibold text-red-600 pb-4">Dealers with due date expired</p>
                    :
                    <p className="text-m text-slate-500 pb-4">Dealers with due in:<span className="text-red-600 font-semibold"> {days} days</span></p>
                }
                <Slider 
                    // defaultValue={[45]} 
                    max={100} 
                    step={1} 
                    value={[days]}
                    onValueChange={updateDays}
                    className="relative z-10"
                    aria-label="Counter from 0 to 100"
                    />
            </div>
            <Button variant="outline" className="bg-black text-white" size="sm" onClick={() => getAllRequests(days, currentState)} >Apply</Button>
            {searching ? 
            <div className="flex flex-row px-4">    
                <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                <p className='text-black '>Loading...</p> 
            </div>
            :
            ''}
            
        </Card>

        {/* <p className="text-m text-slate-500">Due in {days} days</p>
            <Slider 
                // defaultValue={[45]} 
                max={100} 
                step={1} 
                value={[days]}
                onValueChange={updateDays}
                className="relative z-10"
                aria-label="Counter from 0 to 100"
                /> */}
        
        {/* <div className="flex flex-row">

            <DataTable data={allRequests} dataOffset={offset} status={currentState} changeSelectedDealer={selectDealer} showPaymentView={selectPaymentView} downloadNow={downloadRequestsNow} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/>
        
        
      </div> */}
      {/* <DataTable columns={columns} data={allRequests} status={currentState} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}
      
    </div>
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
        <DataTable data={allRequests} columns={columns} />
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


        {!searching && showMessageView && allRequests.length > 0 ?
            <div className="flex flex-col flex-1 rounded-md border p-4 gap-4 min-w-96" style={{height: '90vh',position: 'sticky'}}>
                <div className="flex flex-1 flex-col gap-2">
                    {searchingMessages ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : 
                    <div className='flex flex-row justify-between items-center'>
                        {/* <div className='flex flex-col gap-4'> */}
                            <p className="text-xl font-semibold text-black">Send Message</p>
                        {/* </div> */}
                        <Button variant='outline' size="icon" onClick={()=>setShowMessageView(false)} className="text-blue-600"><X size={24} className="text-slate-600"/></Button>
                    </div>
                    }
                    <br/>
                    <p className="text-sm font-semibold text-black">{allRequests.find(item => item.dealerId === selectedDealer).accountName}</p>
                    <p className='text-sm text-slate-600'>GST: {selectedDealer}</p>
                    
                </div>
                
                    
                    
                        {searchingMessages ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
                            <div className="flex flex-col flex-auto overflow-scroll justify-stretch gap-2">
                            {senderMessagesList.length > 0 ?
                            senderMessagesList.map((message, index) => (
                                // <div key={index} className="w-fit flex flex-col rounded-md border p-2" style={(message.sender==JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id) ? {alignSelf:'self-end'} : {alignSelf:'self-start'}} ref={index === senderMessagesList.length - 1 ? lastItemRef : null}>
                                <div key={index} className="w-fit flex flex-col rounded-md border p-2" style={(message.sender==selectedDealer) ? {alignSelf:'self-start'} : {alignSelf:'self-end'}} ref={index === senderMessagesList.length - 1 ? lastItemRef : null}>
                                    <Label className="p-1">{message.message}</Label>
                                    {/* <Label className="text-gray-500 p-1">{message.sender}</Label> */}
                                    <p className="text-xs text-gray-500 p-1">{dayjs(message.sentAt).format('MMMM D, YYYY h:mm A')}</p>
                                    
                                    {(message.sender==JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id) ? 
                                    (message.seen == 1) ? 
                                        <p className="text-xs text-green-500 p-1 flex gap-1 items-center"><Checks className="text-green-600"/> Seen</p>
                                        : <p className="text-xs text-gray-500 p-1 flex gap-1 items-center"><Check className="text-gray-600"/> Not seen</p>
                                    
                                    : <></>
                                    }
                                </div>
                            ))
                            : <p className="text-xs text-gray-500 p-1">No messages sent yet!</p>
                            }
                            </div>
                        }
                        
                    {/* </div> */}
                
                <div className="flex flex-1 flex-col justify-between gap-2">
                    {/* <Button variant='outline' onClick={()=>getData()}>Refresh</Button> */}
                    <Textarea id="message" placeholder="Type your message here." />
                    {/* {sendingMessage ? 
                        <div className='flex flex-row'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Sending...</div>
                        :  */}
                        {/* <Button variant='outline'  onClick={()=>getSenderMessagesData(row.getValue('dealerId'))} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send Message</Button> */}
                        <Button variant='outline' onClick={()=>sendMessageData()} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send</Button>
                    {/* } */}
                </div>
            </div>
            :
            <div></div>}
        
        {!searching && showPaymentView && allRequests.length > 0 ?
            <div className="flex flex-col flex-1 rounded-md border p-4 gap-4 min-w-96" style={{height: '90vh',position: 'sticky'}}>
                <div className="flex flex-1 flex-col gap-2">
                    {searchingMessages ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : 
                    <div className='flex flex-row justify-between items-center'>
                        {/* <div className='flex flex-col gap-4'> */}
                            <p className="text-xl font-semibold text-black">Update Payment</p>
                        {/* </div> */}
                        
                        <Button variant='outline' size="icon" onClick={()=>setShowPaymentView(false)} className="text-blue-600"><X size={24} className="text-slate-600"/></Button>
                    </div>
                    }
                    <br/>
                    <p className="text-sm font-semibold text-black">{allRequests.find(item => item.dealerId === selectedDealer).accountName}</p>
                    <p className='text-sm text-slate-600'>GST: {selectedDealer}</p>
                    <br/>
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="name" className="text-right">
                        Amount:
                        </Label>
                        <Input type="numeric" pattern="^(0*[1-9]\d*(\.\d*)?|\d*\.\d*[1-9]\d*)$" id="amount" value={amountToUpdate} onChange={(e)=>(/^(0*[1-9]\d*(\.\d*)?|\d*\.\d*[1-9]\d*)$/.test(e.target.value) || e.target.value === "") ? setAmountToUpdate(e.target.value) : ''} className="col-span-3" />
                    </div>
                    <br/>
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="name" className="text-right">
                        Transaction Id:
                        </Label>
                        <Input type="text" id="amount" value={transactionId} onChange={(e)=>setTransactionId(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                
                
                <div className="flex flex-1 flex-col justify-between gap-2">
                    {/* <Button variant='outline' onClick={()=>getData()}>Refresh</Button> */}
                    {/* <Textarea id="message" placeholder="Type your message here." /> */}
                    {/* {sendingMessage ? 
                        <div className='flex flex-row'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Sending...</div>
                        :  */}
                        {/* <Button variant='outline'  onClick={()=>getSenderMessagesData(row.getValue('dealerId'))} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send Message</Button> */}
                        <Button variant='outline' onClick={()=>updatePaymentData(allRequests.find(item => item.dealerId === selectedDealer).invoiceNo)} className="bg-blue-700 text-white font-semibold"><PaperPlaneRight className="text-white"/> &nbsp; Update</Button>
                    {/* } */}
                </div>
            </div>
            :
            <div></div>}
    
    </div>
    
    
  );
}

