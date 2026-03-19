# Responsive Design Quick Reference

## 🎯 Breakpoints
```
xs: 320px | sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
```

## 📱 Common Patterns

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Typography
```tsx
// Heading
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">

// Body
<p className="text-sm sm:text-base lg:text-lg">
```

### Grid
```tsx
// 2 columns
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

// 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

// 4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
```

### Flex
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">

// Center
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">
```

### Spacing
```tsx
// Padding
className="p-4 sm:p-6 lg:p-8"

// Margin
className="m-4 sm:m-6 lg:m-8"

// Gap
className="gap-4 sm:gap-6 lg:gap-8"

// Section spacing
className="py-8 sm:py-12 md:py-16 lg:py-20"
```

### Visibility
```tsx
// Hide on mobile
<div className="hidden lg:block">

// Show only on mobile
<div className="block lg:hidden">

// Show on tablet and up
<div className="hidden md:block">
```

### Buttons
```tsx
// Full width on mobile
<Button className="w-full sm:w-auto">

// Stack on mobile
<div className="flex flex-col sm:flex-row gap-2">
  <Button>Primary</Button>
  <Button>Secondary</Button>
</div>
```

### Images
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
/>
```

## 🧩 Responsive Components

### Import
```tsx
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveText,
  ResponsiveCard,
  ResponsiveStack
} from '@/components/layout/ResponsiveContainer';
```

### Usage
```tsx
<ResponsiveContainer size="normal">
  <ResponsiveText variant="h1">Title</ResponsiveText>
  <ResponsiveGrid cols={3} gap="normal">
    <ResponsiveCard size="normal">
      Content
    </ResponsiveCard>
  </ResponsiveGrid>
</ResponsiveContainer>
```

## 🎨 Utility Classes

### From `lib/responsive-utils.ts`
```tsx
import {
  textClasses,
  gridClasses,
  spacingClasses,
  cardClasses,
  buttonClasses,
  iconSizes
} from '@/lib/responsive-utils';

<h1 className={textClasses.h1}>
<div className={gridClasses.cols3}>
<section className={spacingClasses.section}>
<div className={cardClasses.base}>
<Button className={buttonClasses.base}>
<Icon className={iconSizes.base} />
```

## ✅ Checklist

### Before Committing
- [ ] Tested on mobile (375px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1440px)
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Buttons easily tappable (44x44px min)
- [ ] Images load properly
- [ ] No layout shifts

### Common Fixes
```tsx
// Text too small
- className="text-sm"
+ className="text-sm sm:text-base lg:text-lg"

// Fixed width
- className="w-96"
+ className="w-full max-w-md"

// Non-responsive grid
- className="grid grid-cols-4"
+ className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

// Small buttons
- className="px-2 py-1"
+ className="px-4 py-2 sm:px-6 sm:py-3 min-h-[44px]"
```

## 🔧 Testing

### Browser DevTools
Press `Cmd/Ctrl + Shift + M` to toggle device mode

### Test Viewports
- 375px (iPhone) | 768px (iPad) | 1440px (Laptop)

## 🚫 Don't Do

```tsx
// ❌ Fixed widths
<div className="w-[500px]">

// ❌ Desktop-only design
<div className="grid-cols-4">

// ❌ Tiny text
<p className="text-xs">

// ❌ Small touch targets
<button className="p-1">

// ❌ Horizontal scroll
<div className="min-w-[1200px]">
```

## ✅ Do This

```tsx
// ✅ Responsive widths
<div className="w-full max-w-md">

// ✅ Mobile-first grid
<div className="grid-cols-1 lg:grid-cols-4">

// ✅ Readable text
<p className="text-sm sm:text-base">

// ✅ Touch-friendly
<button className="px-4 py-2 min-h-[44px]">

// ✅ Contained content
<div className="w-full overflow-x-hidden">
```

## 💡 Pro Tips

1. **Mobile-first**: Start with mobile styles, add larger breakpoints
2. **Test early**: Check mobile view while developing
3. **Use components**: Leverage ResponsiveContainer, ResponsiveGrid, etc.
4. **Real devices**: Test on actual phones/tablets
5. **Touch targets**: Minimum 44x44px for all interactive elements
6. **Performance**: Optimize images, lazy load below fold
7. **Accessibility**: Ensure keyboard navigation works

---

**Keep this handy while coding!** 📌
