import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@the_viveksingh/vivek-ui'

export default function DropdownMenuPreview({ name }: { name: string }) {
  if (name === 'checkboxItems') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>View options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked closeOnSelect={false}>
            Invoice
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem defaultChecked closeOnSelect={false}>
            Client
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem closeOnSelect={false}>Tax</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem shortcut="R">Reset to defaults</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Invoice INV-1042</DropdownMenuLabel>
        <DropdownMenuItem shortcut="E">Edit</DropdownMenuItem>
        <DropdownMenuItem shortcut="D">Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Download PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Send reminder</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
