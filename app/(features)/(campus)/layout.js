'use client'
import { Inter } from 'next/font/google'
import styles from '../../../app/page.module.css'
import { Monitor, UserFocus, Chats, ArrowSquareOut, PresentationChart, IdentificationBadge, CalendarCheck, UserPlus, FileImage, PersonSimpleRun, Files, Rows, Power, Receipt } from 'phosphor-react'
import Image from 'next/image'
import Biscuits from 'universal-cookie'
const biscuits = new Biscuits
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import Registration from './registration/form/page'

import { Toaster } from "@/app/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })
// const montserrat = Montserrat({ subsets: ['latin'] })

// export const metadata = {
//     title: 'Dashboard',
//     description: 'Overview of your campus',
//   }
  
  export default function CampusLayout({ children }) {

    // // variable to store the active tab
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [userData, setUserData] = useState();
    const [name, setName] = useState();
    var userName = '';
    const [role, setRole] = useState();
    const [id, setId] = useState();
    // function handleTabChange(tabName){
    //     setSelectedTab(tabName);
    //     console.log(tabName);
    //   }
    
    // create a router for auto navigation
    const router = useRouter();
    // setTab();
    // clear cookies or logout and navigate to verification
    function clearCookies(){

      //  document.cookie = "";
      biscuits.remove('sc_user_detail')
      router.push('/')
      
  }

  // this will ask you to stop before reloading
  useEffect(() => {


    let cookieValue = biscuits.get('sc_user_detail')
    if(cookieValue){
        const obj = JSON.parse(decodeURIComponent(cookieValue)) // get the cookie data
        userName = obj.name;
        // configure some variables
        setUserData(obj);
        setName(obj.name);
        setRole(obj.role);
        setId(obj.collegeId);

        // set the user state variable
        
        // get the requests data if doesnot exist
        // if(!requests){

        //     // set the view by status based on the role
            if(obj.role == 'SuperAdmin'){
                setSelectedTab('Dashboard')
                // getData(obj.role, 'Returned', obj.collegeId, obj.branch);
            }
            else if(obj.role == 'admin'){
                setSelectedTab('Dealers')
                // getData(obj.role, 'Returned', obj.collegeId, obj.branch);
            }
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
        router.push('/')
    }

    // const handleBeforeUnload = (event) => {
    //   event.returnValue = 'ok ok';
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // }
  }, []);

    
    // Navigation
    function navigateDashboard(){
      // biscuits.set('selectedTab', 'Dashboard', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Dashboard')
      router.push('/dashboard')
    }
    function navigateDealers(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Dealers')
      router.push('/dealers')
    }
    function navigateInvoices(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Invoices')
      router.push('/invoices')
    }
    function navigateSales(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Sales')
      router.push('/sales')
    }
    function navigateDealersPending(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Dashboard2')
      router.push('/dashboard2')
    }
    function navigateMessages(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Messages')
      router.push('/messages')
    }
    function navigateFeed(){
      // biscuits.set('selectedTab', 'Dealers', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Feed')
      router.push('/feed')
    }
    function navigateRegistration(){
      // biscuits.set('selectedTab', 'Registration', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Registration')
      router.push('/registration/form')
    }
    function navigateManageImages(){
      // biscuits.set('selectedTab', 'Registration', {path: '/', expires: new Date(Date.now() + 10800000)})
      setSelectedTab('Manage images')
      router.push('/manageimages')
    }

    return (


        <div className={styles.main}>
          
        <div className={inter.className}>
          <div className={styles.topbar} style={{height:'6vh'}}>
            <div className={styles.horizontalsection}>
              <Image src="/anjani_title.webp" alt="Anjani Tek" width={130} height={36} priority style={{height:'auto'}}/>
              {/* <span style={{color: '#CCCCCC'}}>|</span>
              <Image src="/anjani_title.webp" alt="Anjani Tek" width={90} height={40} priority style={{height:'auto'}} /> */}
              {/* <Image src="/svecw_sc_logo.svg" alt="Smart Campus" width={90} height={40} priority style={{height:'auto'}} /> */}
              {/* <h3>Smart Campus</h3> */}
            </div>
            <div>
              <p onClick={clearCookies.bind(this)} className={`${inter.className} ${styles.text2}`} style={{cursor:'pointer'}} >Log out</p>
              {/* <p className={`${inter.className} ${styles.text2}`} style={{cursor:'pointer'}} >{userName}</p> */}
              {/* <p className={`${inter.className} ${styles.text2}`} style={{cursor:'pointer'}} >{JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).name}</p> */}
              {/* <ProfileBtn show={false} /> */}
            </div>
          </div>
         
          <div style={{border: '0.5px solid #E5E7EB', width:'100vw'}}></div>
              
              
          
        </div>

      <div className={styles.mainlayoutsection} style={{height:'94vh',gap:'0px'}}>

        {(role != 'Student') ? 
            <div style={{padding:'24px 0px 24px 0px',height: '100%',borderRight: '1px solid #efefef',width:'15%', display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
              
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              {(role == 'SuperAdmin' || role == 'SalesManager' ) ? <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Dashboard' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateDashboard.bind(this)} style={{cursor:'pointer'}}><Monitor className={styles.menuicon}/> Dashboard</div> : <div></div>}
              {(role == 'SuperAdmin') ? <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Invoices' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateInvoices.bind(this)} style={{cursor:'pointer'}}><Receipt className={styles.menuicon}/> Invoices</div> : <div></div>}
                <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Dealers' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateDealers.bind(this)} style={{cursor:'pointer'}}><UserFocus className={styles.menuicon}/> Dealers</div>
                {(role == 'SuperAdmin') ? <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Sales' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateSales.bind(this)} style={{cursor:'pointer'}}><UserFocus className={styles.menuicon}/> Sales</div> : <div></div>}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Dealers Pending' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateDealersPending.bind(this)} style={{cursor:'pointer'}}><UserFocus className={styles.menuicon}/> Dealers Pending</div> */}
                <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Messages' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateMessages.bind(this)} style={{cursor:'pointer'}}><Chats className={styles.menuicon}/> Messages</div>
                <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Feed' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateFeed.bind(this)} style={{cursor:'pointer'}}><Rows className={styles.menuicon}/> Feed</div>
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Outing Requests' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateOuting.bind(this)} style={{cursor:'pointer'}}><PersonSimpleRun className={styles.menuicon}/> Outing Requests</div> */}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Outing Reports' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateOutingReports.bind(this)} style={{cursor:'pointer'}}><Files className={styles.menuicon}/> Outing Reports</div> */}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${styles.text2}`} style={{cursor:'pointer'}}><ArrowSquareOut className={styles.menuicon} style={{backgroundColor: '#26379b'}}/> Outing</div>
                <div className={`${styles.horizontalsection} ${inter.className} ${styles.text2}`} style={{cursor:'pointer'}}><PresentationChart className={styles.menuicon} style={{backgroundColor: '#26379b'}}/> Reports</div> */}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Registration' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateRegistration.bind(this)} style={{cursor:'pointer'}}><UserPlus className={styles.menuicon}/> Registration</div> */}
                
                {/* {id == 'S33' ? <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Manage images' ? styles.leftMenuItem_selected : styles.leftMenuItem} `} onClick={navigateManageImages.bind(this)} style={{cursor:'pointer'}}><FileImage className={styles.menuicon}/> Manage images</div> : ''} */}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${selectedTab == 'Registration' ? styles.text1 : styles.text2}`} onClick={navigateRegistration.bind(this)} style={{cursor:'pointer'}}><IdentificationBadge className={styles.menuicon} style={{backgroundColor: '#26379b'}}/> Visitor pass</div> */}
                {/* <div className={`${styles.horizontalsection} ${inter.className} ${styles.text2}`} ><CalendarCheck className={styles.menuicon} /> Control campus outing</div> */}
              </div>
              
              {userData ?
              <div className={styles.verticalsection} style={{gap:'8px',padding: '8px',backgroundColor: '#f0f0f0',border: '1px solid #e5e5e5',borderRadius: '8px',margin: '0px 12px'}}>
                  <p className={`${inter.className} ${styles.text3}  ${styles.tag}`} style={{cursor:'pointer'}} >{userData.name} - {userData.role}</p>
                  {/* <p className={`${inter.className} ${styles.text1}`} style={{cursor:'pointer'}} >{userData.name}</p> */}
                  <p onClick={clearCookies.bind(this)} className='flex flex-row gap-2 items-center text-slate-600 cursor-pointer' ><Power className={styles.menuicon}/> Log out</p>
              </div>
              : ''}
            </div>
          : ''}

        <div className={styles.maindivcenter} style={{height:'90vh', padding: '0px 24px', overflow: 'hidden', scroll:'no'}}>
        {/* <div className={styles.maindivcenter} style={{height:'90vh', contentVisibility:'auto',padding: '0px 24px'}}> */}
            
{/* 
          <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>
              <h2 className={montserrat.className}>{selectedTab}</h2>
          </div> */}

          {children}

          <Toaster />
        </div>
          
        </div>





          {/* <div className={`${styles.bottombar} ${montserrat.className} ${styles.text3}`} style={{display: 'flex', flexDirection:'column', height:'4vh'}}> 
          Made with 💙 to empower campuses
          <br/>
            
          </div> */}
      </div>
    )
  }
  