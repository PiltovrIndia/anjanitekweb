'use client'

import { Inter } from 'next/font/google'
import { Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, XCircle, Plus, CurrencyInr, Receipt, CalendarBlank } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
import { XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Area, AreaChart } from 'recharts';
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// const storage = getStorage();
import firebase from '../../../firebase';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel} from '@/app/components/ui/select'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/app/components/ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,} from "@/app/components/ui/drawer"
import { Separator } from "@/app/components/ui/separator"
import { Badge } from "@/app/components/ui/badge"
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
import { OperationProgress } from '@/app/components/operation-progress'
import { Checkbox } from "@/app/components/ui/checkbox"
const storage = getStorage(firebase, "gs://smartcampusimages-1.appspot.com");
import Image from 'next/image'
// import fs from 'fs'
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
  
import {columns} from "./columns"
import {DataTable} from "./data-table"
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


const xlsx = require('xlsx');

import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar } from '@/app/components/ui/calendar';
// Child references can also take paths delimited by '/'
const spaceRef = ref(storage, '/');

function OutstandingSummaryCards({ summary, formatter, dateScoped = false }) {
    if (!summary) {
        return (
            <Card className="w-full shadow-none">
                <CardContent className="flex min-h-[132px] items-center justify-center text-sm text-muted-foreground">
                    No outstanding data is available for this selection.
                </CardContent>
            </Card>
        )
    }

    const atlOutstanding = Number(summary.pendingATL || 0)
    const vclOutstanding = Number(summary.pendingVCL || 0)
    const totalOutstanding = atlOutstanding + vclOutstanding
    const dueDealers = Number(summary.dealersDue || 0)
    const totalDealers = Number(summary.dealers || 0)
    const metrics = [
        {
            label: 'Total outstanding',
            value: `₹${formatter.format(totalOutstanding)}`,
            detail: 'ATL and VCL combined',
            badge: 'Current view',
            className: 'border-slate-200 bg-card',
        },
        {
            label: 'ATL outstanding',
            value: `₹${formatter.format(atlOutstanding)}`,
            detail: 'Pending ATL invoice value',
            badge: 'ATL',
            className: 'border-rose-200 bg-rose-50/40',
            badgeClassName: 'border-rose-200 bg-rose-100 text-rose-700',
        },
        {
            label: 'VCL outstanding',
            value: `₹${formatter.format(vclOutstanding)}`,
            detail: 'Pending VCL invoice value',
            badge: 'VCL',
            className: 'border-orange-200 bg-orange-50/40',
            badgeClassName: 'border-orange-200 bg-orange-100 text-orange-700',
        },
        {
            label: 'Pending invoices',
            value: Number(summary.invoices || 0).toLocaleString('en-IN'),
            detail: 'Invoices awaiting payment',
            badge: 'Invoices',
            className: 'border-blue-200 bg-blue-50/40',
            badgeClassName: 'border-blue-200 bg-blue-100 text-blue-700',
        },
        {
            label: dateScoped ? 'Dealers due' : 'Dealers due / total',
            value: dateScoped ? dueDealers.toLocaleString('en-IN') : `${dueDealers.toLocaleString('en-IN')} / ${totalDealers.toLocaleString('en-IN')}`,
            detail: dateScoped ? 'Dealers due on the selected date' : 'Dealers requiring payment follow-up',
            badge: 'Dealers',
            className: 'border-amber-200 bg-amber-50/40',
            badgeClassName: 'border-amber-200 bg-amber-100 text-amber-800',
        },
    ]

    return (
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
                <Card key={metric.label} className={`min-h-[144px] shadow-none ${metric.className}`}>
                    <CardHeader className="flex-row items-start justify-between space-y-0 p-4 pb-2">
                        <CardDescription className="pr-2 text-xs font-medium leading-5 text-foreground/70">{metric.label}</CardDescription>
                        <Badge variant="outline" className={`shrink-0 text-[11px] ${metric.badgeClassName || 'bg-background/70 text-muted-foreground'}`}>{metric.badge}</Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <p className="text-xl font-semibold tracking-normal text-foreground">{metric.value}</p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function OutstandingSummarySkeleton() {
    return (
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-36 w-full" />)}
        </div>
    )
}

// get dealer count by location
const getStats = async (pass, role, id) => 
  
    fetch("/api/v2/dealerstats/"+pass+"/0/"+role+"/"+id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
// get dealer count by location
const getStatsByDate = async (pass, role, id, selectedDate) => 
  
    fetch("/api/v2/dealerstats/"+pass+"/0.1/"+role+"/"+id+"/"+selectedDate, {
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
export default function Outing() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [id, setUserId] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
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
    const [outstandingListByDate, setOtstandingListByDate] = useState([]);
    const [searchingStatsByDate, setSearchingStatsByDate] = useState(false);
    const [allRequests, setAllRequests] = useState([]);
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [initialDatesValues, setInititalDates] = React.useState({from: dayjs().subtract(0,'day'),to: dayjs(),});
    const [currentState, setCurrentState] = useState('All');
    //create new date object
    const today = new dayjs();
    
    const [showBlockOuting, setShowBlockOuting] = useState(false);
    const toggleShowBlockOuting = async () => {
        // setSelectedStudent(selectedStudent);
        setShowBlockOuting(!showBlockOuting)
    }
    const getDataData = async () => {
        console.log("Hello1");
    }

    // Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal',  // Use 'currency' for currency formatting
        minimumFractionDigits: 2,  // Minimum number of digits after the decimal
        maximumFractionDigits: 2   // Maximum number of digits after the decimal
    });
    const currentRegionSummary = regionsList.find((item) => item.state === currentState) || regionsList[0] || null
    const selectedDateSummary = outstandingListByDate.find((item) => item.state === currentState) || outstandingListByDate[0] || null

    ///////////////////////////////
    // IMPORTANT
    ///////////////////////////////
    // handle accept click to update a row
    const handleMessageSendClick = (row) => {
        
        setLoadingIds(prev => new Set(prev.add(row.getValue('dealerId'))));

        // Simulate API call
        sendSingleMessageNow(row.getValue('dealerId'), () => {
            setLoadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(row.getValue('dealerId'));
                return newSet;
            });

            toast({description: "Message Sent!",});
        });
        
    };

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

  async function sendSingleMessageNow(dealerId, callback){

    try {    
        var updatedOn = dayjs(new dayjs()).format("YYYY-MM-DD");
        
        // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+dealerId+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+document.getElementById('message').value+"/0/-");
        // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+row.getValue('appointmentId')+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).collegeId+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).username+"/"+updatedOn+"/"+row.getValue('collegeId'));
        const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,dealerId,dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),document.getElementById('message').value,"0","-");
        // const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId+"/All"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+document.getElementById('message').value+"/0/-");
        const queryResult = await result.json() // get data

        // check for the status
        if(queryResult.status == 200){

          // toast({description: "Appointment updated!",});
        //   handleRemoveAppointment(row);
          callback();
          
        }
        else if(queryResult.status == 201) {
            
            // setSearching(false);
            // setDataFound(false);
            // setCompleted(true);
        }
    }
    catch (e){
      //   console.log(e);
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
            getDealerStats();
            getAllRequests(days, currentState);
        }
    }, [user, completed]);


    // get dealer stats
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

