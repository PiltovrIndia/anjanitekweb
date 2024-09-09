'use client'

import { Inter } from 'next/font/google'
import { ChatText, Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, Plus, UserMinus } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
import { XAxis, YAxis, Cell, PieChart, Pie, Area, AreaChart, } from 'recharts';
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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger, } from "../../../../app/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../app/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/app/components/ui/tooltip"  

import BlockDatesBtn from '../../../components/myui/blockdatesbtn'
import OutingRequest from '../../../components/myui/outingrequest'
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
import { Skeleton } from "@/app/components/ui/skeleton"
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
    Card
  } from "../../../components/ui/card"
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

// import { taskSchema } from "@/app/data/schema"

// import data from '@/app/data/'


const metadata = {
    title: "Tasks",
    description: "A task and issue tracker build using Tanstack Table."
  }
  // Simulate a database read for tasks.
   function getTasks() {
    // const data =  fs.readFile(
    //   path.join(process.cwd(), "src/app/data/tasks.json")
    // )
  
    // const tasks = JSON.parse(data.toString())

    var tasks = [
        {
          "id": "TASK-5207",
          "title": "The SMS interface is down, copy the bluetooth bus so we can quantify the VGA card!",
          "status": "Approved",
          "label": "bug",
          "priority": "low"
        }
      ]
  
    return JSON.parse(JSON.stringify(tasks))
    // return array( taskSchema.validate(tasks))
    // return array(taskSchema).parse(tasks)
  
  // parse and assert validity
  // const user = await taskSchema.validate(tasks);
  
  
  }
const xlsx = require('xlsx');
// import {jsPDF} from 'jsPDF';
// Default export is a4 paper, portrait, using millimeters for units
// const doc = new jsPDF();

// Create styles
// const styles1 = StyleSheet.create({
//     page: {
//       flexDirection: 'row',
//       backgroundColor: '#E4E4E4'
//     },
//     section: {
//       margin: 10,
//       padding: 10,
//       flexGrow: 1
//     }
//   });



// get the SalesManagers for SalesExecutives
const getAllSalesPersonsDataAPI = async (pass, role, offset) => 
  
