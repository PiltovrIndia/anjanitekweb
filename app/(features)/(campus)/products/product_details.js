import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { X } from "phosphor-react";
import Image from "next/image";

export default function TagDialog({ product, tags, isOpen, onClose, onSave }) {
  const [selectedTags, setSelectedTags] = useState(product.tags.split(",").map(Number));

  // Group tags by type
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.type]) acc[tag.type] = [];
    acc[tag.type].push(tag);
    return acc;
  }, {});

  // Handle checkbox selection
  // const handleTagChange = (tagId) => {
  //   setSelectedTags((prev) =>
  //     prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
  //   );
  // };

  // Handle removing tag from selected list
  const handleRemoveTag = (tagId) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleTagChange = (tagId, type) => {
    setSelectedTags((prev) => {
      const newSelectedTags = prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId];
      const tagsInGroup = groupedTags[type].map(tag => tag.tagId);
      const selectedTagsInGroup = newSelectedTags.filter(id => tagsInGroup.includes(id));
      
      if (selectedTagsInGroup.length === 0) {
        // Show toast message
        alert(`You must select at least one tag from the ${type} group.`);
        return prev; // Prevent unchecking the last tag in the group
      }
      
      return newSelectedTags;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold gap-2 flex items-center">
            {product.name}
            <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">{product.design}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Selected Tags as Badges */}
        <div>
            <Image
            src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.design+'_F1.jpeg?alt=media'}
            // src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/tiles%2F'+product.imageUrls.split(',')[0]+'?alt=media'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
            // layout="responsive"
            width={400}
            height={200}
            />
        </div>
        <div className="mb-4 flex flex-wrap">
          {selectedTags.map((tagId) => {
            const tag = tags.find((t) => t.tagId === tagId);
            return (
                <span key={tagId} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">
                    {tag?.name}
                    <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tagId)} />
                </span>
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
                      onCheckedChange={() => handleTagChange(tag.tagId, type)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => onSave(product.productId, selectedTags)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
