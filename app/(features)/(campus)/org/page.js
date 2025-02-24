'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tree } from "./custom_tree"


export default function UserHierarchy() {
//   const [users, setUsers] = useState([])
  const [treeData, setTreeData] = useState([])
  const [treeData1, setTreeData1] = useState([
    {"id":"A0001","name":"KALIDINDI VENKATA VISHNU RAJU","role":"SuperAdmin","designation":"Whole Time Director-AVASL","mapTo":"-","manager_name":null,"manager_role":null},
    {"id":"A0002","name":"CH GANDHI RAJU","role":"SuperAdmin","designation":"AVASL-Marketing Head-AVASL","mapTo":"-","manager_name":null,"manager_role":null},
    {"id":"A0003","name":"CVK RAJU","role":"SuperAdmin","designation":"CEO-ATL","mapTo":"-","manager_name":null,"manager_role":null},
    {"id":"A0004","name":"SAI SUMANTH ","role":"SuperAdmin","designation":"Whole Time Director-ATL","mapTo":"-","manager_name":null,"manager_role":null},
    {"id":"A0005","name":"SATISH CHANDRA KALIDINDI ","role":"SuperAdmin","designation":"GM,HR & ADMIN-VCL","mapTo":"-","manager_name":null,"manager_role":null}
  ])

  const updateInvoicesDataForSelectedAPI = async (pass) => 
    // id, paymentAmount, invoiceList, transactionId, paymentDate, adminId, particular
fetch("/api/v2/user/"+pass+"/U15", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    // body: JSON.stringify(invoicesList),
});

  useEffect(() => {
    const fetchUsers = async () => {

      // Simulate API call - replace with your actual API endpoint
      const response = await fetch("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U15", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    
      const queryResult = await response.json()
      console.log(queryResult);
                        // check for the status
                        if(queryResult.status == 200){
                            // check if data exits
                if(queryResult.data.length > 0){
                    // setUsers(queryResult.data)
                    buildTree(queryResult.data)
                }
            }
            
    }
    fetchUsers()
    // buildTree(treeData1)
  }, [])

  const buildTree = (users = []) => {
    console.log(users);
    
    // Create a map of users by ID for easy lookup
    const userMap = new Map(users.map(user => [user.id, user]))
    
    // Find top-level users (those with no manager or mapTo is null)
    const topLevelUsers = users.filter(user => !user.mapTo || user.mapTo === '-')
    
    const buildTreeNodes = (userIds) => {
      return userIds.map(id => {
        const user = userMap.get(id)
        const childrenIds = users
          .filter(u => u.mapTo === id)
          .map(u => u.id)
        
        return {
          user,
          children: buildTreeNodes(childrenIds)
        }
      })
    }

    setTreeData(buildTreeNodes(topLevelUsers.map(u => u.id)))
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Organizational Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
        {(treeData.length > 0) ?
          <Tree nodes={treeData} />
          /* {treeData1.length === 0 && (
            <p className="text-center text-gray-500">No hierarchy data available</p>
          )} */
        : <p>Check</p>
        }
        </CardContent>
      </Card>
    </div>
  )
}