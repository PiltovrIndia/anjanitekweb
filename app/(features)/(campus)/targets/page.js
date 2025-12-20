// This is new implementation for sales targets page to upload their targets via excel sheet
// and view their targets and achievements
// Current implementation is straightforward and it only updates the targets table with target amount & actual amount for a given category and month for a user
// that way we are simplyflying the targets management for dealers

"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function TargetsPage() {
    const [file, setFile] = useState(null);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/targets");
            const data = await response.json();
            if (data.success) {
                setTargets(data.targets);
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

            console.log(processedTargets);
            

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
        <div className="container mx-auto p-6">
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

            {/* Targets Table */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Targets & Achievements</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">User ID</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Month</th>
                                    <th className="px-4 py-2 text-right">Target Amount</th>
                                    <th className="px-4 py-2 text-right">Actual Amount</th>
                                    <th className="px-4 py-2 text-right">Achievement %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {targets.map((target, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{target.user_id}</td>
                                        <td className="px-4 py-2">{target.category}</td>
                                        <td className="px-4 py-2">{target.month}</td>
                                        <td className="px-4 py-2 text-right">
                                            {target.target_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {target.actual_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {target.target_amount > 0
                                                ? ((target.actual_amount / target.target_amount) * 100).toFixed(1)
                                                : 0}
                                            %
                                        </td>
                                    </tr>
                                ))}
                                {targets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
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
    );
}