"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useUploadThing } from "@/lib/uploadthing"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

type Endpoint = keyof OurFileRouter

type Props = {
  endpoint:     Endpoint
  currentUrl?:  string | null
  onUpload:     (url: string) => void
  label?:       string
}

export default function ImageUploader({ endpoint, currentUrl, onUpload, label = "Image" }: Props) {
  const [preview, setPreview]   = useState<string | null>(currentUrl ?? null)
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState<string | null>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      const url = res[0]?.url
      if (url) {
        setPreview(url)
        onUpload(url)
        setProgress(0)
        setError(null)
      }
    },
    onUploadError: (err) => {
      setError(err.message)
      setProgress(0)
    },
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    // Show local preview immediately
    setPreview(URL.createObjectURL(file))
    await startUpload([file])
  }

  function handleRemove() {
    setPreview(null)
    onUpload("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>

      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted group">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:")}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Remove
            </button>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <div className="w-2/3 h-1.5 bg-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-xs font-medium">{progress}%</p>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-muted hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {isUploading ? (
            <>
              <div className="w-1/2 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs">Uploading… {progress}%</p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs font-medium">Click to upload</p>
              <p className="text-[11px]">PNG, JPG, WEBP — max 4 MB</p>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
