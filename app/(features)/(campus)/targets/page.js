// This is new implementation for sales targets page to upload their targets via excel sheet
// and view their targets and achievements
// Current implementation is straightforward and it only updates the targets table with target amount & actual amount for a given category and month for a user
// that way we are simplyflying the targets management for dealers

"use client";
import { Inter } from 'next/font/google';
import styles from '../../../../app/page.module.css'
const inter = Inter({ subsets: ['latin'] })
import dayjs from "dayjs";
import { SpinnerGap } from "phosphor-react";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function TargetsPage() {
    const [file, setFile] = useState(null);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchTargets(dayjs().format('YYYY-MM-01'));
    }, []);

    const fetchTargets = async (month) => {
        setLoading(true);
        try {
            // const response = await fetch(`/api/targets/${process.env.NEXT_PUBLIC_API_PASS}/T1/${dayjs().format('YYYY-MM-DD')}/A0004,A0005`);
            const response = await fetch(`/api/v2/user/${process.env.NEXT_PUBLIC_API_PASS}/U7/superadmin`);
            const data = await response.json();

            if (data.status == 200) {
                // get the list from data.data into a list
                var list = data.data || [];

                // parse through the list and create a comma separated string of all ids from each object
                var ids = list.map(item => item.id).join(",");

                const response1 = await fetch(`/api/v2/targets/${process.env.NEXT_PUBLIC_API_PASS}/T1/${month}/${ids}`);
                const data1 = await response1.json();
                
                if (data1.success) {
                    
                    setTargets(data1.data);
                    setLoading(false);
                } else {
                    setMessage({ type: "error", text: data1.message || "Failed to fetch targets" });
                    setLoading(false);
                }
                setLoading(false);
                // setTargets(data.targets);
            }
        } catch (error) {
            console.error("Error fetching targets:", error);
            setMessage({ type: "error", text: "Failed to fetch targets" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage({ type: "", text: "" });
        }
    };

    /**
     * Handles the upload of an Excel file containing target data.
     * Reads the selected file, parses it using XLSX library, converts the first sheet to JSON,
     * and sends the data to the server API endpoint.
     * 
     * @async
     * @function handleUpload
     * @returns {Promise<void>} - Does not return a value
     * @throws {Error} - Catches and handles errors during file processing or API call
     * 
     * @description
     * This function does not use processExcelData. Instead, it directly:
     * 1. Validates that a file is selected
     * 2. Reads the file as an ArrayBuffer
     * 3. Parses the Excel workbook using XLSX.read()
     * 4. Converts the first worksheet to JSON using XLSX.utils.sheet_to_json()
     * 5. Sends the JSON data to "/api/targets/upload" endpoint
     * 6. Updates UI state based on the response
     * 
     * @requires XLSX - SheetJS library for Excel file parsing
     * @requires file - State variable containing the selected File object
     * @requires setMessage - State setter for displaying success/error messages
     * @requires setUploading - State setter for upload loading state
     * @requires setFile - State setter to clear the file after successful upload
     * @requires fetchTargets - Function to refresh the targets list after upload
     */
    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: "error", text: "Please select a file first" });
            return;
        }

        setUploading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            
            // Read data from all sheets
            let allJsonData = [];
            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                allJsonData = [...allJsonData, ...sheetData];
            });

            // Process the combined data using processExcelData
            const processedTargets = processExcelData(allJsonData);
            

            const response = await fetch("/api/v2/targets/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targets: processedTargets }),
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: "success", text: "Targets uploaded successfully" });
                setFile(null);
                fetchTargets();
            } else {
                setMessage({ type: "error", text: result.message || "Upload failed" });
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage({ type: "error", text: error.message || "Error processing file" });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                "S.NO.": 1,
                "DEALER NAME": "Example Dealer",
                "GST ID": "37EXAMPLE1Z0",
                "ATL": 10000,
                "ATL_Actual": 0,
                "VCL": 6000,
                "VCL_Actual": 0,
                "COLLECTION": 3000000,
                "Collection_Actual": 0,
            },
        ];
        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Targets");
        XLSX.writeFile(workbook, "targets_template.xlsx");
    };

    const processExcelData = (jsonData) => {
        const currentDate = new Date();
        const monthDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
        
        const processedTargets = [];
        
        jsonData.forEach((row) => {
            const userId = row["GST ID"];
            if (!userId) return;
            
            // ATL - categoryId: 2
            if (row["ATL"] !== undefined || row["ATL_Actual"] !== undefined) {
                processedTargets.push({
                    userId: userId,
                    categoryId: 2,
                    monthDate: monthDate,
                    targetAmount: parseFloat(row["ATL"]) || 0,
                    actualAmount: parseFloat(row["ATL_Actual"]) || 0,
                });
            }
            
            // VCL - categoryId: 1
            if (row["VCL"] !== undefined || row["VCL_Actual"] !== undefined) {
                processedTargets.push({
                    userId: userId,
                    categoryId: 1,
                    monthDate: monthDate,
                    targetAmount: parseFloat(row["VCL"]) || 0,
                    actualAmount: parseFloat(row["VCL_Actual"]) || 0,
                });
            }
            
            // Collection - categoryId: 3
            if (row["COLLECTION"] !== undefined || row["Collection_Actual"] !== undefined) {
                processedTargets.push({
                    userId: userId,
                    categoryId: 3,
                    monthDate: monthDate,
                    targetAmount: parseFloat(row["COLLECTION"]) || 0,
                    actualAmount: parseFloat(row["Collection_Actual"]) || 0,
                });
            }
        });
        
        return processedTargets;
    };

    return (
        <div  className={inter.className} style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
        
        <div className="overflow-scroll mx-auto py-6 pr-6 pl-1" style={{width:'100%',height:'100%'}}>
            <h1 className="text-2xl font-bold mb-6">Sales Targets Management</h1>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Upload Targets</h2>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="border rounded p-2"
                        />
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                        <button
                            onClick={downloadTemplate}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Download Template
                        </button>
                    </div>
                    {message.text && (
                        <div
                            className={`p-3 rounded ${
                                message.type === "error"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Month Selector */}
            <div className='flex flex-row items-center py-6 justify-between'>
                
                <div className="flex flex-row items-center gap-2">
                    <h2 className="text-lg font-semibold">Targets</h2>
                    <select
                        onChange={(e) => {
                            const selectedMonth = e.target.value;
                            fetchTargets(selectedMonth);
                        }}
                        className="shadow w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {Array.from({ length: 12 }, (_, i) => {
                            const date = dayjs().subtract(i, 'month');
                            return (
                                <option key={i} value={date.format('YYYY-MM-01')}>
                                    {date.format('MMM YYYY')}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <button
                    onClick={() => {
                        const worksheet = XLSX.utils.json_to_sheet([]);
                        const workbook = XLSX.utils.book_new();
                        
                        // Add headers
                        const headers = ['Dealer', 'VCL Target', 'VCL Actual', 'VCL Achieved %', 'ATL Target', 'ATL Actual', 'ATL Achieved %', 'Collection Target', 'Collection Actual', 'Collection Achieved %'];
                        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
                        
                        // Add data rows
                        const data = targets.map((item) => {
                            const categoryMap = {};
                            if (Array.isArray(item.targets)) {
                                item.targets.forEach(target => {
                                    if (!categoryMap[target.categoryId]) {
                                        categoryMap[target.categoryId] = [];
                                    }
                                    categoryMap[target.categoryId].push(target);
                                });
                            }
                            
                            const getCategoryValues = (categoryId) => {
                                const targetEntry = categoryMap[categoryId]?.find(t => t.targetAmount !== undefined) || {};
                                const actualEntry = categoryMap[categoryId]?.find(t => t.actualAmount !== undefined) || {};
                                const targetAmount = Number(targetEntry.targetAmount ?? 0);
                                const actualAmount = Number(actualEntry.actualAmount ?? 0);
                                return {
                                    targetAmount,
                                    actualAmount,
                                    achievement: targetAmount > 0 ? ((actualAmount / targetAmount) * 100).toFixed(1) : "0.0",
                                };
                            };
                            
                            const vcl = getCategoryValues(1);
                            const atl = getCategoryValues(2);
                            const collection = getCategoryValues(3);
                            
                            return [item.name, vcl.targetAmount, vcl.actualAmount, vcl.achievement, atl.targetAmount, atl.actualAmount, atl.achievement, collection.targetAmount, collection.actualAmount, collection.achievement];
                        });
                        
                        XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A2' });
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Targets");
                        XLSX.writeFile(workbook, `targets_${dayjs().format('YYYY-MM-DD')}.xlsx`);
                    }}
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Download Targets
                </button>
            </div>

<div className="mx-auto" style={{width:'100%',height:'100%'}}>
            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="flex flex-row p-12">    
                        <SpinnerGap className={`${styles.icon} ${styles.load}`} /> &nbsp;
                        <p className={`${inter.className} ${styles.text3}`}>Loading targets...</p> 
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left rounded-tl-lg">Dealer</th>
                                    {/* <th className="px-4 py-2 text-left">Month</th> */}
                                    <th colSpan="3" className="px-4 py-2 text-center bg-orange-300">VCL (boxes)</th>
                                    <th colSpan="3" className="px-4 py-2 text-center bg-pink-300">ATL (boxes)</th>
                                    <th colSpan="3" className="px-4 py-2 text-center bg-indigo-300 rounded-tr-lg">Collections (INR)</th>
                                </tr>
                                <tr className="bg-gray-50">
                                    <th colSpan="1"></th>
                                    <th className="px-4 py-2 text-right bg-orange-200">Target</th>
                                    <th className="px-4 py-2 text-right bg-orange-200">Actual</th>
                                    <th className="px-4 py-2 text-right bg-orange-200">Achieved</th>
                                    <th className="px-4 py-2 text-right bg-pink-200">Target</th>
                                    <th className="px-4 py-2 text-right bg-pink-200">Actual</th>
                                    <th className="px-4 py-2 text-right bg-pink-200">Achieved</th>
                                    <th className="px-4 py-2 text-right bg-indigo-200">Target</th>
                                    <th className="px-4 py-2 text-right bg-indigo-200">Actual</th>
                                    <th className="px-4 py-2 text-right bg-indigo-200">Achieved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {targets?.map((item, index) => {
                                    const categoryMap = {};
                                    
                                    if (Array.isArray(item.targets)) {
                                        item.targets.forEach(target => {
                                            if (!categoryMap[target.categoryId]) {
                                                categoryMap[target.categoryId] = [];
                                            }
                                            categoryMap[target.categoryId].push(target);
                                        });
                                    }

                                    const getCategoryValues = (categoryId) => {
                                        const targetEntry = categoryMap[categoryId]?.find(t => t.targetAmount !== undefined) || {};
                                        const actualEntry = categoryMap[categoryId]?.find(t => t.actualAmount !== undefined) || {};
                                        
                                        const targetAmount = Number(targetEntry.targetAmount ?? 0);
                                        const actualAmount = Number(actualEntry.actualAmount ?? 0);

                                        return {
                                            targetAmount,
                                            actualAmount,
                                            achievement:
                                                targetAmount > 0
                                                    ? ((actualAmount / targetAmount) * 100).toFixed(1)
                                                    : "0.0",
                                        };
                                    };

                                    const vcl = getCategoryValues(1);
                                    const atl = getCategoryValues(2);
                                    const collection = getCategoryValues(3);

                                    return (
                                        <tr
                                            key={`${item.userId || item.id || index}`}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2">{item.name}
                                                <br/><span className="text-sm text-gray-500">{item.userId || item.id || "-"}</span></td>
                                            {/* <td className="px-4 py-2">{item.name}</td> */}
                                            
                                            <td className="px-4 py-2 text-right bg-orange-100 font-mono">{vcl.targetAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-orange-100 font-mono">{vcl.actualAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-orange-100 font-mono">{vcl.achievement}%</td>

                                            <td className="px-4 py-2 text-right bg-pink-100 font-mono">{atl.targetAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-pink-100 font-mono">{atl.actualAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-pink-100 font-mono">{atl.achievement}%</td>

                                            <td className="px-4 py-2 text-right bg-indigo-100 font-mono">{collection.targetAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-indigo-100 font-mono">{collection.actualAmount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-right bg-indigo-100 font-mono">{collection.achievement}%</td>
                                        </tr>
                                    );
                                })}
                                {targets.length === 0 && (
                                    <tr>
                                        <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                                            No targets found. Upload an Excel file to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
}