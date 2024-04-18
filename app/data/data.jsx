import {
    ArrowDownIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    CheckCircledIcon,
    CircleIcon,
    CrossCircledIcon,
    MinusCircledIcon,
    QuestionMarkCircledIcon,
    ResetIcon,
    StopwatchIcon
  } from "@radix-ui/react-icons"
  
  export const labels = [
    {
      value: "bug",
      label: "Bug"
    },
    {
      value: "feature",
      label: "Feature"
    },
    {
      value: "documentation",
      label: "Documentation"
    }
  ]
  
  export const statuses = [
    {
      value: "Submitted",
      label: "Submitted",
      icon: QuestionMarkCircledIcon
    },
    {
      value: "Approved",
      label: "Approved",
      icon: CircleIcon
    },
    {
      value: "Issued",
      label: "Issued",
      icon: StopwatchIcon
    },
    {
      value: "InOuting",
      label: "In outing",
      icon: CheckCircledIcon
    },
    {
      value: "Returned",
      label: "Returned",
      icon: ResetIcon
    },
    {
      value: "Rejected",
      label: "Rejected",
      icon: CrossCircledIcon
    },
    {
      value: "Canceled",
      label: "Canceled",
      icon: MinusCircledIcon
    }
  ]
  
  export const priorities = [
    {
      label: "Low",
      value: "low",
      icon: ArrowDownIcon
    },
    {
      label: "Medium",
      value: "medium",
      icon: ArrowRightIcon
    },
    {
      label: "High",
      value: "high",
      icon: ArrowUpIcon
    }
  ]
  