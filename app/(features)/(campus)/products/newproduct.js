import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Upload, X } from "phosphor-react";
import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import dayjs from "dayjs";
import { toast } from "@/app/components/ui/use-toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import firebase from "@/app/firebase";
const storage = getStorage(firebase, "gs://anjanitek-communications.firebasestorage.app");
const spaceRef = ref(storage, '/');

export default function NewProductDialog({ tags, isOpen, onClose, createProduct }) {
    const [product, setProduct] = useState({ "productId":"", "design":"", "name":"", "description":"", "size":"", "tags":"", "imageUrls":"","createdOn":""});
    const [selectedTags, setSelectedTags] = useState([]);
    // const [productImage, setProductImage] = useState(false);

    const [uploadedProductImageUrl, setUploadedProductImageUrl] = useState([])
    const [uploadedProductImageName, setUploadedProductImageName] = useState([])
    const [compressedImage, setCompressedImage] = useState(null)
    const [productImageProgress, setProductImageProgress] = useState(0);
    const [productImage1, setProductImage1] = useState(false);
        

  // Group tags by type
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.type]) acc[tag.type] = [];
    acc[tag.type].push(tag);
    return acc;
  }, {});

  // Handle checkbox selection
  const handleTagChange = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Handle removing tag from selected list
  const handleRemoveTag = (tagId) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };


    // create Product
    async function createProductFunctionCall(){
        
        // receiver is always the dealer
        try{
            let sizeTag = '';
            tags.forEach(tag => {
                if (tag.type === 'Size') {
                selectedTags.forEach(tagId => {
                    if (tag.tagId == tagId) {
                        sizeTag = tag.name;
                    }
                });
                }
            });
            if(document.getElementById('name').value.length > 0 && 
            document.getElementById('design').value.length > 0 && 
            document.getElementById('description').value.length > 0 && 
            selectedTags.length > 0 ){
                
                // show and hide message
                toast({description: "Creating Product. Please wait ...",});

                const productData = {
                    design: document.getElementById('design').value,
                    name: document.getElementById('name').value,
                    description: document.getElementById('description').value,
                    size: sizeTag,
                    tags: selectedTags.join(','),
                    imageUrls: uploadedProductImageName.join(','),
                    createdOn: dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss')
                };

                setUploadedProductImageUrl([]);
                setUploadedProductImageName([]);
               
                createProduct(productData);
                // if (Object.keys(productData).length > 0) {

                //     // console.log("/api/v2/user/"+process.env.NEXT_PUBLIC_API_PASS+"/U12/"+JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role+"/"+JSON.stringify(updateDataBasic)+"/"+encodeURIComponent(JSON.stringify(updateDataDealer)));
                //     const result  = await createUser(process.env.NEXT_PUBLIC_API_PASS, JSON.parse(decodeURIComponent(biscuits.get('sc_user_detail'))).role, JSON.stringify(updateDataBasic)+"/"+encodeURIComponent(JSON.stringify(updateDataDealer)))
                //     const queryResult = await result.json() // get data
                //     // console.log(queryResult);
                    
                //     // check if query result status is 200
                //     if(queryResult.status == 200) {
                //         // set the state variables with the user data
                        
                //         setAllDealers([updateDataBasic, ...allDealers]);
                //         // setAllSalesPeople([...allSalesPeople, updateDataBasic]);
                //         toast({description: "Dealer created and added to the list",});
                //         setCreatingPerson(false);

                //     } else if(queryResult.status == 404) {
                //         setCreatingPerson(false);
                //         // show and hide message
                //         toast({description: "Facing issues, try again later!",});
                //     }

                // }
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

    // select from device for upload
    const uploadFromDevice = async (event) => {
            
        // setProductImage(!productImage); 

        const file = event.target.files[0]
        if (file && file.type.startsWith("image/")) {
            console.log(file);
            
        const compressed = await compressImage(file, document.getElementById('design').value+".webp")
        console.log(compressed);
        
            if (compressed) {
                setCompressedImage(compressed)
                
                toast({title: "Image selected!",})
                // toast({
                //     title: "Image selected!",
                //     description: `Reduced from ${(file.size / 1024).toFixed(2)}KB to ${(compressed.size / 1024).toFixed(2)}KB`,
                // })
            } else {
                toast({
                    title: "Selection failed, try again",
                    description: "Image should be less than 50KB.",
                    variant: "destructive",
                })
            }
        } else {
        toast({
            title: "Invalid file type",
            description: "Please select an image file.",
            variant: "destructive",
        })
        }
    }

    const compressImage = async (file, name) => {
        const options = {
            maxSizeMB: 5, // Max size is 5MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.9, // Start with high quality
        }

        try {
        let compressedFile = await imageCompression(file, options)

        // If the file is still too large, gradually reduce quality
        let currentQuality = 0.9
        while (compressedFile.size > 200 * 1024 && currentQuality > 0.5) {
            currentQuality -= 0.1
            options.initialQuality = currentQuality
            compressedFile = await imageCompression(file, options)
        }

        if (compressedFile.size <= 200 * 1024) {

            // compressedFile.name = 'ss333_1.jpeg';
            compressedFile.name = name;

            console.log(compressedFile.name);

            return compressedFile
        } else {
            throw new Error("Unable to compress image below 50KB while maintaining acceptable quality")
        }
        } catch (error) {
            console.error("Error compressing image:", error)
        return null
        }
    }



    async function uploadPics(file){

        try {
            /** @type {any} */
            const metadata = {
                contentType: 'image/webp'
            };
            
            // Upload file and metadata to the object 'images/mountains.jpg'
            
            const storageRef = ref(storage, '/' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
                (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                
                setProductImageProgress(progress);
                
                switch (snapshot.state) {
                    case 'paused':
                    
                    break;
                    case 'running':
                    
                    break;
                }
            }, 
            (error) => {
                console.log(error.message);
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                
                case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
                case 'storage/canceled':
                // User canceled the upload
                break;
    
                // ...
    
                case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
            }, 
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);

                // check if the file.name contains '_' character
                
                    // updateUserImageToDB();
                    // setSelectedStudent((prevState) => ({...prevState, imageUrls: downloadURL}) );
                    setUploadedProductImageUrl((prevUrls) => [...prevUrls, downloadURL]);
                    setUploadedProductImageName((prevNames) => [...prevNames, file.name]);
                    
                    // setProductImage(false);
                    // setCapturedImage(null);
                    setCompressedImage(null);
                    
                    // updateUserImageToDB();
                

            });
            }
            );
        } catch (error) {
            console.log(error);
            // setProductImage(false);
            // setCapturedImage(null);
            toast({title:"Error occured",variant:'destructive', description: "Issue loading. Please refresh or try again later!",});
            
        }
        
        
  
    }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold gap-1 flex flex-col items-start">
            Create Product
            <div className="flex justify-stretch pt-4 gap-2 w-full">
                <Input
                    id="name"
                    type="text"
                    placeholder="Product name"
                    // value={product.name}
                    // onChange={(e) => product.name = e.target.value}
                    // className="ml-4"
                />
                <Input
                    id="design"
                    type="text"
                    placeholder="Design code"
                    // value={product.design}
                    // onChange={(e) => product.design = e.target.value}
                    // className="ml-4"
                />
            </div>
            <Input
                id="description"
                type="text"
                placeholder="Product description"
                // value={product.design}
                // onChange={(e) => product.description = e.target.value}
                // className="ml-4"
            />
            <div className="flex gap-2">
                {uploadedProductImageUrl.map((url, index) => (
                    <Image
                        key={index}
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        width={60}
                        height={60}
                        className="object-cover rounded"
                    />
                ))}
            </div>
            {(productImageProgress > 0 && productImageProgress != 100) ?
                <div className='w-full '>
                    <Progress value={productImageProgress} max={100} className='w-full h-1' />
                    <p className='text-sm text-blue-600'>Uploading...</p>
                </div> : ''}
            <div className='flex flex-col items-center gap-2'>
                {/* <ImageComponentLarge imageUrl={currentImageUrl} id={selectedStudent.collegeId} username={selectedStudent.username}/> */}
                <div className='flex flex-col items-center gap-1'>
                {(productImageProgress > 0 && productImageProgress != 100) ?
                <div className='w-full '>
                    <Progress value={productImageProgress} max={100} className='w-full h-1' />
                    <p className='text-sm text-blue-600'>Uploading...</p>
                </div> : ''}
                   
                    {/* upload from device */}
                    <Dialog open={productImage1} onOpenChange={setProductImage1}>
                        <DialogTrigger asChild>
                            <Button className='py-2 px-4 bg-white hover:bg-gray-100 text-gray text-sm font-medium leading-none h-min rounded-md border border-gray hover:shadow-lg'  onClick={() => document.getElementById("image-input").click()}><Upload className="mr-2 h-4 w-4"/> Upload from device</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader> <DialogTitle>Selected Image</DialogTitle> <DialogDescription>Review your selected image before upload.</DialogDescription> </DialogHeader>
                            {compressedImage && (
                            <div className="space-y-2">
                                <img src={URL.createObjectURL(compressedImage)} alt="Selected" className="max-w-full h-auto" />
                                <p className="text-sm font-medium">{compressedImage.name}</p>
                                <p className="text-sm text-muted-foreground">Size: {(compressedImage.size / 1024).toFixed(2)} KB</p>
                            </div>
                            )}
                            <DialogFooter>
                            <Button onClick={()=>{uploadPics(compressedImage); setProductImage1(false);}}>Upload</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <input type="file" accept="image/*" onChange={(e)=>uploadFromDevice(e)} className="hidden" id="image-input" />
                </div>
            </div>

            {/* <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">{product.design}</span> */}
          </DialogTitle>
          
        </DialogHeader>

        {/* Selected Tags as Badges */}
        {/* <div> */}
            {/* <Image
            src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/'+product.imageUrls+'?alt=media'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
            // layout="responsive"
            width={400}
            height={200}
            /> */}
        {/* </div> */}
        <div className="mb-4 flex flex-wrap">
          {selectedTags.map((tagId) => {
            const tag = tags.find((t) => t.tagId === tagId);
            return (
                <span key={tagId} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">
                    {tag?.name}
                    <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tagId)} />
                </span>
            //   <Badge key={tagId} variant="outline" className="flex items-center gap-1">
            //     {tag?.name}
            //     <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tagId)} />
            //   </Badge>
            );
          })}
        </div>

        {/* Scrollable Horizontal Grid of Tags */}
        <div className="max-h-64 overflow-x-auto border p-2 rounded-md flex gap-4">
          {Object.entries(groupedTags).map(([type, groupTags]) => (
            <div key={type} className="flex-1 min-w-[200px]">
              <h3 className="text-md font-semibold mb-2">{type}</h3>
              <div className="flex flex-col gap-2">
                {groupTags.map((tag) => (
                  <label key={tag.tagId} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTags.includes(tag.tagId)}
                      onCheckedChange={() => handleTagChange(tag.tagId)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          {/* <Button onClick={() => onSave(product.productId, selectedTags)}>Save Changes</Button> */}
          <Button onClick={() => createProductFunctionCall()}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
