'use client'

import { Inter } from 'next/font/google'
import { PencilSimpleLine, UserMinus, Check, Info, SpinnerGap, X, Plus, UserPlus, Receipt, ArrowDown, Trash, CalendarPlus } from 'phosphor-react'
import React, { useCallback, useEffect, useState } from 'react'
import { CalendarClock, FileText, Loader2, Search, Trash2 } from 'lucide-react'
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
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/app/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,} from "@/app/components/ui/drawer"
import { Separator } from "@/app/components/ui/separator"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog"
import { OperationProgress } from '@/app/components/operation-progress'

import { Calendar } from "@/app/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover";
import { ScrollArea } from "@/app/components/ui/scroll-area"


import BlockDatesBtn from '../../../components/myui/blockdatesbtn'
import OutingRequest from '../../../components/myui/outingrequest'
const storage = getStorage(firebase, "gs://smartcampusimages-1.appspot.com");
import Image from 'next/image'
// import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx';


const xlsx = require('xlsx');



// import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Toaster } from "../../../../app/components/ui/sonner"
import { toast, ToastAction } from "sonner"
import Toast from '../../../../app/components/myui/toast'
import { useToast } from "@/app/components/ui/use-toast"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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


// get all invoices for SuperAdmin
const getAllInvoicesDataAPI = async (pass, offset, role) => 
  
