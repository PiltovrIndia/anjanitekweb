'use client'

import { Inter, Montserrat } from 'next/font/google'
import { Check, Info, SpinnerGap, X, Plus } from 'phosphor-react'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Area, AreaChart } from 'recharts';
const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
// import ImageWithShimmer from '../../components/imagewithshimmer'
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// const storage = getStorage();
import firebase from '../../../../app/firebase';
import Toast from '../../../../app/components/myui/toast'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../../../../app/components/ui/card"
  import { Input } from "../../../../app/components/ui/input"
  import { Label } from "../../../../app/components/ui/label"
  import { Button } from "../../../../app/components/ui/button"
  import { Skeleton } from "../../../../app/components/ui/skeleton"
  import { Toaster } from "../../../../app/components/ui/sonner"
  import { toast, ToastAction } from "sonner"

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
// const storage = getStorage(firebase, "gs://smartcampusimages-1.appspot.com");
import * as XLSX from 'xlsx';


// Create a child reference
// const imagesRef = ref(storage, 'images');
// imagesRef now points to 'images'

// Child references can also take paths delimited by '/'
// const spaceRef = ref(storage, '/');

// const spaceRef = ref(storage, 'images/space.jpg');
// check for the user
const getPending = async (pass, role, branch) => 
  
fetch("/api/v2/amount/"+pass+"/U5", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get dealer count by location
const getStats = async (pass, role, branch) => 
  
fetch("/api/v2/dealerstats/"+pass+"/0", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// const spaceRef = ref(storage, 'images/space.jpg');
// check for the user
const updateUploadData = async (pass, items1, adminId) => 
// userId, paymentAmount, type, transactionId, paymentDate,
// userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
fetch("/api/v2/payments/"+pass+"/web/"+encodeURIComponent(JSON.stringify(items1))+"/"+adminId+"/-", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});



// pass state variable and the method to update state variable
export default function Dashboard() {

    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [branch, setBranch] = useState('');
    const [offset, setOffset] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [items, setItems] = useState([]);
    const [file, setFile] = useState(null); 
    
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [dueDate, setDueDate] = useState(0);
    const [invoicesList, setInvoicesList] = useState([]);
    const [regionsList, setRegionsList] = useState([]);
    const [daysLeft, setDaysLeft] = useState(0);

    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    const [studentsList, setStudentsList] = useState();
    const [dataFound, setDataFound] = useState(true); // use to declare 0 rows
    const [inputError, setInputError] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchingStats, setSearchingStats] = useState(false);

    const [outingData, setOutingData] = useState();
    // const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const webcamRef = React.useRef(null);
    //create new date object
    const today = new dayjs();
    // const { toast } = useToast()
    
    
// Create an instance of Intl.NumberFormat for Indian numbering system with two decimal places
const formatter = new Intl.NumberFormat('en-IN', {
    style: 'decimal',  // Use 'currency' for currency formatting
    minimumFractionDigits: 2,  // Minimum number of digits after the decimal
    maximumFractionDigits: 2   // Maximum number of digits after the decimal
});


    // get the user and fire the data fetch
    useEffect(()=>{

        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj)
                
                if(!completed){
                    getData();
                    getDealerStats();
                    // getDataDetails();
                }
                else {
                    console.log("DONE READING");
                }
                
                // get the requests data if doesnot exist
                // if(!requests){

                //     // set the view by status based on the role
                //     if(obj.role == 'Student'){
                //         console.log('Student');
                //         setViewByStatus('Returned')
                //         getData(obj.role, 'Returned', obj.collegeId, obj.branch);
                //     }
                //     else if(obj.role == 'SuperAdmin' || obj.role == 'Admin'){
                //         console.log('SuperAdmin');
                //         setViewByStatus('Submitted')
                //         getData(obj.role, 'Submitted', obj.collegeId, obj.branch);
                //     }
                //     else if(obj.role == 'OutingAdmin' || obj.role == 'OutingIssuer'){
                //         console.log('OutingAdmin');
                //         setViewByStatus('Approved')
                //         getData(obj.role, 'Approved', obj.collegeId, obj.branch);
                //     }
                //     else if(obj.role == 'OutingAssistant'){
                //         console.log('OutingAssistant');
                //         setViewByStatus('Issued')
                //         getData(obj.role, 'Issued', obj.collegeId, obj.branch);
                //     }   
                // }
            }
            else{
                console.log('Not found')
                router.push('/')
            }

            // if (inView) {
            //     console.log("YO YO YO!");
            //   }
    // });
    // This code will run whenever capturedStudentImage changes
    // console.log('capturedStudentImage'); // Updated value
    // console.log(capturedStudentImage); // Updated value


    },[]);

    // }, [webcamRef]);
   


    // get the requests data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getData(){
        
        setSearching(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getPending(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).branch)
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
                    var invoicesList;
                    if (result && result.length > 0) {
                        
                        // Calculate total sum of pending amounts
                        const totalSum = result.reduce((sum, invoice) => sum + invoice.pending, 0);

                            // Find the earliest expiry date
                            const earliestExpiryDate = result
                            .map(invoice => dayjs(invoice.expiryDate))  // Convert all expiry dates to dayjs objects
                            .reduce((earliest, currentExpiry) => {
                                return earliest.isBefore(currentExpiry) ? earliest : currentExpiry;
                            }, dayjs('9999-12-31'));
               
                            // Calculate the difference in days
                            const today = dayjs();  // Gets today's date
                            const daysBetween = earliestExpiryDate.diff(today, 'day');  // 'day' ensures the difference is calculated in days

                            // Format the earliest date in a friendly format, e.g., January 1, 2023
                            // const formattedDate = formatDate(earliestExpiryDate, 'MMMM d, yyyy');
                            const formattedDate = dayjs(earliestExpiryDate).format('MMMM D, YYYY');

                            setInvoicesList(result);
                            setTotalOutstanding(totalSum);
                            setDueDate(formattedDate);
                            setDaysLeft(daysBetween);

                            console.log("found.");
                        
                      } else {
                        console.log("No invoices data found.");
                      }
                   
                    setDataFound(true);
                    setSearching(false);
                }
                else {
                    
                    setDataFound(false);
                }

                setSearching(false);
                setCompleted(false);
            }
            else {
                
                setSearching(false);
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

    // get dealer stats
    async function getDealerStats(){
        
        setSearchingStats(true);
        setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getStats(process.env.NEXT_PUBLIC_API_PASS)
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

                            console.log("found.");
                        
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


    // get the requests data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getDataDetails(items1){
        
        setUploadProgress(true);
        
        try {    
            const result  = await updateUploadData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId)
            const queryResult = await result.json() // get data
            console.log("Call2 for Upload...");
            // check for the status
            if(queryResult.status == 200){


                setUploadProgress(false);

                toast("Data is uploaded", {
                    description: "Refresh to view updated data",
                    action: {
                      label: "Okay",
                      onClick: () => console.log("Okay"),
                    },
                  })

                // toast("Event has been created.")

            }
            else {
                
                setUploadProgress(false);
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

const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);  // Update state
    } else {
        console.log("No file selected.");
    }
};

