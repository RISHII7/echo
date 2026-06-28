import { Button } from "@workspace/ui/components/button"
import { add } from "@workspace/math/add"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello apps/web</h1>
        <Button className="sm">Button</Button>
        <p>{add(2, 6)}</p>
      </div>
    </div>
  )
}
