import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Image from 'next/image';

export default function ProductCard({ product }) {

    const [imgSrc, setImgSrc] = useState(`https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/${product.design}.jpeg?alt=media`);
    const handleError = () => {
        setImgSrc("/placeholder.png");
      };

// var imgUrl = 'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/'+c+'.jpeg?alt=media'
  return (
    <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition">
      <CardHeader>
        <Image
          src={imgSrc}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
          onError={handleError}
        />
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