const processData = (e) => {
    console.log("Uploading...");
    
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


            setItems(data);
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


    
  return (
    
        <div  className={montserrat.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h1 className='text-xl font-bold'>Dashboard</h1>
              
              <Sheet>
                <SheetTrigger asChild>
                    <Button>Upload data</Button>
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
                        {/* <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                            Name
                            </Label>
                            <Input id="name" value="Pedro Duarte" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                            Username
                            </Label>
                            <Input id="username" value="@peduarte" className="col-span-3" />
                        </div> */}
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
          </div>      

            {/* <div style={{width:'100%',display:'flex', flexDirection:'row',justifyContent:'space-between'}}>
                <div className={styles.horizontalsection}>
                    <div className={`${styles.primarybtn} `} style={{display:'flex', flexDirection:'row', width:'fit-content', cursor:'pomontserrat', gap:'4px'}}> 
                        <Plus />
                        <p className={`${montserrat.className}`}>New circular</p>
                    </div>
                    <div className={`${styles.overlayBackground} ${showAddStudent ? styles.hideshowdivshow : styles.hideshowdiv}`}>
                        <AddStudent toggleAddStudentOverlay={toggleAddStudentOverlay}/> 
                    </div>
                </div>
               
            </div> */}
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
            <Toaster />
        <div className={styles.verticalsection} style={{height:'80vh', width:'100%',gap:'8px'}}>

        <div className={styles.horizontalsection} style={{height:'100%', width:'100%'}}>

                <div key={1234} style={{height:'100%', width:'100%', }}>
                       
                    <div className='flex flex-col gap-2' style={{width:'100%',overflow:'scroll'}}>
                        

                        <Card className="w-[350px]">
                            <CardHeader>
                                {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : <CardTitle>₹{formatter.format(totalOutstanding)}</CardTitle>}
                                <CardDescription>Total outstanding</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form>
                                <div className="grid w-full items-center gap-4">
                                    {/* <div className="flex flex-col space-y-1.5">
                                        <Label>Latest end date</Label>
                                        <p >{dueDate}</p>
                                    </div> */}
                                    <div className="flex flex-col space-y-1.5">
                                        <Label>Pending invoices</Label>
                                        <p >{invoicesList.length}</p>
                                    </div>
                                    
                                </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant='outline' onClick={()=>getData()}>Refresh</Button>
                            </CardFooter>
                        </Card>
                        
                        <br/>
                        <h2 className='text-l font-semibold'>Dealers by region and outstanding</h2>
                        
                        {searchingStats ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
                        <div className="flex flex-row gap-2" >
                        {regionsList.map(regionItem => (
                            
                                <Card className="w-[250px]" key={regionItem.state}>
                                    <br/>
                                    <CardContent>
                                        <form>
                                        <p className='text-l font-semibold text-green-700'>{regionItem.state.split('-')[1]}</p>
                                        <Label className='text-m font-normal'>{regionItem.dealers} Dealers</Label>
                                        <br/>
                                        <br/>
                                        <div className="grid w-full items-center gap-4">
                                            <div className="flex flex-col space-y-1.5">
                                                {/* <Label className='text-m font-normal'>{regionItem.dealers} Dealers</Label> */}
                                                <Label className='text-xl font-semibold'>₹{formatter.format(regionItem.pending)}</Label>
                                            </div>
                                            
                                        </div>
                                        </form>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant='outline'>View details</Button>
                                    </CardFooter>
                                </Card>
                            
                        ))}
                        </div>}
                        {(resultMessage.length > 0) ? <Toast type={resultType} message={resultMessage} /> : ''}
                    </div>
                <div>
                    
                </div>
            </div>

                
        </div>
               
                
        </div>
    
    </div>
    
    
  );
}