const handleDateChange = (date) => {
    if (date) {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
    }
};

    async function getDealerStatsByDate(){
        
        setSearchingStatsByDate(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            
            const result  = await getStatsByDate(process.env.NEXT_PUBLIC_API_PASS, role, id, selectedDate)
            const queryResult = await result.json() // get data
            console.log(queryResult);
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

                            setOtstandingListByDate(result);
                            // setTotalOutstanding(totalSum);
                            // setDueDate(formattedDate);
                            // setDaysLeft(daysBetween);
                        
                      } else {
                        console.log("No invoices data found.");
                      }
                   
                    setDataFound(true);
                    setSearchingStatsByDate(false);
                }
                else {
                    
                    setDataFound(false);
                }

                setSearchingStatsByDate(false);
                setCompleted(false);
            }
            else {
                
                setSearchingStatsByDate(false);
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

function downloadHostelsDataNow() {
    console.log("Downloading...");
    const result = hostelStrengths;
    const strengthsExcludingHostelId = hostelStrengths.map(({ hostelId, ...rest }) => rest);

// console.log(strengthsExcludingHostelId);

    const worksheet = xlsx.utils.json_to_sheet(strengthsExcludingHostelId);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook,worksheet,'All Hostels');
    xlsx.writeFile(workbook, 'HostelStrength_'+dayjs(today.toDate()).format("DD-MM-YYYY").toString()+'.xlsx');
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

        <div className={`${inter.className} flex min-h-full w-full items-start gap-4`}>
            
            
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
          
           
          
         
    <div className="flex min-h-full min-w-0 flex-1 flex-col gap-6 pb-6">

    <div className='flex min-h-[72px] w-full flex-wrap items-center gap-3' >
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

            {uploadProgress ? <OperationProgress title="Uploading data" description="Processing your file. Keep this page open." /> : null}
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

       



{/* {(allRequests.length !=0) ? */}
<section className="flex w-full min-w-0 flex-col gap-6">
{/* <div className="container mx-auto py-10"> */}
{/* <div>{allRequests.length}</div> */}
    
<section className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-col lg:items-start lg:justify-between">
        <div >
            <p className="text-sm font-semibold">Total outstanding</p>
            <p className="mt-1 text-sm text-muted-foreground">Outstanding invoice value for the selected state.</p>
        </div>
        <Tabs value={currentState} onValueChange={updateStatus} className="w-full lg:w-auto">
            <TabsList className="w-full justify-start overflow-x-auto lg:w-auto">
                {regionsList.map(regionItem => <TabsTrigger key={regionItem.state} value={regionItem.state}>{regionItem.state}</TabsTrigger>)}
            </TabsList>
        </Tabs>
    </div>
    {searchingStats ? <OutstandingSummarySkeleton /> : <OutstandingSummaryCards summary={currentRegionSummary} formatter={formatter} />}
</section>

<Separator/>

<section className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <p className="text-sm font-semibold">Outstanding by date</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a date to see the payment exposure due on that day.</p>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal sm:w-[280px]", !selectedDate && "text-muted-foreground")}
                >
                    <CalendarBlank className="mr-2 h-4 w-4" />
                    {selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
                <Button type="button" className="mt-3 w-full" onClick={getDealerStatsByDate}>Apply date</Button>
            </PopoverContent>
        </Popover>
    </div>
    {searchingStatsByDate ? <OutstandingSummarySkeleton /> : <OutstandingSummaryCards summary={selectedDateSummary} formatter={formatter} dateScoped />}
</section>

<Separator/>
        
        <section className="space-y-4">
            <div>
                <p className="text-sm font-semibold">Outstanding dealers by days</p>
                <p className="mt-1 text-sm text-muted-foreground">Set the due window, then load the dealer list that needs follow-up.</p>
            </div>
            <Card className="w-full shadow-none">
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
                    <div className="min-w-0 flex-1">
                        {days === 0 ? (
                            <p className="mb-4 text-sm font-medium text-destructive">Dealers with an expired due date</p>
                        ) : (
                            <p className="mb-4 text-sm text-muted-foreground">Dealers with due in <span className="font-semibold text-foreground">{days} days</span></p>
                        )}
                        <Slider
                            max={100}
                            step={1}
                            value={[days]}
                            onValueChange={updateDays}
                            className="relative z-10"
                            aria-label="Due days from 0 to 100"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {searching ? <span className="flex items-center gap-2 text-sm text-muted-foreground"><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Loading dealers</span> : null}
                        <Button size="sm" onClick={() => getAllRequests(days, currentState)} disabled={searching}>Apply</Button>
                    </div>
                </CardContent>
            </Card>
        </section>

        <section className="min-w-0">
            <DataTable data={allRequests} dataOffset={offset} status={currentState} changeSelectedDealer={selectDealer} showPaymentView={selectPaymentView} downloadNow={downloadRequestsNow} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/>
        </section>
      </section>
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
