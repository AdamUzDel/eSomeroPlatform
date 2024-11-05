// components/AccessibilityPanel.tsx
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { X } from 'lucide-react'

interface AccessibilityPanelProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function AccessibilityPanel({ open, setOpen }: AccessibilityPanelProps) {
  const [fontSize, setFontSize] = useState(100)
  const [grayscale, setGrayscale] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [negativeContrast, setNegativeContrast] = useState(false)
  const [lightBackground, setLightBackground] = useState(false)
  const [underlineLinks, setUnderlineLinks] = useState(false)
  const [readableFont, setReadableFont] = useState(false)

  useEffect(() => {
    document.body.style.fontSize = `${fontSize}%`
    document.body.classList.toggle('grayscale', grayscale)
    document.body.classList.toggle('high-contrast', highContrast)
    document.body.classList.toggle('negative-contrast', negativeContrast)
    document.body.classList.toggle('light-background', lightBackground)
    document.body.classList.toggle('underline-links', underlineLinks)
    document.body.classList.toggle('readable-font', readableFont)

    return () => {
      document.body.style.fontSize = ''
      document.body.classList.remove('grayscale', 'high-contrast', 'negative-contrast', 'light-background', 'underline-links', 'readable-font')
    }
  }, [fontSize, grayscale, highContrast, negativeContrast, lightBackground, underlineLinks, readableFont])

  const resetSettings = () => {
    setFontSize(100)
    setGrayscale(false)
    setHighContrast(false)
    setNegativeContrast(false)
    setLightBackground(false)
    setUnderlineLinks(false)
    setReadableFont(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setOpen(false)} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Accessibility Options</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-6 w-6" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="mt-6 relative flex-1 px-4 sm:px-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <Slider
                    id="font-size"
                    min={50}
                    max={200}
                    step={10}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                  <span className="text-sm text-gray-500">{fontSize}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="grayscale">Grayscale</Label>
                  <Switch
                    id="grayscale"
                    checked={grayscale}
                    onCheckedChange={setGrayscale}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="negative-contrast">Negative Contrast</Label>
                  <Switch
                    id="negative-contrast"
                    checked={negativeContrast}
                    onCheckedChange={setNegativeContrast}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="light-background">Light Background</Label>
                  <Switch
                    id="light-background"
                    checked={lightBackground}
                    onCheckedChange={setLightBackground}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="underline-links">Underline Links</Label>
                  <Switch
                    id="underline-links"
                    checked={underlineLinks}
                    onCheckedChange={setUnderlineLinks}
                  />
                </div>
                <div className="flex items-center  justify-between">
                  <Label htmlFor="readable-font">Readable Font</Label>
                  <Switch
                    id="readable-font"
                    checked={readableFont}
                    onCheckedChange={setReadableFont}
                  />
                </div>
                <Button onClick={resetSettings} className="w-full">Reset Settings</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}