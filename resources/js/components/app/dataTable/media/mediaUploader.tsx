import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CloudUpload } from 'lucide-react'

interface MediaUploaderProps {
  multiple?: boolean
  onSelect: (files: Array<{ id: string; url: string; name: string }>) => void
}

export function MediaUploader({ multiple = false, onSelect }: MediaUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Simulate upload and get media IDs
    const uploadedFiles = acceptedFiles.map(file => ({
      id: `media-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      name: file.name
    }))
    onSelect(uploadedFiles)
  }, [onSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'application/pdf': ['.pdf']
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="flex justify-center">
          <CloudUpload className="h-10 w-10 text-muted-foreground" />
        </div>
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop the files here</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports images, videos, and PDFs
            </p>
          </>
        )}
        <Button variant="outline" size="sm" className="mt-4">
          Select Files
        </Button>
      </div>
    </div>
  )
}