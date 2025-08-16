# Component Library

CodeWithDanko includes a set of reusable UI components built with React, Tailwind CSS, and shadcn/ui. This document provides an overview of available components and how to use them.

## Installation

The component library is available in the `packages/ui` directory and is automatically available to both the frontend and any other packages in the monorepo.

## Basic Usage

Import components from the UI package:

```tsx
import { Button, Card, Input } from '@codewithdanko/ui';

function MyComponent() {
  return (
    <Card>
      <h2>Hello World</h2>
      <Input placeholder="Enter your name" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Available Components

### Layout Components

#### Container

A centered container with responsive padding.

```tsx
<Container>
  <h1>Page Content</h1>
  <p>This content will be centered with proper margins.</p>
</Container>
```

#### Card

A styled card component with optional header and footer.

```tsx
<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description text</Card.Description>
  </Card.Header>
  <Card.Content>
    Main content goes here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Form Components

#### Input

Text input field with various styles and states.

```tsx
<Input 
  placeholder="Email address" 
  type="email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

#### Button

Versatile button component with multiple variants.

```tsx
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
<Button isLoading>Loading Button</Button>
<Button disabled>Disabled Button</Button>
```

#### Select

Dropdown select component.

```tsx
<Select 
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={handleChange}
  placeholder="Select an option"
/>
```

#### Checkbox

Checkbox input with label.

```tsx
<Checkbox 
  label="Accept terms and conditions"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>
```

#### RadioGroup

Group of radio buttons.

```tsx
<RadioGroup 
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={handleChange}
/>
```

#### Textarea

Multi-line text input.

```tsx
<Textarea 
  placeholder="Enter your message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>
```

### Feedback Components

#### Alert

Contextual feedback messages.

```tsx
<Alert variant="info">This is an information message</Alert>
<Alert variant="success">Operation completed successfully</Alert>
<Alert variant="warning">Warning: This action cannot be undone</Alert>
<Alert variant="error">An error occurred</Alert>
```

#### Toast

Temporary notifications.

```tsx
import { useToast } from '@codewithdanko/ui';

function MyComponent() {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: 'Success',
      description: 'Your changes have been saved',
      variant: 'success',
      duration: 3000,
    });
  };
  
  return <Button onClick={showToast}>Show Toast</Button>;
}
```

#### Spinner

Loading indicator.

```tsx
<Spinner size="small" />
<Spinner size="medium" />
<Spinner size="large" />
```

### Navigation Components

#### Tabs

Tabbed interface.

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content for tab 1</Tabs.Content>
  <Tabs.Content value="tab2">Content for tab 2</Tabs.Content>
</Tabs>
```

#### Pagination

Page navigation component.

```tsx
<Pagination 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

#### Breadcrumb

Navigation breadcrumb trail.

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
  <Breadcrumb.Item>Product Details</Breadcrumb.Item>
</Breadcrumb>
```

### Data Display Components

#### Table

Data table with sorting and selection.

```tsx
<Table data={users} columns={[
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role' },
]} />
```

#### Badge

Small status indicator.

```tsx
<Badge variant="primary">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Archived</Badge>
```

#### Avatar

User avatar with fallback.

```tsx
<Avatar 
  src="https://example.com/avatar.jpg" 
  fallback="JD"
  alt="John Doe"
  size="medium"
/>
```

## Theme Customization

The component library uses Tailwind CSS for styling. You can customize the theme by modifying the `tailwind.config.ts` file:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          // Add more shades as needed
        },
        // Add more custom colors
      },
      // Add other theme customizations
    },
  },
};
```

## Dark Mode

All components support dark mode out of the box. To toggle dark mode:

```tsx
import { useTheme } from '@codewithdanko/ui';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </Button>
  );
}
```

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Creating Custom Components

You can create custom components that match the design system:

1. Create a new file in `packages/ui/src/components/`
2. Import and use existing components or base styles
3. Export your component
4. Import it in your application

Example:

```tsx
// packages/ui/src/components/CustomCard.tsx
import { Card, Button } from '../';

export function CustomCard({ title, children, onAction }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
      <Card.Footer>
        <Button onClick={onAction}>Take Action</Button>
      </Card.Footer>
    </Card>
  );
}
```

Then use it in your application:

```tsx
import { CustomCard } from '@codewithdanko/ui';

function MyPage() {
  return (
    <CustomCard title="My Custom Card" onAction={handleAction}>
      This is a custom card component
    </CustomCard>
  );
}
```
