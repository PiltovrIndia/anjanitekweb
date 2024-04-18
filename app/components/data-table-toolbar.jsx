"use client"
import { Cross2Icon } from "@radix-ui/react-icons"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { DataTableViewOptions } from "@/app/components/data-table-view-options"
// import { yup, array, object, string, useForm, yupResolver } from "yup"
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers"

import { Checkbox } from "@/app/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { toast } from "@/app/components/ui/use-toast"

import { priorities, statuses } from "@/app/data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"


const items = [
  {
    id: "recents",
    label: "Recents",
  },
  {
    id: "home",
    label: "Home",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "desktop",
    label: "Desktop",
  },
  {
    id: "downloads",
    label: "Downloads",
  },
  {
    id: "documents",
    label: "Documents",
  },
]
 
// const FormSchema = object({
//   items: ((value) => value.some((item) => item), {
//     message: "You have to select at least one item.",
//   }),
// })


 
export function DataTableToolbar({ table }) {
  // const form = useForm({
  //   resolver: yupResolver(FormSchema),
  // // useForm({
  // //   resolver:  yupResolver(FormSchema),
  //   defaultValues: {
  //     items: ["recents", "home"]
  //   }
  // })
  // const FormSchema = yup.object({
  //   items: yup
  //     .array()
  //     .of(yup.string())
  //     .required('You have to select at least one item.')
  //     .min(1, 'You have to select at least one item.'),
  // });
  
  // const { register, handleSubmit, formState: { errors }, reset } = yup.useForm<yup.InferType<typeof FormSchema>>({
  //   resolver: yupResolver(FormSchema),
  //   defaultValues: {
  //     items: ['recents', 'home'],
  //   },
  // });
  // const form = yup.useForm<yup.InferType<typeof FormSchema>>({
  //   resolver: yup.yupResolver<yup.InferType<typeof FormSchema>>(FormSchema),
  //   defaultValues: {
  //     items: ['recents', 'home'],
  //   },
  // });

  const isFiltered = table.getState().columnFilters.length > 0

  // function onSubmit(data) {
  //   toast({
  //     title: "You submitted the following values:",
  //     description: (
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     )
  //   })
  // }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={event =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}



{/* <Form {...form}>
      <form onSubmit={()=>handleSubmit} className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Sidebar</FormLabel>
                <FormDescription>
                  Select the items you want to display in the sidebar.
                </FormDescription>
              </div>
              {items.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="items"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form> */}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
