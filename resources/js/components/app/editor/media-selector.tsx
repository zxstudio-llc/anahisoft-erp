import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Image, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MediaSelector({ 
  open, 
  onOpenChange, 
  onSelect 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: any) => void
}) {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open, search])

  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      const response = await router.get(route('media.index'), { 
        search,
        trashed: 'without'
      }, {
        preserveState: false,
        only: ['media'],
        onSuccess: (page) => {
          setMedia(page.props.media.data)
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia)
      onOpenChange(false)
      setSelectedMedia(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={cn(
                      "relative border rounded-md overflow-hidden cursor-pointer group",
                      selectedMedia?.id === item.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className="aspect-square bg-muted/50 relative">
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Image className="text-white h-6 w-6" />
                      </div>
                      {selectedMedia?.id === item.id && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSelect}
              disabled={!selectedMedia}
            >
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}