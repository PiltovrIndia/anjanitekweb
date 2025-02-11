import { Card } from "@/app/components/ui/card";
import { useState } from "react";

export default function FilterSidebar({ groupedTags, selectedTags, onTagChange }) {
  return (
    <Card className="w-[200px] px-4 py-3">
        {/* <div className="w-64 p-4 border-r bg-gray-100 h-full"> */}
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        {Object.entries(groupedTags).map(([type, tags]) => (
            <div key={type} className="mb-4">
            <h3 className="text-md font-semibold mb-2">{type}</h3>
            <div className="flex flex-col gap-2">
                {tags.map((tag) => (
                <label key={tag.tagId} className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    value={tag.tagId}
                    checked={selectedTags.includes(tag.tagId)}
                    onChange={() => onTagChange(tag.tagId)}
                    className="w-4 h-4"
                    />
                    {tag.name}
                </label>
                ))}
            </div>
            </div>
        ))}
        {/* </div> */}
    </Card>
  );
}