fetch("/api/v2/user/"+pass+"/U7/"+role+"/"+offset, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// get the mapTo of 1 person
const getAllMapToDataAPI = async (pass, role, id) => 
  
fetch("/api/v2/user/"+pass+"/U8/"+role+"/"+id, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// search for people to add
const searchToMapDataAPI = async (pass, role, searchTerm) => 
  
fetch("/api/v2/user/"+pass+"/U9/"+role+"/"+searchTerm, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Update the mapping of a person
const updateMappingAPI = async (pass, role, mapTo, id) => 
  
fetch("/api/v2/user/"+pass+"/U10/"+role+"/"+mapTo+"/"+id, {
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

// create user
const createUser = async (pass, role, updateDataBasic) =>   
    fetch("/api/v2/user/"+pass+"/U11/"+role+"/"+updateDataBasic, {
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





// pass state variable and the method to update state variable
export default function Sales() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [offset, setOffset] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [searching, setSearching] = useState(true);
    const [searching2, setSearching2] = useState(false);
    const [searching3, setSearching3] = useState(false);
    const [searchingMessages, setSearchingMessages] = useState(false);
    const [showMessagesView, setShowMessagesView] = useState(false);
    const [senderMessagesList, setSenderMessagesList] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [loadingIds, setLoadingIds] = useState(new Set());
    
    // branch type selection whether all branches and years or specific ones
    const [selectedRole, setSelectedRole] = useState("SalesManager");
        
    // for populating filters/selections
    const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);
    const [selectedDealerPerson, setSelectedDealerPerson] = useState(null);
    const lastItemRef = useRef(null);

    // branch type selection whether all branches and years or specific ones
    const [selectedBranchYears, setSelectedBranchYears] = useState([]);

    const [dataFound, setDataFound] = useState(false);
    const [messaging, setMessaging] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [allSalesPeople, setAllSalesPeople] = useState([]);
    const [allMappedPeople, setAllMappedPeople] = useState([]);
    
    const [searchedList, setSearchedList] = useState([]);
    const [openSearch, setOpenSearch] = useState(false);
    // const [selectedReceiver, setSelectedReceiver] = useState({});
    const [receiversList, setReceiversList] = useState([]);
    
    
    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [initialDatesValues, setInititalDates] = React.useState({from: dayjs().subtract(0,'day'),to: dayjs(),});
    // const [currentStatus, setCurrentStatus] = useState('All');
    const [currentStatus, setCurrentStatus] = useState('InOuting');
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

    const handleRoleChange = (value) => {
        setSelectedRole(value)
      }

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


  async function sendSingleMessageNow(dealerId, callback){

    try {    
        var updatedOn = dayjs(new dayjs()).format("YYYY-MM-DD");
        
        // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+dealerId+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+document.getElementById('message').value+"/0/-");
        const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,dealerId,dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),document.getElementById('message').value,"0","-");
        
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
                
                if(!completed){
                    
                    getSalesPersons();
                }
                else {
                    console.log("DONE READING");
                }
                
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


    // Get all sales people data
    // role – SuperAdmin
    async function getSalesPersons(){
        
        setSearching(true);

        try {    
            
            const result  = await getAllSalesPersonsDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, 'SalesManager', offset) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setAllSalesPeople(queryResult.data);
                    setSelectedSalesPerson(queryResult.data[0].id);
                    
                    setDataFound(true);
                    getMyMappedPeople(queryResult.data[0].id);
                }
                else {
                    setAllSalesPeople([]);
                    setDataFound(false);
                }

                setSearching(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401 || queryResult.status == 201 ) {
                setAllSalesPeople([]);
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllSalesPeople([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                setSearching(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            toast({ description: "Issue loading. Please refresh or try again later!", })
        }
}
    
    // Get mapped data for a given user
    // role – SuperAdmin
    async function getMyMappedPeople(id){
        
        setSelectedSalesPerson(id);
        // hide the messages as dealer is not selected yet
        setShowMessagesView(false);
        
        setSearching2(true);

        try {    
            
            const result  = await getAllMapToDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, id) 
            const queryResult = await result.json() // get data

            console.log(queryResult);
            // check for the status
            if(queryResult.status == 200){

                // check if data exits
                if(queryResult.data.length > 0){
                    
                    setAllMappedPeople(queryResult.data);
                    
                    setDataFound(true);
                }
                else {
                    setAllMappedPeople([]);
                    setDataFound(false);
                }

                setSearching2(false);
                setCompleted(false);
            }
            else if(queryResult.status == 401 || queryResult.status == 201 ) {
                
                setAllMappedPeople([]);
                setSearching2(false);
                setDataFound(false);
                setCompleted(true);
            }
            else if(queryResult.status == 404) {
                setAllMappedPeople([]);
                toast({
                    description: "No more requests with "+status+" status",
                  })
                  
                  setSearching2(false);
                setDataFound(false);
                setCompleted(true);
            }
        }
        catch (e){
            toast({ description: "Issue loading. Please refresh or try again later!", })
        }
}




// update the date selection
function changeDatesSelection(value) {
// console.log(initialDatesValues.from);
// console.log((initialDatesValues.to!=null));

setInititalDates({from:dayjs(value.from),  to:dayjs((value.to!=null)?value.to:value.from)});
// setInititalDates(dayjs(new Date(value.from)).format('YYYY-MM-DD HH:mm:ss'),  dayjs(new Date(value.from)).format('YYYY-MM-DD HH:mm:ss'));
// console.log(value.from);
// console.log(value.to);
// console.log('bro');
// console.log(initialDatesValues.to);

    getAllDealers(dayjs(value.from),dayjs((value.to!=null)?value.to:value.from));
}



// update the currentStatus variable
function updateStatus(value) {
    getAllDealers(initialDatesValues.from,initialDatesValues.to);
    
    // setCurrentStatus(value);
    
}
// update the currentStatus variable
function updateOffset(value) {
    console.log(value);
    setOffset(value+10);
    // setOffset(offset+20);
    getAllDealers(initialDatesValues.from,initialDatesValues.to);
}

    


const sendMessageNow = async (e) => {
    
    setMessaging(true);
    
    try {    
        

        const result  = await sendBroadcastMessage(process.env.NEXT_PUBLIC_API_PASS, 
            JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, 'All', dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(), document.getElementById('message').value,0,'-') 
        const queryResult = await result.json() // get data

        console.log(queryResult);
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


    // search a dealer by name
    async function searchForPeopleToMap(){
        
        if(document.getElementById('search').value.length == 0){
            toast({description: "Enter a name to search!",});
        }
        else {
            setSearching3(true);
            
            // setOffset(offset+10); // update the offset for every call
            var searchTerm = document.getElementById('search').value;

            try {    
                const result  = await searchToMapDataAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role,searchTerm);
                const queryResult = await result.json() // get data
                console.log(queryResult);
                
                // check for the status
                if(queryResult.status == 200){
                
                    setSearchedList(queryResult.data);
                    
                    setDataFound(true);
                    setSearching3(false);
                
                    setCompleted(false);
                }
                else {
                    
                    setSearching3(false);
                    setDataFound(false);
                    setCompleted(true);
                }
            }
            catch (e){
                // show and hide message
                toast({description: "Issue loading. Please refresh or try again later!",});
            }
        }
}
    // Update mapping
    async function updateMapping(mapTo, id){
    
        setUpdating(true);

        try {    
            const result  = await updateMappingAPI(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role,mapTo,id);
            const queryResult = await result.json() // get data
            
            // check for the status
            if(queryResult.status == 200){
            
                toast({description: "Mapping Completed!",});
                setUpdating(false);
            }
            else {
                
                setUpdating(false);
            }
        }
        catch (e){
            // show and hide message
            toast({description: "Issue loading. Please refresh or try again later!",});
        }
    }

    function selectTheSearchItem(searchItem){
        console.log("Selected Search ITEM: "+searchItem.name);
        
        // set the object
        // var obj = {name:searchItem.name, receiver:searchItem.id};
        // set the selected receiver
        // setSelectedReceiver(obj);

        // check if the selected searchItem is already present in the list
        // const existingReceiver = receiversList.find(receiver => receiver.receiver === obj.receiver);
        const existing = allMappedPeople.find(item => item.id === searchItem.id);
        if (!existing) {
            // console.log("NON EXISTS");
            setAllMappedPeople([...allMappedPeople, searchItem]);

            // call API to change the mapping of the person
            updateMapping(selectedSalesPerson,searchItem.id);
        }
        else {
            // console.log("EXISTS");
            toast({description: "Already mapped!",});
        }
        
        // close the search popover
        setOpenSearch(false);
    }


    // get messages of a specific receiver
    async function getSenderMessagesData(salesperson, receiver){
            
        console.log(salesperson);
        console.log(receiver);
        
        setSelectedDealerPerson(receiver);
        setSearchingMessages(true);
        setSenderMessagesList([]);
        setShowMessagesView(true);
        // setOffset(offset+10); // update the offset for every call

        try {    
            const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, salesperson, receiver)
            const queryResult = await result.json() // get data
            console.log(queryResult);
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

      
    // send message to a specific receiver
    async function sendMessageData(){
        // receiver is always the dealer
        
        setSendingMessage(true);
        // setOffset(offset+10); // update the offset for every call
        var message = document.getElementById('message').value;
        

        try {    
            // console.log("/api/v2/messaging/"+process.env.NEXT_PUBLIC_API_PASS+"/0/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id+"/"+selectedReceiver.receiver+"/"+dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString()+"/"+message+"/0/-");
            const result  = await sendDealerMessage(process.env.NEXT_PUBLIC_API_PASS,JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id, selectedDealerPerson, dayjs(today.toDate()).format("YYYY-MM-DD hh:mm:ss").toString(),message,"0","-");
        
            // const result  = await getSenderMessages(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).userId, receiver)
            const queryResult = await result.json() // get data
            console.log(queryResult);
            var sentObj = {
                notificationId: 100000,
                sender: JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).id,
                receiver: selectedDealerPerson,
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
    
    // create a new sales person
    async function createSalesPerson(){
        
        // receiver is always the dealer
        try{
            if(document.getElementById('name').value.length > 0 && document.getElementById('emailaddress').value.length > 0 && document.getElementById('mobilenumber').value.length > 0 && document.getElementById('designation').value.length > 0){
                
                setCreatingPerson(true);

                // show and hide message
                toast({description: "Creating user. Please wait ...",});

                var id = getNextId(allSalesPeople); // get the next salesID
                var name = document.getElementById('name').value;
                var emailaddress = document.getElementById('emailaddress').value;
                var mobilenumber = document.getElementById('mobilenumber').value;
                var designation = document.getElementById('designation').value;
                var role = selectedRole;

                const updateDataBasic = {
                    id: id,
                    name: name,
                    designation: designation,
                    email: emailaddress,
                    mobile: mobilenumber,
                    role: role,
                    mapTo: '-',
                    userImage: '-',
                    gcm_regId: '-',
                    isActive: 1
                };
                
                if (Object.keys(updateDataBasic).length > 0) {
                // if (Object.keys(updateDataBasic).length > 0 && Object.keys(updateDataDetail).length > 0) {

                    console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U11/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role+"/"+JSON.stringify(updateDataBasic));
                    const result  = await createUser(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.stringify(updateDataBasic))
                    const queryResult = await result.json() // get data
                    console.log(queryResult);
                    
                    // check if query result status is 200
                    if(queryResult.status == 200) {
                        // set the state variables with the user data
                        
                        setAllSalesPeople([updateDataBasic, ...allSalesPeople]);
                        // setAllSalesPeople([...allSalesPeople, updateDataBasic]);
                        toast({description: "Sales person created and added to the list",});
                        setCreatingPerson(false);

                    } else if(queryResult.status == 404) {

                        // show and hide message
                        toast({description: "Facing issues, try again later!",});
                    }

                }
            }
            else {
                // show and hide message
                toast({description: "Fill in all the fields to submit.",});
            }
        }
            
        catch (e){
            console.log(e);
            
            // show and hide message
            toast({description: "Facing issues, try again later!",});
        }
    }
    
    
  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
          <div className='flex flex-row gap-2 items-center py-4' >
              <h2 className="text-lg font-semibold">Sales</h2>

            {(!messaging) ?
              <Sheet>
                <SheetTrigger asChild>
                    <Button>Create Sales Person</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Create Sales Person</SheetTitle>
                    <SheetDescription>
                        Enter your message to send it to all the dealers.
                    </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <br/>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            ID
                            </Label>
                            {getNextId(allSalesPeople)}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            Name
                            </Label>
                            <Input id="name" className="w-max" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            Email
                            </Label>
                            <Input id="emailaddress" className="w-max"  />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            Mobile
                            </Label>
                            <Input id="mobilenumber" className="w-max"  />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            Role
                            </Label>
                            <RadioGroup defaultValue="SalesManager" id="role" className="w-max" onValueChange={handleRoleChange} value={selectedRole}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="SalesManager" id="r1" />
                                    <Label htmlFor="r1">Sales Manager</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="SalesExecutive" id="r2" />
                                    <Label htmlFor="r2">Sales Executive</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                            Designation
                            </Label>
                            <Input id="designation" className="w-max"  />
                        </div>
                        <Separator />
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" onClick={createSalesPerson}>Send now</Button>
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
          </div>    
          
         
    <div className={styles.verticalsection} style={{height:'80vh', width:'100%',gap:'8px'}}>

{/* {(allSalesPeople.length !=0) ? */}
<div className="mx-auto" style={{width:'100%',height:'100%'}}>
{/* <div className="container mx-auto py-10"> */}
{searching ? <SpinnerGap className={`${styles.icon} ${styles.load}`} /> : 
<p className='text-md text-black-600 py-2'>{allSalesPeople.length} in Sales</p>}

{searching ? <Skeleton className="h-4 w-[300px] h-[120px]" /> : 
<div className='flex flex-row gap-4'>

    <Card className='w-full' style={{height:'100vh',overflow:'scroll'}}>
        <Table className='w-full'>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    {/* <TableHead>State</TableHead> */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {allSalesPeople.map((row) => (
                    <TableRow key={row.id} onClick={()=>getMyMappedPeople(row.id)} style={{cursor:'pointer'}}  className={(selectedSalesPerson==row.id) ? 'bg-blue-100' : ''}>
                        <TableCell className={(selectedSalesPerson==row.id) ? 'font-semibold text-blue-700 py-2 border-l-8 border-blue-700' : 'font-semibold text-black-700 py-2'}>{row.name}<br/>
                            <p className="font-normal text-muted-foreground">
                                {row.mobile} 
                            </p>
                            <p className="font-normal text-muted-foreground">
                                {row.email} 
                            </p>
                        </TableCell>
                        <TableCell onClick={()=>console.log(row.mapTo)}>
                            <p className="text-sm text-slate-500 bg-slate-50 px-1 py-1 w-fit border border-slate-200 rounded">
                                {row.role}
                            </p>
                            </TableCell>
                        {/* <TableCell>{row.email}</TableCell> */}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>

    {searching2 ? <Skeleton className="h-4 w-full h-[120px]" /> : 
    <div className='w-full' style={{height:'100vh',overflow:'scroll'}}>
        <Card className="w-full py-2 px-4 flex flex-row justify-between items-center border-2 border-blue-700 bg-blue-50">
            <p className=' text-blue-700 font-semibold '>{allSalesPeople.find(item => item.id === selectedSalesPerson).name}</p>
            <p className=' text-slate-700 font-semibold '>Total mapped: {allMappedPeople.length}</p>
        </Card>

        <Separator orientation="vertical" className="h-[40px] w-[3px] ml-10 bg-blue-700" />
        
        <Card className='w-fit'>
                <div className='flex flex-row mx-2 gap-2 items-center'>
                    <Input type="text" id="search" placeholder="Type name to search and map" className="my-2 "/>
                    <Popover open={openSearch} onOpenChange={setOpenSearch}>
                        <PopoverTrigger asChild><Button variant="outline" className='text-white bg-blue-700' onClick={searchForPeopleToMap}>Search</Button></PopoverTrigger>
                        <PopoverContent className="w-fit">
                        {
                            searching3 ? 
                            <div className='flex flex-row text-sm text-gray-400'><SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;Searching...</div>
                            : 
                            <div style={{height:'300px', width: '400px', overflow:'scroll'}}>
                                {searchedList.map((searchItem, index) => (
                                <>
                                    <li className="flex w-max items-center py-4 first:pt-0 last:pb-0 cursor-pointer" key={index} onClick={()=>{selectTheSearchItem(searchItem)}}>
                                    {/* <li className="flex py-4 first:pt-0 last:pb-0" key={index} onClick={()=>{setSelectedReceiver(receiver)}}> */}
                                    {/* <img class="h-10 w-10 rounded-full" src="" alt="" /> */}
                                        <Avatar>
                                            <AvatarImage src="" alt="dealer_image" />
                                            <AvatarFallback>{searchItem.name.split(' ').map(word => word.slice(0, 1)).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-3 overflow-hidden w-[280px]">
                                            <p className="text-sm font-medium text-slate-900">{searchItem.name}</p>
                                            <p className="text-sm text-slate-500 truncate">{searchItem.id}</p>
                                            <p className="text-sm text-slate-500 truncate">{searchItem.role}</p>
                                            {(searchItem.mapTo.length > 3 && allSalesPeople.length > 1) ? <p className="text-sm text-slate-500 truncate">Mapped to: {allSalesPeople.find(item => item.id === searchItem.mapTo)?.name}</p> : <p></p>}
                                        </div>
                                        <div className='items-end'>
                                            <Button variant='outline' className='border-blue-700'>Add</Button>
                                        </div>
                                    </li>
                                    <Separator />
                                </>
                                
                                ))}
                                
                            </div>
                        }
                        <br/>
                        <Button variant="outline" onClick={() => setOpenSearch(false)}>Close</Button>
                        </PopoverContent>
                    </Popover>
                </div>

                {allMappedPeople.length > 0 ? 
                <Table className='w-fit'>
                    <TableBody>
                        {allMappedPeople.map((row) => (
                            <TableRow key={row.id} style={{cursor:'pointer'}}  className={(selectedDealerPerson==row.id) ? 'bg-green-100' : ''} onClick={()=>getSenderMessagesData(selectedSalesPerson, row.id)} >
                                <TableCell className={(selectedDealerPerson==row.id) ? 'font-semibold text-green-700 py-2 border-l-8 border-green-700' : 'font-semibold text-black-700 py-2'}>{row.name}<br/>
                                    <p className="font-normal text-muted-foreground py-2">
                                        {row.id} 
                                    </p>

                                    {row.email.length > 2 ?
                                    <p className="font-normal text-muted-foreground pb-2">
                                        {row.email}
                                    </p>
                                    : ''}
                                    <p className="text-sm text-slate-500 bg-slate-50 mb-2 px-1 py-1 w-fit border border-slate-200 rounded">
                                        {row.role}
                                    </p>
                                </TableCell>
                                <TableCell>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant='outline' className="mx-2 px-2"><ChatText size={24} className="text-green-600"/></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p>View messages</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                {/* <TableCell>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant='outline' className="mx-2 px-2"><UserMinus size={24} className="text-red-600"/>&nbsp;Remove</Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p>View messages</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                :
                <p className='px-2 py-2'>No people mapped</p>
                }
            
        </Card>
    </div>
    }


    {/* SHOW messages for selected user */}
        {!searchingMessages && showMessagesView ?
            <div className="flex flex-col flex-1 rounded-md border p-4 gap-4 min-w-96" style={{height: '90vh',position: 'sticky'}}>
                <div className="flex flex-col gap-2">
                    {searchingMessages ? <Skeleton className="h-4 w-[100px] h-[20px]" /> : 
                    <div className='flex flex-row justify-between'>
                        
                        <div className='flex flex-col'>
                            <p className='text-sm text-slate-600 mb-2'>Coversation between</p>
                            <p className="text-sm text-blue-700 bg-slate-50 px-2 py-1 w-fit border-2 border-blue-700 rounded-xl bg-blue-50">{allSalesPeople.find(item => item.id === selectedSalesPerson)?.name}</p>
                            <Separator orientation="vertical" className="h-[20px] w-[3px] ml-10 bg-green-700" />
                            <p className="text-sm text-green-700 bg-slate-50 px-2 py-1 w-fit border-2 border-green-700 rounded-xl bg-green-50">{allMappedPeople.find(item => item.id === selectedDealerPerson)?.name}</p>
                        </div>
                        {/* <p className="text-base font-semibold text-blue-600">{allMessages.find(item => item.dealerId === selectedDealer).accountName}</p> */}
                        <Button variant='outline' size="icon" onClick={()=>setShowMessagesView(false)} className="text-blue-600"><X size={24} className="text-slate-600"/></Button>
                    </div>
                    }
                    
                    {/* <p className='text-sm text-slate-600'>Coversation between: {allSalesPeople.find(item => item.id === selectedSalesPerson)?.name}</p> */}
                </div>
                <Separator />
                    
                    {/* <div className="grid w-full items-center gap-4"> */}
                        {searchingMessages ? <Skeleton className="h-4 w-[300px] h-[100px]" /> :
                            <div className="flex flex-col flex-auto overflow-scroll justify-stretch gap-2">
                            {senderMessagesList.length > 0 ?
                            senderMessagesList.map((message, index) => (
                                <div key={index} className="w-fit flex flex-col rounded-md border p-2" style={(message.sender==selectedSalesPerson) ? {alignSelf:'self-end'} : {alignSelf:'self-start'}} ref={index === senderMessagesList.length - 1 ? lastItemRef : null}>
                                    
                                    {(allSalesPeople.find(item => item.id === message.sender) != null) ?
                                    <Label className="text-black-500 p-1 font-semibold">{allSalesPeople.find(item => item.id === message.sender)?.name}</Label>
                                    : <Label className="text-black-500 p-1 font-semibold">{allMappedPeople.find(item => item.id === message.sender)?.name}</Label>}
                                    
                                    <Label className="text-gray-500 p-1 leading-6">{message.message}</Label>
                                    
                                    {/* <Label className="text-gray-500 p-1">{message.sender}</Label> */}
                                    <p className="text-xs text-gray-500 p-1 mt-3">{dayjs(message.sentAt).format('MMMM D, YYYY h:mm A')}</p>
                                    
                                    {(message.sender==selectedSalesPerson) ? 
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
                
                {/* <div className="flex flex-1 flex-col justify-between gap-2">
                    <Textarea id="message" placeholder="Type your message here." />
                        <Button variant='outline' onClick={()=>sendMessageData()} className="text-blue-600"><PaperPlaneRight className="text-blue-600"/> &nbsp; Send</Button>
                </div> */}
            </div>
            :
            <div></div>}
</div>
}
      {/* <DataTable data={allSalesPeople} dataOffset={offset} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset} loadingIds={loadingIds} handleMessageSendClick={handleMessageSendClick}/> */}
      {/* <DataTable columns={columns} data={allSalesPeople} status={currentStatus} changeStatus={updateStatus} downloadNow={downloadRequestsNow} initialDates={initialDatesValues} dates={changeDatesSelection} requestAgain={updateOffset}/> */}
      
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
        <DataTable data={allSalesPeople} columns={columns} />
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

