import { Editor } from '@tiptap/react'
import {
  Youtube,
  PaintBucket,
  CornerDownLeft,
  X,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { ImageUploadButton } from './imageUploadButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
// --- Hooks ---
import { useMobile } from "@/hooks/use-tiptap-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { NodeButton } from "@/components/tiptap-ui/node-button"
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from "@/components/tiptap-ui/highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

interface EditorMenuBarProps {
  editor: Editor
  imageCollection?: string
  modelType?: string
  modelId?: string | number
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
)

export function EditorMenuBar({
  editor,
  imageCollection = 'default',
  modelType,
  modelId,
}: EditorMenuBarProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeWidth, setYoutubeWidth] = useState(640);
  const [youtubeHeight, setYoutubeHeight] = useState(360);
  const [linkUrl, setLinkUrl] = useState('')
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main")
  const isMobile = useMobile()

  if (!editor) {
    return null
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
    }
  }

  const handleDimensionChange = (type: 'width' | 'height', value: number) => {
    if (type === 'width') {
      setYoutubeWidth(value);
      setYoutubeHeight(Math.round(value * 9 / 16));
    } else {
      setYoutubeHeight(value);
      setYoutubeWidth(Math.round(value * 16 / 9));
    }
  };

  const addYoutubeVideo = () => {
    if (!youtubeUrl) return;
  
    try {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width: Math.max(320, Math.min(1024, youtubeWidth)),
        height: Math.max(180, Math.min(720, youtubeHeight)),
      });
      setYoutubeUrl('');
    } catch (error) {
      console.error('Error al insertar video:', error);
    }
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
    }
  }

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border rounded-lg bg-background">
      {mobileView === "main" ? (
        <>
          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4, 5, 6]} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <NodeButton type="codeBlock" />
            <NodeButton type="blockquote" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            {!isMobile ? (
              <HighlightPopover />
            ) : (
              <HighlighterButton onClick={() => setMobileView("highlighter")} />
            )}
            {!isMobile ? <LinkPopover /> : <LinkButton onClick={() => setMobileView("link")} />}
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ImageUploadButton
              editor={editor}
              collectionName={imageCollection}
              modelType={modelType}
              modelId={modelId}
            />
          </ToolbarGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button data-style="ghost" >
                <PaintBucket className="tiptap-button-icon"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-col space-y-2">
                <h4 className="font-medium leading-none text-sm">Color de texto</h4>
                <div className="flex items-center">
                <Input
                  type="color"
                  onInput={(event) => editor.chain().focus().setColor(event.currentTarget.value).run()}
                  value={editor.getAttributes('textStyle').color || '#000000'}
                  data-testid="setColor"
                  className="w-full h-6 cursor-pointer appearance-none border border-input rounded-md p-0"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    borderRadius: '0.375rem',
                    padding: 0,
                  }}
                />
                <Button data-style="ghost" 
                  onClick={() => editor.chain().focus().unsetColor().run()}
                >
                  <X/>
                </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button data-style="ghost" 
            onClick={() => editor.chain().focus().setHardBreak().run()}
          >
            <CornerDownLeft className="tiptap-button-icon"/>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button data-style="ghost">
                <Youtube className="tiptap-button-icon"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Insertar Video de YouTube</h4>
                <Input
                  placeholder="URL del video de YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                
                {editor.isActive('youtube') && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium leading-none text-sm mb-2">Ajustar tamaño</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="320"
                        max="1024"
                        value={youtubeWidth}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 640;
                          editor.commands.updateAttributes('youtube', {
                            width: newWidth,
                            height: Math.round(newWidth * 9 / 16)
                          });
                          handleDimensionChange('width', newWidth);
                        }}
                      />
                      <Input
                        type="number"
                        min="180"
                        max="720"
                        value={youtubeHeight}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 360;
                          editor.commands.updateAttributes('youtube', {
                            height: newHeight,
                            width: Math.round(newHeight * 16 / 9)
                          });
                          handleDimensionChange('height', newHeight);
                        }}
                      />
                    </div>
                  </div>
                )}
                <Button onClick={addYoutubeVideo}>
                  Insertar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <ToolbarSeparator />
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>
          <Spacer />
        </>
      ) : (
        <MobileToolbarContent
          type={mobileView === "highlighter" ? "highlighter" : "link"}
          onBack={() => setMobileView("main")}
        />
      )}
    </div>
  )
}