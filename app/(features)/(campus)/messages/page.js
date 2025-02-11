'use client'

import { Inter } from 'next/font/google'
import { Check, Info, SpinnerGap, X, Plus, PaperPlaneRight, Checks, CheckCircle } from 'phosphor-react'
import React, { useCallback, useEffect, useState, useRef } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
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
  import { ScrollArea } from "../../../../app/components/ui/scroll-area"
  import { Separator } from "../../../../app/components/ui/separator"
  import { Textarea } from "../../../../app/components/ui/textarea"
  import { Popover, PopoverContent, PopoverTrigger, } from "../../../../app/components/ui/popover"
  import { Avatar, AvatarFallback, AvatarImage } from "../../../../app/components/ui/avatar"
  
  import { Toaster } from "../../../../app/components/ui/sonner"
    import { useToast } from "@/app/components/ui/use-toast"


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


// Create a child reference
// const imagesRef = ref(storage, 'images');
// imagesRef now points to 'images'

// Child references can also take paths delimited by '/'
// const spaceRef = ref(storage, '/');

// const spaceRef = ref(storage, 'images/space.jpg');

////////// APIS /////////
// get the list of users who the admin sent messages
const getSenders = async (pass, sender) => 
fetch("/api/v2/messaging/"+pass+"/3/"+sender, {
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

// send message to a dealer
const sendDealerMessage = async (pass, sender, receiver, sentAt, message, seen, state) =>   
fetch("/api/v2/messaging/"+pass+"/0/"+sender+"/"+receiver+"/"+sentAt+"/"+message+"/"+seen+"/"+state, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
// search dealer by name
const searchDealerByName = async (pass, dealer, offset, id, role) =>   
fetch("/api/v2/user/"+pass+"/U2/"+dealer+"/"+offset+"/"+id+"/"+role, {
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
export default function Messages() {

    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [offset, setOffset] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [items, setItems] = useState([]);
    const [file, setFile] = useState(null); 
    
    const [selectedReceiver, setSelectedReceiver] = useState({});
    const [receiversList, setReceiversList] = useState([]);
    const [senderMessagesList, setSenderMessagesList] = useState([]);
    const [searchedList, setSearchedList] = useState([]);
    const [openSearch, setOpenSearch] = useState(false);
    const lastItemRef = useRef(null);
    
    const [resultType, setResultType] = useState('');
    const [resultMessage, setResultMessage] = useState('');

    
    const [dataFound, setDataFound] = useState(true); // use to declare 0 rows
    const [inputError, setInputError] = useState(false);
    const [dealerSearching, setDealerSearching] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const [outingData, setOutingData] = useState();
    // const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    //create new date object
    const today = new dayjs();
    // const { toast } = useToast()
    const { toast } = useToast();
    
    
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
                setRole(obj.role)

                // get if receivers data is present
                if(receiversList.length == 0){
                    getData();
                }
                
                // fetch the selected receiver's messages
                if(selectedReceiver!=null){
                    getSenderMessagesData(selectedReceiver.receiver);
                }
                else {
                    // console.log("DONE READING");
                }
            }
            else{
                console.log('Not found')
                router.push('/')
            }
    },[selectedReceiver, router, receiversList.length]);

    // get the senders data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getData(){
        
        setSearching(true);
        // setOffset(offset+10); // update the offset for every call

        try {    
            console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/3/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id);
            const result  = await getSenders(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    // console.log(queryResult.data);
                    // set the state
                    // total students
                        
                    setReceiversList(queryResult.data);
                    setSelectedReceiver(queryResult.data[0]) // set the first user from the list to fetch messages.
                   
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

    // get messages of a specific receiver
    async function getSenderMessagesData(receiver){
        
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
        
        setSendingMessage(true);
        // setOffset(offset+10); // update the offset for every call
        var message = document.getElementById('message').value;

        try {    
            console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+selectedReceiver.receiver+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+message+"/0/-");
            // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+row.getValue('appointmentId')+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).collegeId+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).username+"/"+updatedOn+"/"+row.getValue('collegeId'));
            const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,selectedReceiver.receiver,dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),message,"0","-");
        
            // const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId, receiver)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            var sentObj = {
                notificationId: 100000,
                sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                receiver: selectedReceiver.receiver,
                sentAt: dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),
                message: document.getElementById('message').value,
                seen: 0,
                state: '-'
            };
            
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                
                    
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
            // show and hide message
            setResultType('error');
            setResultMessage('Issue loading. Please refresh or try again later!');
            setTimeout(function(){
                setResultType('');
                setResultMessage('');
            }, 3000);
        }
}

    // search a dealer by name
    async function searchDealerByNameData(){
        
        if(document.getElementById('search').value.length == 0){
            toast({description: "Enter a name to search!",});
        }
        else {
            setDealerSearching(true);
            // console.log("offset : ");
            // console.log(offset);
            // setOffset(offset+10); // update the offset for every call
            var searchTerm = document.getElementById('search').value;

            try {    
                // console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U2/"+searchTerm+"/0/"+role+"/"+user.id);
                // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/1/"+row.getValue('appointmentId')+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).collegeId+"/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).username+"/"+updatedOn+"/"+row.getValue('collegeId'));
                const result  = await searchDealerByName(process.env.NEXT_PUBLIC_API_PASS,searchTerm,offset, role, user.id);
            
                // const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId, receiver)
                const queryResult = await result.json() // get data
                // console.log(queryResult);
                // var sentObj = {
                //     notificationId: 100000,
                //     sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId,
                //     receiver: selectedReceiver.receiver,
                //     sentAt: dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),
                //     message: document.getElementById('message').value,
                //     seen: 0,
                //     state: '-'
                // };
                
                // check for the status
                if(queryResult.status == 200){
                
                    setSearchedList(queryResult.data);
                    
                    setDataFound(true);
                    setDealerSearching(false);
                
                    setCompleted(false);
                }
                else {
                    
                    setDealerSearching(false);
                    setDataFound(false);
                    setCompleted(true);
                }
            }
            catch (e){
                // show and hide message
                setResultType('error');
                setResultMessage('Issue loading. Please refresh or try again later!');
                setTimeout(function(){
                    setResultType('');
                    setResultMessage('');
                }, 3000);
            }
        }
}

    function selectTheSearchItem(searchItem){
        console.log("Selected Search ITEM: "+searchItem.name);
        
        // set the object
        var obj = {name:searchItem.name, receiver:searchItem.id};
        // set the selected receiver
        setSelectedReceiver(obj);

        // check if the selected searchItem is already present in the list
        const existingReceiver = receiversList.find(receiver => receiver.receiver === obj.receiver);
        if (!existingReceiver) {
            console.log("NON EXISTS");
            setReceiversList([...receiversList, obj]);
        }
        else {
            console.log("EXISTS");
        }
        
        // close the search popover
        setOpenSearch(false);
    }


    // get the requests data
    // for the user based on their role.
    // the actions will be seen that are specific to the role and by the selected status
    async function getDataDetails(items1){
        
        setUploadProgress(true);
        
        try {    
            const result  = await updateUploadData(process.env.NEXT_PUBLIC_API_PASS, items1, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id)
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
    
        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'500vh',gap:'8px'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h1 className='text-xl font-bold'>Messages</h1>
              
              {/* <Sheet>
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
                </Sheet> */}
          </div>      

            {/* <div style={{width:'100%',display:'flex', flexDirection:'row',justifyContent:'space-between'}}>
                <div className={styles.horizontalsection}>
                    <div className={`${styles.primarybtn} `} style={{display:'flex', flexDirection:'row', width:'fit-content', cursor:'pointer', gap:'4px'}}> 
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

                <div className='flex flex-row gap-2' key={1234} style={{height:'100%', width:'100%', }}>
                       
                    {/* <div className='flex flex-row gap-2' style={{width:'100%',overflow:'scroll'}}> */}
                        
                    {/* {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> :  */}
                    <ScrollArea className="w-fit rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-medium leading-none">SENT</h4>
                            <div className='flex flex-row items-center gap-2'>
                                <Input type="text" id="search" placeholder="Type dealer name to search" className="my-2 "/>
                                {/* {dealerSearching ?
                                    <div className='flex flex-row text-sm text-gray-400'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Searching...</div> */}
                                    <Popover open={openSearch} onOpenChange={setOpenSearch}>
                                        <PopoverTrigger asChild><Button variant="outline" onClick={searchDealerByNameData}>Search</Button></PopoverTrigger>
                                        <PopoverContent>
                                        {
                                            dealerSearching ? 
                                            <div className='flex flex-row text-sm text-gray-400'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;Searching...</div>
                                            : 
                                            <div>
                                                {searchedList.map((searchItem, index) => (
                                                // <>
                                                    <li className="flex py-4 first:pt-0 last:pb-0 cursor-pointer" key={index} onClick={()=>{selectTheSearchItem(searchItem)}}>
                                                    {/* <li className="flex py-4 first:pt-0 last:pb-0" key={index} onClick={()=>{setSelectedReceiver(receiver)}}> */}
                                                    {/* <img class="h-10 w-10 rounded-full" src="" alt="" /> */}
                                                        <Avatar>
                                                            <AvatarImage src="" alt="dealer_image" />
                                                            <AvatarFallback>{searchItem.name.split(' ').map(word => word.slice(0, 1)).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="ml-3 overflow-hidden w-max">
                                                            <p className="text-sm font-medium text-slate-900">{searchItem.name}</p>
                                                            <p className="text-sm text-slate-500 truncate">{searchItem.id}</p>
                                                        </div>
                                                    </li>
                                                // </>
                                                
                                                ))}
                                                
                                            </div>
                                        }
                                        <br/>
                                        <Button variant="outline" onClick={() => setOpenSearch(false)}>Close</Button>
                                        </PopoverContent>
                                    </Popover>
                                  
                                    {/* // <Button variant="outline" onClick={searchDealerByNameData}>Search</Button> */}
                                {/* } */}
                            </div>
                            {searching ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : 
                            <ul role="list" className="py-2 divide-y divide-slate-200">
                            {receiversList.map((receiver, index) => (
                            <>  
                                <li className="flex px-2 py-4 first:pt-0 last:pb-0 cursor-pointer border-l-2 border-blue-600" key={index} onClick={()=>{setSelectedReceiver(receiver)}} style={{borderLeft: (selectedReceiver.receiver == receiver.receiver) ? '2px solid blue': '2px solid white'}}>
                                {/* <img class="h-10 w-10 rounded-full" src="" alt="" /> */}
                                <Avatar>
                                    <AvatarImage src="" alt="dealer_image" />
                                    <AvatarFallback>{receiver.name.split(' ').map(word => word.slice(0, 1)).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="ml-3 overflow-hidden w-max">
                                    {(selectedReceiver.receiver == receiver.receiver) ?
                                        <p className="text-sm font-medium text-blue-600">{receiver.name}</p>
                                        : <p className="text-sm font-medium text-slate-900">{receiver.name}</p>
                                    }
                                    <p className="text-sm text-slate-500 truncate">{receiver.receiver}</p>
                                </div>
                                </li>
                            </>
                            
                            ))}
                            </ul>}
                            
                        </div>
                    </ScrollArea>
                    

                        <div className="w-[580px] flex flex-col flex-1 rounded-md border p-4 gap-4">
                            <div className="flex flex-1 flex-col gap-2">
                                {searchingMessages ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : <CardTitle className="text-blue-600">{selectedReceiver.name}</CardTitle>}
                                <CardDescription>Dealer ID: {selectedReceiver.receiver}</CardDescription>
                            </div>
                            
                                
                                {/* <div className="grid w-full items-center gap-4"> */}
                                    {searchingMessages ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
                                        <div className="flex flex-col flex-auto overflow-scroll justify-stretch gap-2">
                                        {senderMessagesList.length > 0 ?
                                        senderMessagesList.map((message, index) => (
                                            <div key={index} className="w-fit flex flex-col rounded-md border p-2" style={(message.sender==JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id) ? {alignSelf:'self-end'} : {alignSelf:'self-start'}} ref={index === senderMessagesList.length - 1 ? lastItemRef : null}>
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
                            
                            <div className="flex flex-1 flex-row justify-between gap-2">
                                {/* <Button variant='outline' onClick={()=>getData()}>Refresh</Button> */}
                                <Textarea id="message" placeholder="Type your message here." />
                                {sendingMessage ? 
                                    <div className='flex flex-row'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> Sending...</div>
                                    : <Button variant='outline' onClick={()=>sendMessageData()} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send Message</Button>
                                }
                            </div>
                        </div>
                        {/* </div> */}
                        
                        
                        {/* {(resultMessage.length > 0) ? <Toast type={resultType} message={resultMessage} /> : ''} */}
                    
                <div>
                    
                </div>
            </div>

                
        </div>
               
                
        </div>
    
    </div>
    
    
  );
}

