'use client';

// pass state variable and the method to update state variable
export default function InvoicesRead() {
    
  return (
    
        // <div className={styles.verticalsection} style={{height:'100vh',gap:'16px'}}>
            
        //   <div style={{height:'8vh',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

        <div  style={{display:'flex',flexDirection:'column', alignItems:'flex-start',height:'100vh',gap:'8px', overflow:'scroll'}}>
            
          Check
    
    </div>
    
    
  );
}



// import { useState } from "react";
// import Tesseract from 'tesseract.js';
// import { getDocument } from 'pdfjs-dist';
// // import 'pdfjs-dist/build/pdf.worker.entry';

// export default function InvoiceUploadPage() {
//   const [basicInfo, setBasicInfo] = useState([]);
//   const [lineItems, setLineItems] = useState([]);
//   const [error, setError] = useState('');

//   const extractTextFromBuffer = async (file) => {
//     const buffer = await file.arrayBuffer();
//     try {
//       const pdf = await getDocument({ data: buffer }).promise;
//       let textContent = '';
//       for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//         const page = await pdf.getPage(pageNum);
//         const textItems = await page.getTextContent();
//         textContent += textItems.items.map(item => item.str).join(' ');
//       }
//       if (textContent.trim().length > 10) {
//         return textContent;
//       }
//       throw new Error('Empty text from PDF');
//     } catch {
//       const img = URL.createObjectURL(file);
//       const result = await Tesseract.recognize(img, 'eng');
//       return result.data.text;
//     }
//   };

//   const handleFileUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const text = await extractTextFromBuffer(file);

//       const invoiceNoMatch = text.match(/Invoice No\.?\s*([\w\-\/]+)/);
//       const invoiceDateMatch = text.match(/Invoice Date\s*(\d{2}\/\d{2}\/\d{4})/);
//       const poNoMatch = text.match(/PO No\s*([\w\-]+)/);

//       const extractedBasic = [
//         { label: 'Invoice No', value: invoiceNoMatch?.[1] || 'Not found' },
//         { label: 'Invoice Date', value: invoiceDateMatch?.[1] || 'Not found' },
//         { label: 'PO No', value: poNoMatch?.[1] || 'Not found' },
//       ];
//       setBasicInfo(extractedBasic);

//       const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

//       const itemLines = lines.filter(line => /^[A-Z0-9]{11}\s/.test(line));

//       const parsedItems = itemLines.map(line => {
//         const parts = line.split(/\s{2,}|\s{1,}/);
//         return {
//           code: parts[0] || '',
//           productName: parts.slice(1, parts.length - 7).join(' '),
//           uom: parts[parts.length - 7] || '',
//           qty: parts[parts.length - 6] || '',
//           rate: parts[parts.length - 5] || '',
//           value: parts[parts.length - 4] || '',
//           taxableValue: parts[parts.length - 3] || '',
//           taxPercent: parts[parts.length - 2] || '',
//           gstAmount: parts[parts.length - 1] || '',
//         };
//       });

//       setLineItems(parsedItems);
//       setError('');
//     } catch (e) {
//       console.error(e);
//       setError('Failed to extract text. Please check the file.');
//     }
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Upload Sale Invoice</h1>

//       <input
//         type="file"
//         accept="application/pdf,image/*"
//         onChange={handleFileUpload}
//         className="mb-6"
//       />

//       {error && <div className="text-red-500 mb-4">{error}</div>}

//       {basicInfo.length > 0 && (
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
//           <table className="min-w-full border border-gray-300 mb-8">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border px-4 py-2">Field</th>
//                 <th className="border px-4 py-2">Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {basicInfo.map((item, index) => (
//                 <tr key={index}>
//                   <td className="border px-4 py-2">{item.label}</td>
//                   <td className="border px-4 py-2">{item.value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h2 className="text-xl font-semibold mb-2">Line Items</h2>
//           <table className="min-w-full border border-gray-300">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border px-4 py-2">Code</th>
//                 <th className="border px-4 py-2">Product Name</th>
//                 <th className="border px-4 py-2">UOM</th>
//                 <th className="border px-4 py-2">Qty</th>
//                 <th className="border px-4 py-2">Rate</th>
//                 <th className="border px-4 py-2">Value</th>
//                 <th className="border px-4 py-2">Tax %</th>
//                 <th className="border px-4 py-2">GST Amt</th>
//               </tr>
//             </thead>
//             <tbody>
//               {lineItems.map((item, index) => (
//                 <tr key={index}>
//                   <td className="border px-4 py-2">{item.code}</td>
//                   <td className="border px-4 py-2">{item.productName}</td>
//                   <td className="border px-4 py-2">{item.uom}</td>
//                   <td className="border px-4 py-2">{item.qty}</td>
//                   <td className="border px-4 py-2">{item.rate}</td>
//                   <td className="border px-4 py-2">{item.value}</td>
//                   <td className="border px-4 py-2">{item.taxPercent}</td>
//                   <td className="border px-4 py-2">{item.gstAmount}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
