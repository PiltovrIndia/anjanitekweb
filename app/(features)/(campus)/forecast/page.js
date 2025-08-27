'use client'

import { Inter } from 'next/font/google'
import { ChartLine, Check, Checks, Copy, FileXls, PaperPlaneRight, PresentationChart, SpinnerGap,  X } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
import { Label } from "@/app/components/ui/label"
import { Skeleton } from "@/app/components/ui/skeleton"
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle, } from "@/app/components/ui/card"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/app/components/ui/table"




// import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Toaster } from "../../../components/ui/sonner"
import { useToast } from "@/app/components/ui/use-toast"
import { Textarea } from "@/app/components/ui/textarea"
import { Button } from "@/app/components/ui/button"

  
// import {columns} from "./columns"
// import {DataTable} from "./data-table"

// import { columns } from "@/app/components/columns"
// import { DataTable } from "@/app/components/data-table"
import { Input } from '@/app/components/ui/input';
import * as XLSX from 'xlsx';


const xlsx = require('xlsx');
// Child references can also take paths delimited by '/'


// get distinct months of the sales so far
const getDates = async (pass) => 
  
    fetch("/api/v2/foresee/"+pass+"/2", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get sales data till the selected month
const getSales = async (pass, month) => 
  
  
    fetch("/api/v2/foresee/"+pass+"/1/"+month, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

// get forecast data for the next month
const getForecast = async (pass, month, model) => 
  
  
    fetch("/api/v2/foresee/"+pass+"/1.5/"+month+"/"+model, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    

// pass state variable and the method to update state variable
export default function Forecasting() {
    
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
    
    const [downloading, setDownloading] = useState(false);
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const [senderMessagesList, setSenderMessagesList] = useState([]);
    
    const [dataFound, setDataFound] = useState(true); 
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [searchingStats, setSearchingStats] = useState(false);
    const [searching, setSearching] = useState(false);
    const [messaging, setMessaging] = useState(false);

    const [skusList, setSkusList] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedModel, setSelectedModel] = useState(0);
    // const [selectedMonthFormatted, setSelectedMonthFormatted] = useState('');
    const [datesList, setDatesList] = useState([]);
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
            // getAppStoreStats();
            // getDealerStats();
            getDatesData();
            
        }
    }, [user, completed]);

     async function getDatesData(){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            
            const result  = await getDates(process.env.NEXT_PUBLIC_API_PASS)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    const result = queryResult.data;
                    
                    if (result && result.length > 0) {
                    
                            setDatesList(result);
                            console.log(result);
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

    // get the sales data till the selected month
     async function getSalesData(selectedMonthFormatted){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getSales(process.env.NEXT_PUBLIC_API_PASS, selectedMonthFormatted)
            const queryResult = await result.json() // get data
            // console.log(queryResult);
            
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    const result = queryResult.data;
                    
                    if (result && result.length > 0) {
                    
                            setSkusList(result);
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

    // get the forecast data for the next month
     async function getForecastData(selectedMonthFormatted, model){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            console.log(selectedMonthFormatted, model);
            
            const result  = await getForecast(process.env.NEXT_PUBLIC_API_PASS, selectedMonthFormatted, model)
            const queryResult = await result.json() // get data
            // console.log(queryResult);
            
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    const result = queryResult.data;
                    
                    if (result && result.length > 0) {
                    
                        setSkusList(result);
                    
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
     
    async function copyData(){
        
        
        const table = document.getElementById('sales_data'); // Assuming your table has an ID
        if (table) {
        let data = '';
        // Iterate through rows and cells to build a string representation
        table.querySelectorAll('tr').forEach(row => {
            row.querySelectorAll('td, th').forEach((cell, index) => {
                if(cell.id === 'no-copy') return; // Skip cells with id 'no-copy'
            data += cell.innerText + (index === row.cells.length - 1 ? '' : '\t'); // Use tab for columns
            });
            data += '\n'; // Newline for rows
        });
        navigator.clipboard.writeText(data)
            .then(() => alert('Table data copied!'))
            .catch(err => console.error('Failed to copy: ', err));
        }
    
    }
    async function copyColumnData(){
        
        
        const table = document.getElementById('sales_data'); // Assuming your table has an ID
        if (table) {
        let data = '';
        // Iterate through rows and cells to build a string representation
        table.querySelectorAll('tr').forEach(row => {
            row.querySelectorAll('td, th').forEach((cell, index) => {
                if(cell.id === 'forecastedMonth' || cell.id === 'forecastedValue')  // Skip cells with id 'no-copy'
                    data += cell.innerText + (index === row.cells.length - 1 ? '' : '\t'); // Use tab for columns
            });
            data += '\n'; // Newline for rows
        });
        navigator.clipboard.writeText(data)
            .then(() => alert('Table data copied!'))
            .catch(err => console.error('Failed to copy: ', err));
        }
    
    }


    
    
  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'row', alignItems:'flex-start',height:'100vh',gap:'8px'}}>
            
         
    <div className={styles.verticalsection} style={{height:'90vh', width:'100%',gap:'8px',overflow: 'auto', scrollBehavior:'smooth'}}>

    <div className='flex flex-row gap-2 items-center py-4' >
        <h2 className="text-lg font-semibold mr-4">Forecast</h2>
 
                                      
                                        
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

<div className='flex flex-row gap-4 justify-between items-center w-full'>
                
                <p className='text-nowrap'>Data till:</p>
                <select
                    className="border border-gray-300 rounded inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"
                    value={selectedMonth}
                    onChange={e => {
                        // setSelectedMonthFormatted(dayjs(e.target.value).format('YYYY-MM-DD').toString());
                        setSelectedMonth(e.target.value);
                        
                        getSalesData(dayjs(e.target.value).format('YYYY-MM-DD').toString());
                    }}
                >
                    <option value="">Select Month</option>
                    {datesList.map((date, idx) => (
                        <option key={idx} value={date.date}>
                            {dayjs(date.date).format('MMM-YYYY').toString()}
                        </option>
                    ))}
                </select>
                
                <select
                    className="border border-gray-300 rounded inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"
                    value={selectedModel}
                    onChange={e => {
                        setSelectedModel(e.target.value);
                    }}
                >
                    <option value="">Select Forecast Model</option>
                    
                        <option key={1} value={1}>SES</option>
                        <option key={2} value={2}>Croston</option>
                        <option key={3} value={3}>TSB</option>
                    
                </select>

                

                <Button className="text-white bg-green-600" onClick={()=>getForecastData(dayjs(selectedMonth).format('YYYY-MM-DD').toString(), selectedModel)}><ChartLine className='font-bold text-lg'/>&nbsp; Forecast</Button>
                
                {skusList.length > 0 ?
                <Button className="text-black bg-gray-200 hover:bg-gray-300" onClick={()=>copyData()}><Copy className='font-bold text-lg'/>&nbsp; Copy data</Button>
                : ''}
            </div>

{/* {(allRequests.length !=0) ? */}
<div className="mx-auto" style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',gap:'10px'}}>

    {/* {searchingStats ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
        
            } */}
        <div className='w-full overflow-auto'>

        <Card>
            <Table id="sales_data">
                <TableHeader>
                            <TableRow>
                                <TableHead className="border-r border-gray-200 text-xs text-nowrap">S.No</TableHead>
                                <TableHead className="border-r border-gray-200 text-xs text-nowrap">Design</TableHead>
                                {skusList.length > 0 ? (
                                                    skusList[0]["dates"].map((saleDate, index) => (
                                                        <TableHead className="border-r border-gray-200 text-xs text-nowrap">{saleDate}</TableHead>
                                                    ))
                                                ) : ''}
                                {(skusList.length > 0 && skusList[0]["forecast"] != null) ?
                                    <TableHead className="flex flex-row items-center gap-2 text-nowrap text-xs text-nowrap" id="forecastedMonth">{dayjs(skusList[0]["nextMonth"]).format('MMM-YYYY')}
                                        <Copy className="font-bold text-xl cursor-pointer tracking-wider text-slate-800 bg-slate-100 px-2 py-1 w-fit rounded"  onClick={()=>copyColumnData()}/>
                                    </TableHead>
                                    : ''
                                }
                                
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {skusList.length > 0 ? (
                                skusList.map((sku, index) => (
                                    <TableRow key={sku.sku} className="hover:bg-gray-50">
                                        <TableCell className="border-r border-gray-200 px-4 py-2 text-nowrap text-sm">{index + 1}</TableCell>
                                        <TableCell className="border-r border-gray-200 px-4 py-2 text-nowrap text-sm">{sku.sku || '-'}</TableCell>

                                        {sku.sale.map((saleValue, saleIndex) => (
                                            <TableCell key={saleIndex} className="border-r border-gray-200 px-4 py-2 text-nowrap text-sm">{saleValue || '-'}</TableCell>
                                        ))}

                                        {(sku.forecast != null) ?
                                            <TableCell id="forecastedValue" className="px-4 py-2 text-nowrap text-sm bg-green-100">{sku.forecast || '-'}</TableCell>
                                            : ''
                                        }

                                        {/* <td className="border border-gray-300 px-4 py-2 text-nowrap text-slate-600 text-xs">{sku.nextMonth ? dayjs(sku.nextMonth).format('MMM-YYYY') : '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{sku.alpha || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{sku.forecast || '-'}</td> */}
                                        
                                    </TableRow>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="border border-gray-300 px-4 py-2 text-nowrap text-center">
                                        Select month to view data
                                    </td>
                                </tr>
                            )}
                        </TableBody>
            </Table>
        {/* <table id="sales_data" className="table-auto border-collapse border border-gray-300 w-full text-left overflow-auto">
                                            <thead>
                                            <tr>
                                                <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-nowrap text-xs">S.No.</th>
                                                <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-nowrap text-xs">Design</th>
                                                
                                                {skusList.length > 0 ? (
                                                    skusList[0]["dates"].map((saleDate, index) => (
                                                        <th className="bg-gray-100 border border-gray-300 px-4 py-2 text-nowrap text-xs">{saleDate}</th>
                                                          
                                                    ))
                                                ) : ''}

                                                {(skusList.length > 0 && skusList[0]["forecast"] != null) ?
                                                    <th id="forecastedMonth" className="border border-gray-300 px-4 py-2 text-nowrap text-xs text-white bg-green-600">{dayjs(skusList[0]["nextMonth"]).format('MMM-YYYY')}
                                                    <Button className="text-white bg-gray-600" onClick={()=>copyColumnData()}><Copy className='font-bold text-lg'/></Button>
                                                    </th>
                                                    : ''
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {skusList.length > 0 ? (
                                                skusList.map((sku, index) => (
                                                    <tr key={sku.sku} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{index + 1}</td>
                                                        <td className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{sku.sku || '-'}</td>

                                                        {sku.sale.map((saleValue, saleIndex) => (
                                                            <td key={saleIndex} className="border border-gray-300 px-4 py-2 text-nowrap text-sm">{saleValue || '-'}</td>
                                                        ))}

                                                        {(sku.forecast != null) ?
                                                            <td id="forecastedValue" className="border border-gray-300 px-4 py-2 text-nowrap text-sm bg-green-100">{sku.forecast || '-'}</td>
                                                            : ''
                                                        }
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="border border-gray-300 px-4 py-2 text-nowrap text-center">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>  */}
                                    </Card>
                                    </div>
    </div>
   
               
                
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

