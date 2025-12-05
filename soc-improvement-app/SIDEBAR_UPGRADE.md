# Sidebar Upgrade Instructions

This document contains instructions for completing the sidebar transformation to match the shadcn sidebar-07 design.

## Installation Steps

### 1. Install Dependencies

Run the following command in the `soc-improvement-app` directory:

```bash
npm install
```

This will install all the new dependencies added to `package.json`:
- `tailwindcss` - CSS framework
- `postcss` - CSS processor
- `autoprefixer` - PostCSS plugin
- `tailwindcss-animate` - Animation utilities
- `class-variance-authority` - Variant management
- `clsx` & `tailwind-merge` - Class name utilities
- `lucide-react` - Icon library
- `@radix-ui/react-slot` - Composition primitive
- `@radix-ui/react-collapsible` - Collapsible component
- `@radix-ui/react-separator` - Separator component

### 2. Start Development Server

```bash
npm run dev
```

The app should now be running with the new sidebar design!

## What's Changed

### New Features
1. **Collapsible Sidebar**: Click the sidebar trigger button to collapse the sidebar to icon-only mode
2. **Hover to Expand**: When collapsed, hover over the sidebar to temporarily expand it
3. **Modern Design**: Clean, professional UI matching shadcn design system
4. **Icons**: Each navigation item now has an appropriate icon
5. **Smooth Animations**: Transitions and animations for better UX

### New Components
- `AppSidebar` - Main sidebar wrapper
- `NavMain` - Assessment sections with collapsible domains
- `NavSecondary` - Assessment Info and Reporting links
- `TeamSwitcher` - SOC Navigator branding/header
- Various shadcn UI primitives (Sidebar, Collapsible, Separator, Button)

### Updated Pages
- `Assessment.jsx` - Now uses SidebarProvider and SidebarInset
- `AssessmentInfo.jsx` - Updated layout structure
- `Reporting.jsx` - Updated layout structure

### State Management
Added `sidebarCollapsed` state to Zustand store for persisting sidebar collapse state

## Keyboard Shortcuts

- `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac): Toggle sidebar

## Customization

### Icons
To change icons for domains, edit the `domainIcons` object in `nav-main.jsx`:

```javascript
const domainIcons = {
  "Governance": Shield,
  "People": Users,
  "Process": FileSearch,
  "Technology": Settings,
  "Data": Database,
}
```

### Colors
The sidebar uses CSS variables defined in `index.css`. Key variables:
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-accent`
- `--sidebar-border`

### Sidebar Width
Adjust in the SidebarProvider:
- Default width: `16rem` (256px)
- Icon width: `3rem` (48px)

## Troubleshooting

### Issue: Styles not applying
**Solution**: Make sure Tailwind is properly configured and the dev server is restarted

### Issue: Icons not showing
**Solution**: Verify `lucide-react` is installed: `npm list lucide-react`

### Issue: Sidebar not collapsing
**Solution**: Check browser console for errors, ensure all dependencies are installed

## Next Steps

You can further customize:
1. Add tooltips to collapsed sidebar items
2. Adjust animation durations
3. Customize color scheme to match your brand
4. Add more navigation items or sections

For more information on shadcn/ui components, visit: https://ui.shadcn.com

