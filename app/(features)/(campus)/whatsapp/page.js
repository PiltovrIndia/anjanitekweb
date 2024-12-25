'use client'

import { Inter } from 'next/font/google'
import { ChatText, Check, Checks, PaperPlaneRight, Info, SpinnerGap, X, Plus, UserMinus } from 'phosphor-react'
import React, { useRef, useEffect, useState } from 'react'
const inter = Inter({ subsets: ['latin'] })
import styles from '../../../../app/page.module.css'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

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

import { Toaster } from "../../../components/ui/sonner"
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

// get message to dealers
const sendBroadcastMessage = async () => 
    
fetch("https://graph.facebook.com/v21.0/508449589016103/messages", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer EAAIEGtA6LXwBO7CunzaZBeFo0ohGrNlUa6TPGFdGQZC0jlEkMq883AZCUSHQn5OdYBMzU6fyHhZCxY6mIlqsVmMd1e9QaqFZCgBkW5P9zQ3y230ZCaah871mu3qZCzH3Hqi61043ZAsxSAEcSz2cqEtZBA9g3WHLVCJuqoZBw5OdKP1iT7iiN9rE5htP5gFXY8jl6sZBwZDZD"
    },
    body: JSON.stringify( { "messaging_product": "whatsapp", "to": "917799813519", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }),
});





// pass state variable and the method to update state variable
export default function WhatsAppMessaging() {
    
    const { toast } = useToast();
    // const tasks = getTasks()
    // create a router for auto navigation
    const router = useRouter();

    // user state and requests variable
    const [user, setUser] = useState();
    const [role, setRole] = useState('');
    const [responseData, setResponseData] = useState('');
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


    // get the user and fire the data fetch
    useEffect(()=>{



        let cookieValue = biscuits.get('sc_user_detail')
            if(cookieValue){
                const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data

                // set the user state variable
                setUser(obj);
                setRole(obj.role);
                
                if(!completed){
                    
                    
                }
                else {
                    console.log("DONE READING");
                }
                
            }
            else{
                console.log('Not found')
                router.push('/')
            }

    },[]);

    async function sendMessageNow(){
        
        setSendingMessage(true);
        
        try {    
            // console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U33/-");
            // console.log(items1);
            
            const result  = await sendBroadcastMessage()
            const queryResult = await result.json() // get data
            console.log(queryResult);
            setResponseData(JSON.stringify(queryResult));
            // check for the status
            // if(queryResult.status == 200){


                setSendingMessage(false);
                toast({description: "Sent Success"});

                // getAllInvoices('','');

                // toast("Event has been created.")

            // }
            // else {
                
            //     setSendingMessage(false);
            // }
        }
        catch (e){
            console.log(e);
            toast({description: "Issue loading. Please refresh or try again later!"});
        }
    }
    
  return (

        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
              <h2 className="text-lg font-semibold mt-4 mb-4">WhatsApp Messaging</h2>

            <div className="flex flex-col">
                <div className="max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="msgHtml">Send a message</Label>
                    {/* <Input id="msg" type="text"  /> */}
                </div>
                {sendingMessage ?
                    <div className="flex flex-row m-12">    
                        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                        <p className={`${inter.className} ${styles.text3}`}>Sending ...</p> 
                    </div>
                    :
                    <Button type="submit"  onClick={sendMessageNow}>Send now</Button>
                }
                
                <p className='py-4'>Response: {responseData}</p>
            </div>


            
              <Toaster />
          
      
    </div>
    
    
  );
}

