import { add } from "@workspace/math/add"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello apps/widget</h1>
        <Button className="sm">Button</Button>
        <p>{add(10, 12)}</p>
        <Input />
      </div>
    </div>
  )
}
