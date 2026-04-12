"use client"

import { useEffect } from "react"
import { useCart } from "@/store/cart"

export default function ClearCart() {
  const { clear } = useCart()
  useEffect(() => { clear() }, [clear])
  return null
}
