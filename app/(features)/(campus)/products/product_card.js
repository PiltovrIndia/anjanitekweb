import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Image from 'next/image';

export default function ProductCard({ product }) {

    const [imgSrc, setImgSrc] = useState(`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/${product.imageUrls.split(',')[0]}?alt=media`);
    const handleError = () => {
        setImgSrc(`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/placeholder.webp?alt=media`);
      };

// var imgUrl = 'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/'+c+'.jpeg?alt=media'
  return (
    <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition">
      <CardHeader className="p-0 relative overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg pb-2"
          onError={handleError}
          width={500}
          height={500}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500"></div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg font-bold pb-2">
            {product.name}
        </CardTitle>
        <p className="text-sm text-gray-500">{product.size}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.tagNames?.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-sm px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}