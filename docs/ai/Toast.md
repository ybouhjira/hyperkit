# Toast

> Toast notification system via React context/portal. Wrap app in `ToastProvider`, then call `useToast()` to trigger notifications.

## Import

```tsx
import { ToastProvider, useToast } from '@ybouhjira/hyperkit';
import type { ToastData, ToastVariant } from '@ybouhjira/hyperkit';
```

## Setup

Wrap your app (or the relevant subtree) in `ToastProvider` once:

```tsx
// App root
import { ToastProvider } from '@ybouhjira/hyperkit';

<ToastProvider>
  <App />
</ToastProvider>;
```

## Triggering Toasts

```tsx
import { useToast } from '@ybouhjira/hyperkit';

const MyComponent = () => {
  const toast = useToast();

  return (
    <>
      <Button onClick={() => toast.success('Changes saved!')}>Save</Button>
      <Button onClick={() => toast.error('Failed to save.', 'Error')}>Fail</Button>
      <Button onClick={() => toast.info('New version available.')}>Info</Button>
      <Button onClick={() => toast.warning('Session expires in 5 min.')}>Warn</Button>
    </>
  );
};
```

## With Title and Custom Duration

```tsx
const toast = useToast();

toast.show({
  title: 'Upload Complete',
  description: '3 files uploaded successfully',
  variant: 'success',
  duration: 8000,
});

// Persistent (stays until manually dismissed)
toast.show({
  description: 'This will stay until closed',
  variant: 'info',
  persistent: true,
});
```

## ToastProvider Props

| Prop       | Type                                                           | Default       | Description                                  |
| ---------- | -------------------------------------------------------------- | ------------- | -------------------------------------------- |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Screen position for toast container          |
| `class`    | `string`                                                       | —             | Additional CSS class for the toast container |
| `children` | `JSX.Element`                                                  | —             | App content (required)                       |

## useToast() API

| Method    | Signature                               | Description                    |
| --------- | --------------------------------------- | ------------------------------ |
| `show`    | `(data: ToastData) => void`             | Show a toast with full config  |
| `success` | `(msg: string, title?: string) => void` | Green success toast            |
| `error`   | `(msg: string, title?: string) => void` | Red error toast                |
| `info`    | `(msg: string, title?: string) => void` | Blue info toast                |
| `warning` | `(msg: string, title?: string) => void` | Orange warning toast           |
| `dismiss` | `(id: string) => void`                  | Programmatically dismiss by ID |

## ToastData

| Field         | Type           | Default  | Description                                   |
| ------------- | -------------- | -------- | --------------------------------------------- |
| `description` | `string`       | —        | Main message text (required)                  |
| `title`       | `string`       | —        | Optional bold title above description         |
| `variant`     | `ToastVariant` | `'info'` | `'success' \| 'error' \| 'info' \| 'warning'` |
| `duration`    | `number`       | `5000`   | Auto-dismiss delay in ms                      |
| `persistent`  | `boolean`      | `false`  | Prevent auto-dismiss                          |

## Common Patterns

```tsx
import { ToastProvider, useToast, Button, Stack } from '@ybouhjira/hyperkit';

// Wrap at app root
<ToastProvider position="bottom-right">
  <Router />
</ToastProvider>;

// Inside any child component
const FormActions = () => {
  const toast = useToast();
  const [saving, setSaving] = createSignal(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save. Please try again.', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button loading={saving()} onClick={handleSave}>
      Save Profile
    </Button>
  );
};
```

## CSS Customization

```css
/* Override max width */
:root {
  --sk-toast-max-w: 380px;
}

/* Override progress bar height */
:root {
  --sk-toast-progress-h: 4px;
}
```

## Accessibility

- Each toast renders with `role="status"` and `aria-live="polite"`
- Progress bar is decorative and hidden from assistive technology
- Close button has `aria-label="Close"`
- `useToast` throws if called outside `ToastProvider`

## Related Components

- **Dialog** — for blocking confirmations requiring user input
- **ErrorBanner** — for persistent page-level errors (not temporary)
- **ProgressBar** — for long-running operation feedback

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