fetch("/api/v2/amount/"+pass+"/U4.2/"+offset+"/"+role, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const getInvoicesByStatusDataAPI = async (pass, status, invoiceType) =>
fetch("/api/v2/amount/"+pass+"/U4.3/"+encodeURIComponent(status)+"/"+encodeURIComponent(invoiceType), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get matching invoices for SuperAdmin
const getMatchingInvoicesDataAPI = async (pass, invoiceNo, role) => 
  
fetch("/api/v2/amount/"+pass+"/U4.1/"+invoiceNo+"/"+role, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get the SalesManagers for SalesExecutives
const getAllSalesPersonsDataAPI = async (pass, role, offset) => 
  
    fetch("/api/v2/user/"+pass+"/U7/"+role+"/"+offset, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });


// upload invoices data
const updateUploadInvoicesData = async (pass, items1, adminId) => 
    // userId, paymentAmount, type, transactionId, paymentDate,
    // userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
    // fetch("/api/v2/amount/"+pass+"/U7/"+encodeURIComponent(JSON.stringify(items1))+"/"+adminId+"/-", {
    fetch("/api/v2/amount/"+pass+"/U7/"+adminId+"/-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(items1),
    });
    

// update invoices
const updateSelectedInvoicesDataForSelectedAPI = async (pass, invoiceNo, invoiceAmount, amountPaid, pending, invoiceId) => 
    // id, paymentAmount, invoiceList, transactionId, paymentDate, adminId, particular
fetch("/api/v2/amount/"+pass+"/U8/"+invoiceAmount+"/"+amountPaid+"/"+pending+"/"+invoiceId, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// delete invoices 
const deleteSelectedInvoicesDataForSelectedAPI = async (pass, invoiceId, invoiceNo) => 
    // id, paymentAmount, invoiceList, transactionId, paymentDate, adminId, particular
fetch("/api/v2/amount/"+pass+"/U9/"+invoiceNo.replace('/','***'), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// delete invoices 
const createSingleInvoiceDataForSelectedAPI = async (adminId, pass, invoiceNo, invoiceType, invoiceDate, dealerId, totalAmount, amountPaid, pending, expiryDate, boxes) => 
    
fetch("/api/v2/amount/"+pass+"/U10/"+invoiceNo.replace('/','***')+"/"+invoiceType+"/"+invoiceDate+"/"+dealerId+"/"+totalAmount+"/"+amountPaid+"/"+pending+"/"+expiryDate+"/"+adminId+"/"+boxes, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



// pass state variable and the method to update state variable
export default function Invoices() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [selectedStatus, setselectedStatus] = useState('NotPaid');
    const [selectedInvoiceType, setSelectedInvoiceType] = useState('All');
    const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState('');
    const [offset, setOffset] = useState(0);
    const [updatingInvoice, setUpdatingInvoice] = useState(false);
    const [deletingInvoice, setDeletingInvoice] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    const [completed, setCompleted] = useState(false);
    const [searching, setSearching] = useState(true);
    const [searchingOther, setOtherSearching] = useState(true);
    const [searchingSales, setSearchingSales] = useState(false);
    const [loadingIds, setLoadingIds] = useState(new Set());
    const [file, setFile] = useState(null); 
    const [uploadProgress, setUploadProgress] = useState(false);
    const [createProgress, setCreatingInvoice] = useState(false);
    
    // get all sales people for changing the value
    const [allSalesPeople, setAllSalesPeople] = useState([]);
    const [dataFound, setDataFound] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [allInvoices, setAllInvoices] = useState([]);
    const [allInvoicesFiltered, setAllInvoicesFiltered] = useState([]);
    const [totalInvoicesCount, setTotalInvoicesCount] = useState(0);
    const [invoiceSummary, setInvoiceSummary] = useState({});

    // State variables for each input field
    const [selectedTotalAmount, setSelectedTotalAmount] = useState(0);
    const [selectedAmountPaid, setSelectedAmountPaid] = useState(0);
    const [selectedPendingAmount, setSelectedPendingAmount] = useState(0);

    // State variables for each input field for create invoice
    const [inputInvoiceNo, setInputInvoiceNo] = useState('');
    const [inputInvoiceType, setInputInvoiceType] = useState('ATL');
    const [inputInvoiceDate, setInputInvoiceDate] = useState('');
    const [inputInvoiceDealer, setInputInvoiceDealer] = useState('');
    const [inputInvoiceTotalAmount, setInputInvoiceTotalAmount] = useState(0);
    const [inputInvoiceAmountPaid, setInputInvoiceAmountPaid] = useState(0);
    const [inputInvoiceBoxes, setInputInvoiceBoxes] = useState(0);
    
    
    const [initialDatesValues, setInititalDates] = React.useState({from: dayjs().subtract(0,'day'),to: dayjs(),});
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
        if (user && user.id) {
            getAllInvoices(selectedStatus, selectedInvoiceType);
        }
    }, [user, selectedStatus, selectedInvoiceType]);

    // Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'decimal',  // Use 'currency' for currency formatting
        minimumFractionDigits: 2,  // Minimum number of digits after the decimal
        maximumFractionDigits: 2   // Maximum number of digits after the decimal
    });


    // Get requests for a particular role
    // role – SuperAdmin
    async function getAllInvoices(status, invoiceType = selectedInvoiceType){
        
        setSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result = await getInvoicesByStatusDataAPI(process.env.NEXT_PUBLIC_API_PASS, status, invoiceType);
            const queryResult = await result.json() // get data
// console.log(queryResult);

            // check for the status
            if(queryResult.status == 200){

                const invoices = queryResult.data || [];
                setAllInvoices(invoices);
                setAllInvoicesFiltered(invoices);
                setTotalInvoicesCount(queryResult.total || 0);
                setInvoiceSummary(queryResult.summary || {});
                setDataFound(invoices.length > 0);
                setCompleted(false);
            }
            else if(queryResult.status == 401) {
                
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllInvoices([]);
                setAllInvoicesFiltered([]);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                
                setSearching(false);
                setDataFound(false);
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
        finally {
            setSearching(false);
        }
}

    async function getMatchingAllInvoices(invoiceNo){
        
        
        setOtherSearching(true);
        // setOffset(offset+0); // update the offset for every call

        try {    
            const result  = await getMatchingInvoicesDataAPI(process.env.NEXT_PUBLIC_API_PASS, invoiceNo, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role) 
            const queryResult = await result.json() // get data
// console.log(queryResult);

            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){

                    // if(allInvoicesFiltered.length > 0){
                        // setAllInvoices(allInvoicesFiltered.push(queryResult.data));
                        // setAllInvoicesFiltered(allInvoicesFiltered.push(queryResult.data));
                        
                    // }
                    // else{
                        
                        // setAllInvoices(queryResult.data);
                        setAllInvoicesFiltered(queryResult.data);
                        
                    // }
                    
                }
                else {
                    setDataFound(false);
                }

                setOtherSearching(false);
            }
            else if(queryResult.status == 401) {
                
                setOtherSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllInvoices([]);
                toast({
                    description: "No more invoices",
                  })
                  
                  setOtherSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 201) {
                
                setOtherSearching(false);
                setDataFound(false);
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



    // Get all sales people data
    // role – SuperAdmin
    async function getSalesPersons(){
        
        setSearchingSales(true);

        try {    
            
            const result  = await getAllSalesPersonsDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, 'SalesManager', offset) 
            const queryResult = await result.json() // get data

            // console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setAllSalesPeople(queryResult.data);
                    
                    setDataFound(true);
                }
                else {
                    setAllSalesPeople([]);
                    setDataFound(false);
                }

                setSearchingSales(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401 || queryResult.status == 201 ) {
                setAllSalesPeople([]);
                setSearchingSales(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllSalesPeople([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                  setSearchingSales(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            
            toast({ description: "Issue loading. Please refresh or try again later!", })
        }
    }

    
    const getNextId = (list) => {
        // Extract numeric part from each ID and find the highest number
        const maxIdNumber = list.reduce((max, item) => {
        const currentIdNumber = parseInt(item.id.slice(1)); // Remove the prefix 'A' and parse the rest as an integer
        return Math.max(max, currentIdNumber);
        }, 0);
    
        // Increment the highest number to generate the next ID
        const nextIdNumber = maxIdNumber + 1;
    
        // Format the next ID by adding leading zeros if necessary (assuming IDs are always 4 characters long)
        const nextId = `A${String(nextIdNumber).padStart(3, '0')}`;
    
        return nextId;
    };

    
    function filterByStates(status){
        setSearchQuery('');
        setselectedStatus(status);
    }

    function filterByInvoiceType(invoiceType){
        setSearchQuery('');
        setSelectedInvoiceType(invoiceType);
    }
    

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);  // Update state
        } else {
            console.log("No file selected.");
        }
    };
    
    
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
                
                // Replace '/' with '***' in the invoiceNo field for each item in the data array
                const updatedData = data.map(item => {
                    if (item.invoiceNo) {
                        item.invoiceNo = item.invoiceNo.replace('/', '***');
                    }
                    return item;
                });
                // Optionally process amounts to ensure they are decimals with two decimal places
                // const processedData = data.map(item => ({
                //     ...item,
                //     amount: typeof item.amount === 'number' ? parseFloat(item.amount.toFixed(2)) : item.amount,
                // }));
    
    
                // setItems(data);
                // getInvoiceDataDetails(data);
                getInvoiceDataDetails(updatedData);
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

                // getAllInvoices('','');

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


  // Function to handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if(value.length == 0){
        setSearchQuery('');
        setAllInvoicesFiltered(allInvoices);
    }
    else {
        const query = value.toLowerCase();
        setSearchQuery(query);

        const filtered = allInvoices.filter(invoice => invoice.invoiceNo.toLowerCase().includes(query) );
        setAllInvoicesFiltered(filtered);
    }
  };

  function downloadNow() {
    console.log("Downloading...");

    // Map the data to include only the required fields with new key names
    const result = allInvoicesFiltered.map(invoice => ({
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        invoiceDate: dayjs(invoice.invoiceDate).format("YYYY-MM-DD"),
        invoiceAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        dealerId: invoice.billTo,       // Renaming `billTo` to `dealer`
        expiryDate: dayjs(invoice.expiryDate).format("YYYY-MM-DD")   // Renaming `totalAmount` to `amount`
    }));

    // Create and export the Excel file
    const worksheet = xlsx.utils.json_to_sheet(result);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    xlsx.writeFile(workbook, 'Invoices_' + dayjs(today.toDate()).format("DD-MM-YYYY").toString() + '.xlsx');
}
    

  // Function to handle row click and open the invoice dialog
  const handleRowClick = (invoice) => {

    setSelectedTotalAmount(invoice.totalAmount);
    setSelectedAmountPaid(invoice.amountPaid);
    setSelectedPendingAmount(invoice.pending);
    setSelectedInvoice(invoice);
    setIsInvoiceDetailsOpen(true);
    
  };

  // Function to handle row click and open the sheet
  const handleDeleteClick = (invoice) => {

    // setSelectedInvoice(invoice); // Set the selected dealer
    setSelectedInvoiceForDelete(invoice); // Set the selected dealer
    setIsDialogOpen(true); // Open the sheet
    
  };


  // Change amount changes
  const handleTotalAmountChange = (e) => {

    if(e.target.value.length == 0){
        setSelectedAmountPaid(selectedInvoice.totalAmount);
        setSelectedPendingAmount(Math.abs(selectedInvoice.amountPaid-selectedAmountPaid));
    }
    else {
        setSelectedTotalAmount(parseFloat(e.target.value) || 0)
        setSelectedPendingAmount(Math.abs(selectedAmountPaid-parseFloat(e.target.value)));

    }
  };
  
  // Change amount changes
  const handleAmountPaidChange = (e) => {

    if(e.target.value.length == 0){
        setSelectedAmountPaid(selectedInvoice.amountPaid);
        setSelectedPendingAmount(Math.abs(selectedAmountPaid-selectedInvoice.amountPaid));
    }
    else if(parseFloat(e.target.value) > selectedTotalAmount ){
        toast({description: "Amount Paid is more than the invoice amount",});
    }
    else {
        setSelectedAmountPaid(parseFloat(e.target.value) || 0)
        setSelectedPendingAmount(Math.abs(selectedTotalAmount-parseFloat(e.target.value)));

    }
  };
  function validateInvoiceNo(invoiceNo) {
    const regex = /^[A-Za-z0-9]{3}-..-..\/\d{4}$/;
    return regex.test(invoiceNo);
  }
  
  // Change amount changes
