import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { X } from "phosphor-react";

export default function TagDialog({ product, tags, isOpen, onClose, onSave }) {
  const [selectedTags, setSelectedTags] = useState(product.tags.split(",").map(Number));

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold gap-2 flex items-center">
            {product.name}
            <span class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">{product.design}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Selected Tags as Badges */}
        <div>
            <img
            src={'https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/'+product.design+'.jpeg?alt=media'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
            />
        </div>
        <div className="mb-4 flex flex-wrap">
          {selectedTags.map((tagId) => {
            const tag = tags.find((t) => t.tagId === tagId);
            return (
                <span class="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-green-400 border border-green-400">
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
          <Button onClick={() => onSave(product.productId, selectedTags)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
