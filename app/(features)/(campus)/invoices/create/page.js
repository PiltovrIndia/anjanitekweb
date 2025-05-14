// 'use client';

// import { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { toWords } from 'number-to-words';

// const formatRupee = (num) => {
//   return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num);
// };

// const numberToWords = (amount) => {
//   return toWords(amount).replace(/\b(\w)/g, l => l.toUpperCase()) + ' Rupees Only';
// };

// const productCatalog = [
//   { code: 'T31ATL9063JA', name: 'CLASSIC TRAVERTINO DGVT PRM 600X1200', rate: '433.57' },
//   { code: 'T31ATL9085JA', name: 'ESTILO WHITE DGVT PRM 600X1200', rate: '433.57' },
//   { code: 'T31ATL9100JB', name: 'ARMANI BEIGE DGVT STD 600X1200', rate: '356.50' },
// ];

// export default function InvoiceGeneratorPage() {
//   const generateInvoiceNo = () => {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     return `INV/${year}/${month}/${day}/${Math.floor(1000 + Math.random() * 9000)}`;
//   };

//   const [invoiceData, setInvoiceData] = useState({
//     invoiceNo: generateInvoiceNo(),
//     invoiceDate: new Date().toISOString().slice(0, 10),
//     poNo: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
//     receiver: 'K.S.R. CERAMICS',
//     shipTo: 'K.S.R. CERAMICS',
//     vehicleNo: 'AP39UK5677',
//     lrNo: '1002',
//     transporter: 'SRI SITARAMA LOGISTICS',
//     companyAddress: 'SITE NO.1, BASEMENT, KATHA NO.291/343, 284/343, KOWDENAHALLI VILLAGE, T.C. PALYA MAIN ROAD, R.M. NAGAR, BENGALURU, 560016',
//     gstin: '29CVNPS4409K1ZT',
//     items: [
//       { code: '', name: '', uom: 'BOX', qty: '', rate: '', value: '', gst: '18' },
//     ],
//   });

//   const [previewMode, setPreviewMode] = useState(false);

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...invoiceData.items];
//     newItems[index][field] = value;
//     if (field === 'code') {
//       const selectedProduct = productCatalog.find(p => p.code === value);
//       if (selectedProduct) {
//         newItems[index].name = selectedProduct.name;
//         newItems[index].rate = selectedProduct.rate;
//       }
//     }
//     if (field === 'qty' || field === 'rate') {
//       const qty = parseFloat(newItems[index].qty) || 0;
//       const rate = parseFloat(newItems[index].rate) || 0;
//       newItems[index].value = (qty * rate).toFixed(2);
//     }
//     setInvoiceData({ ...invoiceData, items: newItems });
//   };

//   const addItem = () => {
//     setInvoiceData({
//       ...invoiceData,
//       items: [...invoiceData.items, { code: '', name: '', uom: 'BOX', qty: '', rate: '', value: '', gst: '18' }],
//     });
//   };

//   const calculateSubtotal = () => {
//     return invoiceData.items.reduce((sum, item) => sum + parseFloat(item.value || '0'), 0);
//   };

//   const calculateTaxSplit = (total) => {
//     const half = (total * 0.09).toFixed(2);
//     return { cgst: half, sgst: half, igst: '0.00' };
//   };

//   const calculateTotal = () => {
//     return (calculateSubtotal() * 1.18).toFixed(2);
//   };

//   const generatePDF = () => {
//     const input = document.getElementById('invoice-content');
//     if (!input) return;

//     html2canvas(input, { scale: 2 }).then(canvas => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       let position = 0;
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
//       if (imgHeight > pageHeight) {
//         position = imgHeight - pageHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, imgHeight);
//       }
//       pdf.save(`${invoiceData.invoiceNo}.pdf`);
//     });
//   };

//   const taxSplit = calculateTaxSplit(calculateSubtotal());

//   return (
//     <div className="p-6 font-sans text-[13px]">
//       <h1 className="text-3xl font-bold mb-4 text-center">TAX INVOICE</h1>

//       <div className="text-center mb-6">
//         <img src="/anjani_logo.webp" alt="Company Logo" className="mx-auto w-32 h-auto" />
//         <div className="text-sm mt-2">{invoiceData.companyAddress}</div>
//         <div className="text-sm">GSTIN: {invoiceData.gstin}</div>
//       </div>