//   const handlePendingChange = (e) => {

//     if(e.target.value.length == 0){
        
//     }
//     else if(parseFloat(e.target.value) > selectedInvoice.totalAmount ){
//         toast({description: "Amount Paid is more than the invoice amount",});
//     }
//     else {
//         setSelectedPendingAmount(parseFloat(e.target.value) || 0)
//         setSelectedAmountPaid(Math.abs(selectedInvoice.amountPaid-parseFloat(e.target.value)));

//     }
//   };
  

    // Update selected invoices of selected dealer
    async function updateSelectedInvoices(){
        
        // const invoicesWithAppliedAmount = dealerInvoices.filter(invoice => invoice.appliedAmount > 0);
        
        // check if atleast 1 invoice is selected.
        if(selectedTotalAmount > 0){
            setUpdatingInvoice(true);


            try {    
                console.log("/api/v2/amount/"+process.env.NEXT_PUBLIC_API_PASS+"/U8/"+encodeURIComponent(JSON.stringify(selectedInvoice.invoiceNo))+"/"+selectedTotalAmount+"/"+selectedAmountPaid+"/"+selectedPendingAmount);
                const result  = await updateSelectedInvoicesDataForSelectedAPI(process.env.NEXT_PUBLIC_API_PASS, encodeURIComponent(JSON.stringify(selectedInvoice.invoiceNo)), selectedTotalAmount, selectedAmountPaid, selectedPendingAmount, selectedInvoice.invoiceId); 
                const queryResult = await result.json() // get data

                
                // check for the status
                if(queryResult.status == 200){
                    
                    handleInvoiceDialogChange(false);
                    getAllInvoices(selectedStatus);
                    setUpdatingInvoice(false);
                    
                    
                }
                else if(queryResult.status == 401 || queryResult.status == 201 ) {
                    // setDealerInvoices([]);
                    setUpdatingInvoice(false);
                    
                }
                else if(queryResult.status == 404) {
                    // setDealerInvoices([]);
                    toast({
                        description: "No more",
                    })
                    
                    setUpdatingInvoice(false);
                    
                }
            }
            catch (e){
                console.log(e);
                
                toast({ description: "Issue loading. Please refresh or try again later!", })
            }
        }
        else {
            toast({ description: "Adjust amount of invoice", })
        }
    }


    // Create invoice
    async function createInvoice(){
        
        // const invoicesWithAppliedAmount = dealerInvoices.filter(invoice => invoice.appliedAmount > 0);
        
        // check if atleast 1 invoice is selected.
        
            setCreatingInvoice(true);

            try {    
                // console.log("/api/v2/payments/"+process.env.NEXT_PUBLIC_API_PASS+"/webbulk/"+dealerId+"/"+totalCredit+"/"+encodeURIComponent(JSON.stringify(invoicesWithAppliedAmount))+"/-/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/-");
                const result  = await createSingleInvoiceDataForSelectedAPI(JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, process.env.NEXT_PUBLIC_API_PASS, inputInvoiceNo, inputInvoiceType, dayjs(inputInvoiceDate).format("YYYY-MM-DD hh:mm:ss").toString(), inputInvoiceDealer, inputInvoiceTotalAmount, inputInvoiceAmountPaid, dayjs(dayjs(inputInvoiceDate).add(45, 'day')).format("YYYY-MM-DD hh:mm:ss").toString(), inputInvoiceBoxes ); 
                const queryResult = await result.json() // get data

                console.log(queryResult);
                // check for the status
                if(queryResult.status == 200){

                      
                    toast({ description: "Invoice Created!", })
                    // reset the numbers to 0
                    setCreatingInvoice(false);
                    
                    
                }
                else if(queryResult.status == 401 || queryResult.status == 201 ) {
                    // setDealerInvoices([]);
                    
                    setCreatingInvoice(false);
                    
                }
                else if(queryResult.status == 404) {
                    // setDealerInvoices([]);
                    toast({
                        description: "No more",
                    })
                    
                    setCreatingInvoice(false);
                    
                }
            }
            catch (e){
                console.log(e);
                
                toast({ description: "Issue loading. Please refresh or try again later!", })
            }
    }

    // Delete selected invoice
    async function deleteSelectedInvoice(){
        
        // const invoicesWithAppliedAmount = dealerInvoices.filter(invoice => invoice.appliedAmount > 0);
        
        // check if atleast 1 invoice is selected.
        
            setDeletingInvoice(true);


            try {    
                // console.log("/api/v2/payments/"+process.env.NEXT_PUBLIC_API_PASS+"/webbulk/"+dealerId+"/"+totalCredit+"/"+encodeURIComponent(JSON.stringify(invoicesWithAppliedAmount))+"/-/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/-");
                const result  = await deleteSelectedInvoicesDataForSelectedAPI(process.env.NEXT_PUBLIC_API_PASS, selectedInvoiceForDelete.invoiceId, selectedInvoiceForDelete.invoiceNo); 
                const queryResult = await result.json() // get data

                // console.log(queryResult);
                // check for the status
                if(queryResult.status == 200){

                    setSelectedInvoiceForDelete('');
                    setIsDialogOpen(false);
                    toast({ description: "Invoice Deleted!", })
                    setDeletingInvoice(false);
                    getAllInvoices(selectedStatus);
                    
                    
                }
                else if(queryResult.status == 401 || queryResult.status == 201 ) {
                    // setDealerInvoices([]);
                    setSelectedInvoiceForDelete('');
                    setDeletingInvoice(false);
                    
                }
                else if(queryResult.status == 404) {
                    // setDealerInvoices([]);
                    toast({
                        description: "No more",
                    })
                    setSelectedInvoiceForDelete('');
                    setDeletingInvoice(false);
                    
                }
            }
            catch (e){
                console.log(e);
                
                toast({ description: "Issue loading. Please refresh or try again later!", })
            }
    }



  const handleInvoiceDialogChange = (isOpen) => {
    setIsInvoiceDetailsOpen(isOpen);

    if (!isOpen) {
      setSelectedInvoice('');
      setSelectedTotalAmount(0);
      setSelectedAmountPaid(0);
      setSelectedPendingAmount(0);
      setUpdatingInvoice(false);
    }
  };
  
  function navigateToCreate(){
    // biscuits.set('selectedTab', 'Dashboard', {path: '/', expires: new Date(Date.now() + 10800000)})
    router.push('/invoices/create')
  }



  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div className={`${inter.className} flex w-full min-w-0 flex-col gap-4 pb-6`}>
            
          <div className='flex w-full flex-row items-center gap-2 py-4' >
              <h2 className="text-xl font-semibold mr-4">Invoices</h2>
              
              
              {/* <Button className="text-white bg-green-600" onClick={navigateToCreate.bind(this)}><Receipt className='font-bold text-lg'/>&nbsp; Create Now</Button> */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="text-white bg-green-600"><Receipt className='font-bold text-lg'/>&nbsp; Upload Invoices</Button>
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
                </Sheet>
                
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="text-white bg-blue-600"><Receipt className='font-bold text-lg'/>&nbsp; Create Invoice</Button>
                    </SheetTrigger>
                    <SheetContent className='overflow-y-scroll'>
                        <SheetHeader>
                        <SheetTitle>Create Invoice</SheetTitle>
                        <SheetDescription>
                            Make sure you enter all details correctly. Click Create now to create.
                        </SheetDescription>
                        </SheetHeader>
                        
                        <div className='flex flex-col gap-8 mt-4 mb-4'>
                            <div className="flex flex-col gap-2 mt-4">
                                <Label htmlFor="invoiceNo">Invoice No:</Label>
                                <Input id="invoiceNo" type="text" value={inputInvoiceNo} onChange={(e) => setInputInvoiceNo(e.target.value)} placeholder="Enter Invoice No" />
                            </div>

                            {/* Invoice Type */}
                            <div className="flex flex-col gap-2">
                                <Label>Invoice Type:</Label>
                                <RadioGroup value={inputInvoiceType} onValueChange={(value) => setInputInvoiceType(value)} className='flex flex-row gap-4 mt-2'>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ATL" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer">ATL</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="VCL" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer">VCL</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Invoice Date */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="invoiceDate">Invoice Date:</Label>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    className="w-[240px] justify-start text-left font-normal"
                                    >
                                    {inputInvoiceDate ? dayjs(inputInvoiceDate).format('YYYY-MM-DD') : 'Pick a date'}
                                    <CalendarPlus className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={inputInvoiceDate}
                                    onSelect={(date) => setInputInvoiceDate(date)}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                            </div>

                            {/* Invoice Dealer */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="invoiceDealer">Dealer GST:</Label>
                                <Input id="invoiceDealer" type="text" value={inputInvoiceDealer} onChange={(e) => setInputInvoiceDealer(e.target.value)} placeholder="Enter Dealer GST" />
                            </div>

                            {/* Invoice Total Amount */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="totalAmount">Total Amount:</Label>
                                <Input id="totalAmount" type="number" value={inputInvoiceTotalAmount} onChange={(e) => setInputInvoiceTotalAmount(parseFloat(e.target.value) || 0)} placeholder="Total Invoice Amount" />
                            </div>

                            {/* Amount Paid */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="amountPaid">Amount Paid:</Label>
                                <Input id="amountPaid" type="number" value={inputInvoiceAmountPaid} onChange={(e) => setInputInvoiceAmountPaid( (parseFloat(e.target.value)>inputInvoiceTotalAmount ? inputInvoiceTotalAmount : parseFloat(e.target.value)) || 0)} placeholder="Enter Amount Paid" />
                            </div>

                            {/* Pending */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="pendingInput">Pending:</Label>
                                <Input disabled id="pendingInput" type="number" value={Math.abs(inputInvoiceTotalAmount-inputInvoiceAmountPaid)} placeholder="0" />
                            </div>

                            {/* Boxes included in this invoice */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="boxes">Boxes:</Label>
                                <Input id="boxes" type="number" value={inputInvoiceBoxes} onChange={(e) => setInputInvoiceBoxes(parseFloat(e.target.value) || 0)} placeholder="Total Boxes" />
                            </div>
                        </div>
                        
                        {/* <div className="grid gap-4 py-4">
                            <br/>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="InvoiceNo" className="text-right">
                                Invoice No
                                </Label>
                                <Input id="invoiceno" value={inputInvoiceNo} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="invoiceType" className="text-right">
                                Invoice Type
                                </Label>
                                <Input id="invoiceType" value={inputInvoiceType} className="col-span-3" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="picture">Data file</Label>
                                <Input id="picture" type="file" accept=".xlsx, .xls" onChange={handleFileSelect} />
                            </div>
                        </div> */}
                        <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={createInvoice}>Create now</Button>
                        </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                {uploadProgress ? <OperationProgress title="Uploading invoices" description="Processing the invoice file. Keep this page open." /> : null}

                {createProgress ? <OperationProgress title="Creating invoice" description="Saving the invoice. Keep this page open." /> : null}

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
          
           
          
         
    <div className="w-full min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">{totalInvoicesCount} invoices in total</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing {allInvoices.length} {selectedInvoiceType === 'All' ? '' : selectedInvoiceType + ' '}{selectedStatus === 'All' ? 'invoices' : selectedStatus + ' invoices'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {['NotPaid', 'PartialPaid', 'Paid'].map((status) => {
          const stat = invoiceSummary[status] || { count: 0, pending: 0 };
          const isOutstanding = status !== 'Paid';
          return (
            <Card key={status} className={selectedStatus === status ? 'border-primary bg-primary/5 shadow-none' : 'shadow-none'}>
              <CardHeader className="p-4 pb-0">
                <CardDescription>{status === 'NotPaid' ? 'Not paid' : status === 'PartialPaid' ? 'Partially paid' : 'Paid'}</CardDescription>
                <CardTitle className="text-2xl">{stat.count}</CardTitle>
              </CardHeader>
              <CardContent className={`p-4 pt-3 text-xs font-medium ${isOutstanding ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOutstanding ? `Pending: ₹${formatter.format(stat.pending)}` : 'Settled invoices'}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="text" placeholder="Search invoice number" value={searchQuery} onChange={handleSearchChange} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedInvoiceType} onValueChange={filterByInvoiceType} disabled={searching}>
            <SelectTrigger className="w-[132px]">
              <SelectValue placeholder="Invoice type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All types</SelectItem>
                <SelectItem value="ATL">ATL</SelectItem>
                <SelectItem value="VCL">VCL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={filterByStates} disabled={searching}>
            <SelectTrigger className="w-[168px]">
              {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="NotPaid">Not paid</SelectItem>
                <SelectItem value="PartialPaid">Partially paid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="All">All statuses</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadNow} disabled={searching || allInvoicesFiltered.length === 0}>
            <ArrowDown className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      {searching ? (
        <Card className="w-full rounded-md shadow-none">
          <CardContent className="flex min-h-[320px] items-center justify-center pt-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading invoices...</span>
          </CardContent>
        </Card>
      ) : (

<Card className="w-full rounded-md shadow-none">
    <Table className="min-w-[1080px]">
        <TableHeader>
            <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead className="text-right">Boxes</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            
            {allInvoicesFiltered?.length ? allInvoicesFiltered.map((row) => (
                <TableRow key={row.id} >
                    <TableCell>
                        <Button variant="link" className="h-auto gap-2 p-0 font-semibold" onClick={() => handleRowClick(row)}>
                            <FileText className="h-4 w-4" />
                            <span>{row.invoiceNo}</span>
                            <span className="text-xs font-semibold text-muted-foreground">{row.invoiceType}</span>
                        </Button>
                    </TableCell>
                    <TableCell>
                        <div className="max-w-[260px]">
                            <p className="truncate font-medium">{row.name}</p>
                            <p className="text-xs text-muted-foreground">Issued {dayjs(row.invoiceDate).format("DD MMM YY")}</p>
                        </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                        {row.sales !== '-' && row.sales != null ? row.sales : '—'}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{dayjs(row.expiryDate).format("DD MMM YY")}</span>
                            <Badge variant="outline" className={dayjs(row.expiryDate).diff(dayjs(), 'days') >= 0 ? 'w-fit border-amber-200 bg-amber-50 text-amber-700' : 'w-fit border-rose-200 bg-rose-50 text-rose-700'}>
                              <CalendarClock className="mr-1 h-3 w-3" />
                              {dayjs(row.expiryDate).diff(dayjs(), 'days') >= 0 ? `${dayjs(row.expiryDate).diff(dayjs(), 'days')} days left` : `${Math.abs(dayjs(row.expiryDate).diff(dayjs(), 'days'))} days overdue`}
                            </Badge>
                        </div>
                    </TableCell>
                        <TableCell>
                            <div>
                                <p className={row.status === 'Paid' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>₹{formatter.format(row.pending)}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">of ₹{formatter.format(row.totalAmount)}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={row.status === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : row.status === 'PartialPaid' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'}>
                                {row.status === 'PartialPaid' ? 'Partially paid' : row.status === 'NotPaid' ? 'Not paid' : row.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {deletingInvoice ?
                            <div className="flex flex-row m-12">    
                                <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                <p className={`${inter.className} ${styles.text3}`}>Deleting...</p> 
                            </div>
                            :
                            <div className="flex flex-row items-center gap-2">
                                <Button variant='ghost' size='icon' className="text-destructive hover:text-destructive" onClick={()=>{handleDeleteClick(row)}} aria-label={`Delete ${row.invoiceNo}`}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {/* <Button variant='outline' className="mx-2 px-2 text-red-600" onClick={()=>{setSelectedInvoice(row),setIsDialogOpen(true)}}><Trash size={24} className="text-red-600"/> &nbsp;Delete</Button>             */}
                                {/* Dialog Component */}
                                
                            </div>
                            }
                        </TableCell>
                    {/* <TableCell> */}
                    {/* {allSalesPeople.length == 0 ? getSalesPersons() : null}} */}
                            {/* <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant='outline' className="mx-2 px-2 text-green-600" onClick={()=>selectDealerForUpdate(row)}><PencilSimpleLine size={24} className="text-green-600"/> &nbsp;Edit</Button>            
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                    <SheetTitle>Edit {row.accountName}</SheetTitle>
                                    <SheetDescription>
                                        Edit details below and click update.
                                    </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid gap-4 py-4">
                                        <br/>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                            Name
                                            </Label>
                                            <Input id="name" disabled value={row.accountName} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">
                                            Email
                                            </Label>
                                            <Input id="email" value={updateEmail} className="col-span-3" onChange={(e)=>setUpdateEmail(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="mobile" className="text-right">
                                            Mobile
                                            </Label>
                                            <Input id="mobile" value={updateMobile} className="col-span-3" onChange={(e)=>setUpdateMobile(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="mobile" className="text-right">
                                            Map To:
                                            </Label>
                                            {searchingSales ?
                                                <div className="flex flex-row m-12">    
                                                    <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                                                    <p className={`${inter.className} ${styles.text3}`}>Loading sales persons...</p> 
                                                </div>
                                                :
                                                <Select defaultValue={row.mapTo} onValueChange={(e)=>setSelectedMapToPerson(e)} >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a fruit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                        {allSalesPeople.map((row) => (
                                                        <SelectItem key={row.id} value={row.id} >{row.name}</SelectItem>))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            }
                                        </div>
                                    </div>
                                    <SheetFooter>
                                    <SheetClose asChild>
                                        <Button type="submit" className="bg-blue-600 text-white" onClick={()=>updateDealer(row.id)}>Update</Button>
                                    </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet> */}
                        {/* {row.isActive == 1 ?
                            <Button variant='outline' className="mx-2 px-2 text-red-600" onClick={()=>updateActiveStatus(row.id, 0)}><UserMinus size={24} className="text-red-600"/> &nbsp;Deactivate</Button>
                            : <Button variant='outline' className="mx-2 px-2 text-blue-600" onClick={()=>updateActiveStatus(row.id, 1)}><UserPlus size={24} className="text-blue-600"/> &nbsp;Activate</Button>
                        } */}
                    {/* </TableCell> */}
                </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                        No invoices found for this status.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
</Card>
      )}

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent>
    <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
        Are you sure you want to delete this invoice? This action cannot be undone.
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
</Dialog>

<Dialog open={isInvoiceDetailsOpen} onOpenChange={handleInvoiceDialogChange}>
  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
    {selectedInvoice ? (
      <>
        <DialogHeader>
          <div className="flex items-center gap-2 pr-8">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>{selectedInvoice.invoiceNo}</DialogTitle>
            <Badge variant="outline">{selectedInvoice.invoiceType}</Badge>
          </div>
          <DialogDescription>{selectedInvoice.name} · Issued {dayjs(selectedInvoice.invoiceDate).format('DD MMM YYYY')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 border-y py-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Due date</p>
            <p className="mt-1 font-medium">{dayjs(selectedInvoice.expiryDate).format('DD MMM YYYY')}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current status</p>
            <Badge variant="outline" className="mt-1">{selectedInvoice.status}</Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Dealer ID</p>
            <p className="mt-1 font-medium">{selectedInvoice.billTo}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Boxes</p>
            <p className="mt-1 font-medium">{selectedInvoice.sales !== '-' && selectedInvoice.sales != null ? selectedInvoice.sales : '—'}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice-total-amount">Invoice amount</Label>
            <Input type="number" id="invoice-total-amount" value={selectedTotalAmount} onChange={handleTotalAmountChange} placeholder="Enter amount" />
            <p className="text-xs text-muted-foreground">Previous: ₹{formatter.format(selectedInvoice.totalAmount)}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-amount-paid">Amount paid</Label>
            <Input type="number" id="invoice-amount-paid" value={selectedAmountPaid} onChange={handleAmountPaidChange} placeholder="Enter amount" />
            <p className="text-xs text-muted-foreground">Previous: ₹{formatter.format(selectedInvoice.amountPaid)}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="invoice-pending-amount">Outstanding amount</Label>
            <Input disabled type="number" id="invoice-pending-amount" value={selectedPendingAmount} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleInvoiceDialogChange(false)} disabled={updatingInvoice}>Close</Button>
          <Button onClick={updateSelectedInvoices} disabled={updatingInvoice}>
            {updatingInvoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update invoice
          </Button>
        </DialogFooter>
      </>
    ) : null}
  </DialogContent>
</Dialog>

      {/* <DataTable data={allInvoices} dataOffset={offset} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/> */}
      {/* <DataTable columns={columns} data={allInvoices} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}

    </div>

    </div>

  );
}
