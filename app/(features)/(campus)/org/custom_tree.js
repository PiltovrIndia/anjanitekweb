// components/ui/Tree.tsx
import React, { useState, useEffect } from "react"
import { ArrowDown, ArrowRight } from "phosphor-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"

export function Tree({ nodes, depth = 0 }) {
    return (
      <div className="space-y-2">
        {nodes.map((node) => (
          <TreeItem key={node.id} node={node} depth={depth} />
        //   <TreeItem key={node.user.id} node={node} depth={depth} />
        ))}
      </div>
    )
  }
  
  function TreeItem({ node, depth }) {
    const [isOpen, setIsOpen] = useState(false)
  
    const hasChildren = node.mapTo > 1
  
    return (
      <Card className={`ml-${depth * 4} w-full`}>
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="p-0 h-6 w-6"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex-1">
              <p className="font-medium">{node.name}</p>
              <p className="text-sm text-gray-500">
                {node.role} - {node.designation}
              </p>
              <p className="text-xs text-gray-400">
                Reports to: {node.manager_name || 'None'}
              </p>
            </div>
          </div>
          {hasChildren && isOpen && (
            <div className="mt-2">
              <Tree nodes={node.children} depth={depth + 1} />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }