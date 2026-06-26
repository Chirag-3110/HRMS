# shadcn/ui Base Components

This directory contains the core shadcn/ui components installed for the Phelbo Superadmin Dashboard.

## Installed Components

### 1. Button
**File**: `button.tsx`  
**Usage**: Interactive buttons with multiple variants (default, destructive, outline, secondary, ghost, link)

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

### 2. Input
**File**: `input.tsx`  
**Usage**: Text input fields with consistent styling

```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Enter password" />
```

### 3. Label
**File**: `label.tsx`  
**Usage**: Form labels with proper accessibility

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 4. Select
**File**: `select.tsx`  
**Usage**: Dropdown select component with search capability

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="member">Member</SelectItem>
    <SelectItem value="guest">Guest</SelectItem>
  </SelectContent>
</Select>
```

### 5. Table
**File**: `table.tsx`  
**Usage**: Data tables with consistent styling

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 6. Dialog
**File**: `dialog.tsx`  
**Usage**: Modal dialogs for confirmations, forms, and information

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 7. Card
**File**: `card.tsx`  
**Usage**: Content containers with header, body, and footer sections

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Configuration

### Tailwind CSS
All components use Tailwind CSS with custom CSS variables defined in `app/globals.css`. The theme supports both light and dark modes.

### Theme Colors
The following color tokens are available:
- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `border` / `input` / `ring`
- `card` / `card-foreground`
- `popover` / `popover-foreground`

### Utility Function
The `cn()` utility function from `@/lib/utils` combines `clsx` and `tailwind-merge` for conditional and merged class names:

```tsx
import { cn } from '@/lib/utils';

<div className={cn("base-class", condition && "conditional-class")} />
```

## Dependencies

The following dependencies are required:
- `@radix-ui/react-dialog` - For Dialog component
- `@radix-ui/react-select` - For Select component
- `lucide-react` - For icons used in components
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes

## Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
