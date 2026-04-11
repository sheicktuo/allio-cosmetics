"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"

export function ToggleSwitch({
  id,
  checked,
  action,
}: {
  id: string
  checked: boolean
  action: (formData: FormData) => Promise<void>
}) {
  const [optimistic, setOptimistic] = useState(checked)
  const [pending, startTransition]  = useTransition()

  function handleChange(val: boolean) {
    setOptimistic(val)
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", id)
      fd.set("value", val.toString())
      await action(fd)
    })
  }

  return <Switch checked={optimistic} onCheckedChange={handleChange} disabled={pending} />
}