//       <div id="invoice-content" className={`p-6 border border-gray-400 ${previewMode ? 'pointer-events-none opacity-90' : ''}`}>
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div>
//             <div>Receiver: <input value={invoiceData.receiver} onChange={(e) => setInvoiceData({ ...invoiceData, receiver: e.target.value })} className="border p-1 w-full" /></div>
//             <div>Ship To: <input value={invoiceData.shipTo} onChange={(e) => setInvoiceData({ ...invoiceData, shipTo: e.target.value })} className="border p-1 w-full" /></div>
//           </div>
//           <div>
//             <div>Invoice No: <input value={invoiceData.invoiceNo} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNo: e.target.value })} className="border p-1 w-full" /></div>
//             <div>Invoice Date: <input type="date" value={invoiceData.invoiceDate} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })} className="border p-1 w-full" /></div>
//             <div>PO No: <input value={invoiceData.poNo} onChange={(e) => setInvoiceData({ ...invoiceData, poNo: e.target.value })} className="border p-1 w-full" /></div>
//           </div>
//         </div>

//         <div className="grid grid-cols-3 gap-4 mb-6">
//           <div>Vehicle No: <input value={invoiceData.vehicleNo} onChange={(e) => setInvoiceData({ ...invoiceData, vehicleNo: e.target.value })} className="border p-1 w-full" /></div>
//           <div>LR No: <input value={invoiceData.lrNo} onChange={(e) => setInvoiceData({ ...invoiceData, lrNo: e.target.value })} className="border p-1 w-full" /></div>
//           <div>Transporter: <input value={invoiceData.transporter} onChange={(e) => setInvoiceData({ ...invoiceData, transporter: e.target.value })} className="border p-1 w-full" /></div>
//         </div>

//         <table className="min-w-full border border-gray-400 text-xs mb-6">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border px-2 py-1">SNo</th>
//               <th className="border px-2 py-1">Code</th>
//               <th className="border px-2 py-1">Product Name</th>
//               <th className="border px-2 py-1">UOM</th>
//               <th className="border px-2 py-1">Qty</th>
//               <th className="border px-2 py-1">Rate</th>
//               <th className="border px-2 py-1">Value</th>
//               <th className="border px-2 py-1">GST%</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoiceData.items.map((item, index) => (
//               <tr key={index}>
//                 <td className="border px-2 py-1 text-center">{index + 1}</td>
//                 <td className="border px-2 py-1">
//                   <select value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} className="border p-1 w-full">
//                     <option value="">Select</option>
//                     {productCatalog.map((prod) => (
//                       <option key={prod.code} value={prod.code}>{prod.code}</option>
//                     ))}
//                   </select>
//                 </td>
//                 <td className="border px-2 py-1">{item.name}</td>
//                 <td className="border px-2 py-1">{item.uom}</td>
//                 <td className="border px-2 py-1"><input value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className="border p-1 w-full" /></td>
//                 <td className="border px-2 py-1">{item.rate}</td>
//                 <td className="border px-2 py-1 text-right">{formatRupee(item.value)}</td>
//                 <td className="border px-2 py-1">{item.gst}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <button onClick={addItem} className="mb-4 bg-green-500 text-white px-4 py-2 rounded">Add Item</button>

//         <div className="text-right mb-6">
//           <div>Subtotal: {formatRupee(calculateSubtotal())}</div>
//           <div>CGST (9%): {formatRupee(taxSplit.cgst)}</div>
//           <div>SGST (9%): {formatRupee(taxSplit.sgst)}</div>
//           <div>IGST: {formatRupee(taxSplit.igst)}</div>
//           <div className="font-bold">Grand Total: {formatRupee(calculateTotal())}</div>
//         </div>

//         <div className="text-right mt-6">
//           <div>Amount in Words: <i>{numberToWords(parseInt(calculateTotal()))}</i></div>
//         </div>

//         <div className="mt-8 text-sm">
//           <div className="border-t border-gray-300 pt-2 text-right">Authorised Signatory: ____________________</div>
//         </div>
//       </div>

//       <div className="text-center mt-6 space-x-4">
//         <button onClick={() => setPreviewMode(!previewMode)} className="bg-yellow-500 text-white px-6 py-3 rounded">
//           {previewMode ? 'Edit' : 'Preview'}</button>
//         <button onClick={generatePDF} className="bg-blue-600 text-white px-6 py-3 rounded">Download PDF</button>
//       </div>
//     </div>
//   );
// }
