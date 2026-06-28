"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Accordion as BaseAccordion } from "@base-ui/react/accordion"
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog"
import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible"
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { Menu as BaseMenu } from "@base-ui/react/menu"
import { Menubar as BaseMenubar } from "@base-ui/react/menubar"
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu"
import { Popover as BasePopover } from "@base-ui/react/popover"
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card"
import { Progress as BaseProgress } from "@base-ui/react/progress"
import { Radio as BaseRadio } from "@base-ui/react/radio"
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group"
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area"
import { Select as BaseSelect } from "@base-ui/react/select"
import { Separator as BaseSeparator } from "@base-ui/react/separator"
import { Slider as BaseSlider } from "@base-ui/react/slider"
import { Switch as BaseSwitch } from "@base-ui/react/switch"
import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { Toast as BaseToast } from "@base-ui/react/toast"
import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"

import { cn } from "@repo/shadcn-ui/lib/utils"

type AnyProps = Record<string, any>
type AnyComponent = React.ComponentType<any>
type AnyPrimitive = Record<string, any>

type PortalProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
  container?: Element | DocumentFragment | null
  forceMount?: boolean
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref) {
        ref.current = value
      }
    }
  }
}

function composeHandlers<Event extends React.SyntheticEvent>(
  childHandler?: (event: Event) => void,
  slotHandler?: (event: Event) => void
) {
  return (event: Event) => {
    childHandler?.(event)
    if (!event.defaultPrevented) {
      slotHandler?.(event)
    }
  }
}

function mergeSlotProps(slotProps: AnyProps, childProps: AnyProps) {
  const mergedProps = { ...slotProps, ...childProps }

  for (const propName of Object.keys(slotProps)) {
    const slotValue = slotProps[propName]
    const childValue = childProps[propName]

    if (/^on[A-Z]/.test(propName) && typeof slotValue === "function") {
      mergedProps[propName] = composeHandlers(childValue as never, slotValue as never)
    }

    if (propName === "style") {
      mergedProps[propName] = {
        ...(slotValue as React.CSSProperties | undefined),
        ...(childValue as React.CSSProperties | undefined),
      }
    }

    if (propName === "className") {
      mergedProps[propName] = cn(slotValue as string, childValue as string)
    }
  }

  return mergedProps
}

const SlotRoot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null
    }

    const child = children as React.ReactElement<AnyProps & { ref?: React.Ref<unknown> }>
    const mergedProps = mergeSlotProps(props, child.props)

    return React.cloneElement(child, {
      ...mergedProps,
      ref: composeRefs((child as { ref?: React.Ref<unknown> }).ref, forwardedRef),
    })
  }
)
SlotRoot.displayName = "Slot"

function createPortalComponent(displayName: string) {
  const Portal = ({ children, container, className, ...props }: PortalProps) => {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      return null
    }

    const content = className || Object.keys(props).length > 0 ? (
      <div className={className} {...props}>
        {children}
      </div>
    ) : (
      children
    )

    return createPortal(content, container ?? document.body)
  }

  Portal.displayName = displayName
  return Portal
}

function mergeElementProps(baseProps: AnyProps, element: React.ReactElement<AnyProps>) {
  const childProps = element.props
  const mergedProps = { ...baseProps, ...childProps }

  if (baseProps.children === undefined) {
    delete mergedProps.children
  }

  for (const propName of Object.keys(baseProps)) {
    const baseValue = baseProps[propName]
    const childValue = childProps[propName]

    if (/^on[A-Z]/.test(propName) && typeof baseValue === "function") {
      mergedProps[propName] = composeHandlers(childValue as never, baseValue as never)
    }
  }

  return {
    ...mergedProps,
    className: cn(baseProps.className, childProps.className),
    style: {
      ...(baseProps.style as React.CSSProperties | undefined),
      ...(childProps.style as React.CSSProperties | undefined),
    },
  }
}

function createRenderProp(
  defaultTagName: keyof React.JSX.IntrinsicElements,
  render: unknown,
  children: React.ReactNode,
  getExtraProps?: (state: AnyProps) => AnyProps,
  transformProps?: (props: AnyProps, state: AnyProps) => AnyProps
) {
  return (renderProps: AnyProps, state: AnyProps) => {
    const elementProps = {
      ...renderProps,
      ...getExtraProps?.(state),
    }

    delete elementProps.nativeButton

    const finalProps = transformProps ? transformProps(elementProps, state) : elementProps

    if (typeof render === "function") {
      return render(finalProps, state)
    }

    if (React.isValidElement(render)) {
      const element = render as React.ReactElement<AnyProps>
      return React.cloneElement(element, mergeElementProps(finalProps, element))
    }

    return React.createElement(defaultTagName, finalProps, children)
  }
}

function isButtonElement(node: React.ReactNode) {
  if (!React.isValidElement(node)) {
    return false
  }

  if (node.type === "button") {
    return true
  }

  if (typeof node.type === "function") {
    return node.type.name === "Button"
  }

  return false
}

function adaptChangeHandler<T extends (...args: any[]) => unknown>(handler?: T) {
  if (!handler) {
    return undefined
  }

  return (value: unknown) => handler(value)
}

function withRender(
  Component: AnyComponent,
  displayName: string,
  defaultTagName: keyof React.JSX.IntrinsicElements = "div",
  getExtraProps?: (state: AnyProps) => AnyProps,
  getExtraComponentProps?: (props: AnyProps) => AnyProps | undefined,
  transformProps?: (props: AnyProps, state: AnyProps) => AnyProps
) {
  const Wrapped = React.forwardRef<HTMLElement, AnyProps>(
    ({ asChild, children, render, nativeButton, ...props }, forwardedRef) => {
      const renderPropSource = asChild && React.isValidElement(children) ? children : render
      const shouldUseRenderProp = Boolean(renderPropSource || getExtraProps || transformProps)
      const renderProp = shouldUseRenderProp
        ? createRenderProp(
            defaultTagName,
            renderPropSource,
            asChild ? undefined : children,
            getExtraProps,
            transformProps
          )
        : undefined

      const componentProps = {
        ...props,
        ...(nativeButton === undefined ? undefined : { nativeButton }),
        ...getExtraComponentProps?.({ asChild, children, render, ...props }),
      }

      return (
        <Component ref={forwardedRef} render={renderProp} {...componentProps}>
          {renderProp ? undefined : children}
        </Component>
      )
    }
  )
  Wrapped.displayName = displayName
  return Wrapped
}

function withOpenRoot(Component: AnyComponent, displayName: string) {
  const Wrapped = React.forwardRef<HTMLElement, AnyProps>(
    ({ asChild, children, onOpenChange, render, nativeButton, ...props }, forwardedRef) => {
      const renderPropSource = asChild && React.isValidElement(children) ? children : render
      const renderProp = renderPropSource
        ? createRenderProp("div", renderPropSource, asChild ? undefined : children, (state) => ({
            "data-state": state.open ? "open" : "closed",
          }))
        : createRenderProp("div", undefined, children, (state) => ({
            "data-state": state.open ? "open" : "closed",
          }))

      return (
        <Component
          ref={forwardedRef}
          onOpenChange={adaptChangeHandler(onOpenChange)}
          render={renderProp}
          {...props}
        />
      )
    }
  )
  Wrapped.displayName = displayName
  return Wrapped
}

function withHeadlessOpenRoot(Component: AnyComponent, displayName: string) {
  const Wrapped = ({ onOpenChange, ...props }: AnyProps) => (
    <Component onOpenChange={adaptChangeHandler(onOpenChange)} {...props} />
  )
  Wrapped.displayName = displayName
  return Wrapped
}

function withHeadlessValueRoot(Component: AnyComponent, displayName: string) {
  const Wrapped = ({ onValueChange, ...props }: AnyProps) => (
    <Component onValueChange={adaptChangeHandler(onValueChange)} {...props} />
  )
  Wrapped.displayName = displayName
  return Wrapped
}

function createPlainElement(tagName: keyof React.JSX.IntrinsicElements, displayName: string) {
  const Element = React.forwardRef<HTMLElement, AnyProps>(({ asChild, children, ...props }, ref) => {
    if (asChild) {
      return (
        <SlotRoot ref={ref} {...props}>
          {children}
        </SlotRoot>
      )
    }

    return React.createElement(tagName, { ref, ...props }, children)
  })
  Element.displayName = displayName
  return Element
}

function createPositionedContent(
  Positioner: AnyComponent,
  Popup: AnyComponent,
  displayName: string
) {
  const Content = React.forwardRef<HTMLDivElement, AnyProps>(
    ({
      align,
      side,
      sideOffset,
      alignOffset,
      collisionBoundary,
      collisionPadding,
      sticky,
      children,
      ...props
    }, ref) => (
      <Positioner
        align={align}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <Popup ref={ref} {...props}>
          {children}
        </Popup>
      </Positioner>
    )
  )
  Content.displayName = displayName
  return Content
}

function createDialogContent(DialogLike: AnyPrimitive, displayName: string) {
  const Content = React.forwardRef<HTMLDivElement, AnyProps>(({ children, ...props }, ref) => (
    <DialogLike.Popup ref={ref} {...props}>
      {children}
    </DialogLike.Popup>
  ))
  Content.displayName = displayName
  return Content
}

function createMenuContent(MenuLike: AnyPrimitive, displayName: string) {
  const Content = React.forwardRef<HTMLDivElement, AnyProps>(
    ({ align, side, sideOffset, alignOffset, collisionBoundary, collisionPadding, children, ...props }, ref) => (
      <MenuLike.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuLike.Popup ref={ref} {...props}>
          {children}
        </MenuLike.Popup>
      </MenuLike.Positioner>
    )
  )
  Content.displayName = displayName
  return Content
}

function createScrollButton(tagName: keyof React.JSX.IntrinsicElements, displayName: string) {
  const Button = React.forwardRef<HTMLElement, AnyProps>(({ children, ...props }, ref) =>
    React.createElement(tagName, { ref, ...props }, children)
  )
  Button.displayName = displayName
  return Button
}

const PortalRoot = createPortalComponent("Portal.Root")
const Anchor = createPlainElement("div", "Anchor")
const LabelElement = createPlainElement("div", "Label")
const ItemIndicator = createPlainElement("span", "ItemIndicator")

const AccordionRoot = withHeadlessValueRoot(BaseAccordion.Root as AnyComponent, "Accordion.Root")
const AccordionItem = BaseAccordion.Item as AnyComponent
const AccordionHeader = BaseAccordion.Header as AnyComponent
const AccordionTrigger = withRender(BaseAccordion.Trigger as AnyComponent, "Accordion.Trigger", "button", (state) => ({
  "data-state": state.open ? "open" : "closed",
}))
const AccordionContent = withRender(BaseAccordion.Panel as AnyComponent, "Accordion.Content", "div", (state) => ({
  "data-state": state.open ? "open" : "closed",
}))

const AlertDialogRoot = withHeadlessOpenRoot(BaseAlertDialog.Root as AnyComponent, "AlertDialog.Root")
const AlertDialogTrigger = withRender(BaseAlertDialog.Trigger as AnyComponent, "AlertDialog.Trigger", "button")
const AlertDialogClose = withRender(BaseAlertDialog.Close as AnyComponent, "AlertDialog.Close", "button")
const AlertDialogContent = createDialogContent(BaseAlertDialog, "AlertDialog.Content")
const DialogRoot = withHeadlessOpenRoot(BaseDialog.Root as AnyComponent, "Dialog.Root")
const DialogContent = createDialogContent(BaseDialog, "Dialog.Content")
const PopoverContent = createPositionedContent(BasePopover.Positioner, BasePopover.Popup, "Popover.Content")
const TooltipContent = createPositionedContent(BaseTooltip.Positioner, BaseTooltip.Popup, "Tooltip.Content")
const HoverCardContent = createPositionedContent(
  BasePreviewCard.Positioner,
  BasePreviewCard.Popup,
  "HoverCard.Content"
)
const DropdownMenuContent = createMenuContent(BaseMenu, "DropdownMenu.Content")
const ContextMenuContent = createMenuContent(BaseContextMenu, "ContextMenu.Content")

const MenubarRoot = (BaseMenubar as unknown as AnyComponent)
const MenubarContent = createMenuContent(BaseMenu, "Menubar.Content")
const SelectContent = createPositionedContent(BaseSelect.Positioner, BaseSelect.Popup, "Select.Content")

const SelectIcon = withRender(BaseSelect.Icon as AnyComponent, "Select.Icon", "span")
const SelectSeparatorElement = BaseSelect.Separator as AnyComponent
const SelectScrollUpButton = BaseSelect.ScrollUpArrow as AnyComponent
const SelectScrollDownButton = BaseSelect.ScrollDownArrow as AnyComponent

const ProgressRoot = React.forwardRef<HTMLDivElement, AnyProps>(({ value = 0, ...props }, ref) => (
  <BaseProgress.Root ref={ref} value={value} {...props} />
))
ProgressRoot.displayName = "Progress.Root"

const SliderRange = BaseSlider.Indicator as AnyComponent

const CollapsibleRoot = withOpenRoot(BaseCollapsible.Root as AnyComponent, "Collapsible.Root")
const CollapsibleTrigger = withRender(
  BaseCollapsible.Trigger as AnyComponent,
  "Collapsible.Trigger",
  "button",
  (state) => ({
    "data-state": state.open ? "open" : "closed",
  }),
  ({ asChild, children }) =>
    asChild && !isButtonElement(children) ? { nativeButton: false } : undefined
)
const CollapsibleContent = withRender(BaseCollapsible.Panel as AnyComponent, "Collapsible.Content", "div", (state) => ({
  "data-state": state.open ? "open" : "closed",
}))

const DialogTrigger = withRender(BaseDialog.Trigger as AnyComponent, "Dialog.Trigger", "button")
const DialogClose = withRender(BaseDialog.Close as AnyComponent, "Dialog.Close", "button")
const PopoverRoot = withHeadlessOpenRoot(BasePopover.Root as AnyComponent, "Popover.Root")
const PopoverTrigger = withRender(BasePopover.Trigger as AnyComponent, "Popover.Trigger", "button")
const HoverCardRoot = withHeadlessOpenRoot(BasePreviewCard.Root as AnyComponent, "HoverCard.Root")
const HoverCardTrigger = withRender(BasePreviewCard.Trigger as AnyComponent, "HoverCard.Trigger", "button")
const DropdownMenuRoot = withHeadlessOpenRoot(BaseMenu.Root as AnyComponent, "DropdownMenu.Root")
const DropdownMenuTrigger = withRender(BaseMenu.Trigger as AnyComponent, "DropdownMenu.Trigger", "button")
const DropdownMenuItem = withRender(BaseMenu.Item as AnyComponent, "DropdownMenu.Item", "div")
const MenubarTrigger = withRender(BaseMenu.Trigger as AnyComponent, "Menubar.Trigger", "button")
const MenubarItem = withRender(BaseMenu.Item as AnyComponent, "Menubar.Item", "div")
const SelectRoot = withHeadlessValueRoot(BaseSelect.Root as AnyComponent, "Select.Root")
const SelectTrigger = withRender(BaseSelect.Trigger as AnyComponent, "Select.Trigger", "button")
const SelectItem = withRender(BaseSelect.Item as AnyComponent, "Select.Item", "div")
const TooltipTrigger = withRender(BaseTooltip.Trigger as AnyComponent, "Tooltip.Trigger", "button")

const CheckboxRoot = withRender(BaseCheckbox.Root as AnyComponent, "Checkbox.Root", "span", (state) => ({
  "data-state": state.checked ? "checked" : "unchecked",
}))
const SwitchRoot = withRender(BaseSwitch.Root as AnyComponent, "Switch.Root", "span", (state) => ({
  "data-state": state.checked ? "checked" : "unchecked",
}))
const SwitchThumb = withRender(BaseSwitch.Thumb as AnyComponent, "Switch.Thumb", "span", (state) => ({
  "data-state": state.checked ? "checked" : "unchecked",
}))
const ToggleRoot = withRender(BaseToggle as AnyComponent, "Toggle.Root", "button", (state) => ({
  "data-state": state.pressed ? "on" : "off",
}))
const ToggleGroupRoot = withHeadlessValueRoot(BaseToggleGroup as AnyComponent, "ToggleGroup.Root")
const ToggleGroupItem = withRender(BaseToggle as AnyComponent, "ToggleGroup.Item", "button", (state) => ({
  "data-state": state.pressed ? "on" : "off",
}))

const TabsRoot = withHeadlessValueRoot(BaseTabs.Root as AnyComponent, "Tabs.Root")
const TabsTrigger = withRender(BaseTabs.Tab as AnyComponent, "Tabs.Trigger", "button", (state) => ({
  "data-state": state.active ? "active" : "inactive",
}))
const TabsContent = withRender(BaseTabs.Panel as AnyComponent, "Tabs.Content", "div", (state) => ({
  "data-state": state.hidden ? "inactive" : "active",
}))

export { SlotRoot }

export const Slot: AnyPrimitive = {
  Slot: SlotRoot,
  Root: SlotRoot,
}

export const Portal: AnyPrimitive = {
  Root: PortalRoot,
}

export const Accordion: AnyPrimitive = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}

export const AlertDialog: AnyPrimitive = {
  ...BaseAlertDialog,
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Overlay: BaseAlertDialog.Backdrop,
  Action: AlertDialogClose,
  Cancel: AlertDialogClose,
  Close: AlertDialogClose,
}

export const AspectRatio: AnyPrimitive = {
  Root: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { ratio?: number }>(
    ({ ratio = 1, style, ...props }, ref) => (
      <div ref={ref} style={{ aspectRatio: String(ratio), ...style }} {...props} />
    )
  ),
}

export const Avatar: AnyPrimitive = BaseAvatar
export const Checkbox: AnyPrimitive = {
  ...BaseCheckbox,
  Root: CheckboxRoot,
}

export const Collapsible: AnyPrimitive = {
  ...BaseCollapsible,
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  CollapsibleTrigger,
  CollapsibleContent,
  Content: CollapsibleContent,
}

export const Dialog: AnyPrimitive = {
  ...BaseDialog,
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Close: DialogClose,
  Content: DialogContent,
  Overlay: BaseDialog.Backdrop,
}

export const Popover: AnyPrimitive = {
  ...BasePopover,
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Anchor,
}

export const HoverCard: AnyPrimitive = {
  ...BasePreviewCard,
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
}

export const DropdownMenu: AnyPrimitive = {
  ...BaseMenu,
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Sub: BaseMenu.SubmenuRoot,
  SubContent: DropdownMenuContent,
  SubTrigger: BaseMenu.SubmenuTrigger,
  Item: DropdownMenuItem,
  ItemIndicator,
  Label: LabelElement,
}

export const ContextMenu: AnyPrimitive = {
  ...BaseContextMenu,
  Content: ContextMenuContent,
  Sub: BaseContextMenu.SubmenuRoot,
  SubContent: ContextMenuContent,
  SubTrigger: BaseContextMenu.SubmenuTrigger,
  ItemIndicator,
  Label: LabelElement,
}

export const Menubar: AnyPrimitive = {
  Root: MenubarRoot,
  Menu: BaseMenu.Root,
  Group: BaseMenu.Group,
  Portal: BaseMenu.Portal,
  RadioGroup: BaseMenu.RadioGroup,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenubarItem,
  CheckboxItem: BaseMenu.CheckboxItem,
  RadioItem: BaseMenu.RadioItem,
  ItemIndicator,
  Label: LabelElement,
  Separator: BaseMenu.Separator,
  Sub: BaseMenu.SubmenuRoot,
  SubTrigger: BaseMenu.SubmenuTrigger,
  SubContent: MenubarContent,
}

export const Label: AnyPrimitive = {
  Root: withRender("label" as unknown as AnyComponent, "Label.Root"),
}

export const NavigationMenu: AnyPrimitive = {
  ...BaseNavigationMenu,
  Content: BaseNavigationMenu.Content ?? BaseNavigationMenu.Popup,
  Indicator: BaseNavigationMenu.Arrow ?? createPlainElement("div", "NavigationMenu.Indicator"),
  Viewport: BaseNavigationMenu.Viewport ?? createPlainElement("div", "NavigationMenu.Viewport"),
}

export const Progress: AnyPrimitive = {
  ...BaseProgress,
  Root: ProgressRoot,
}

export const RadioGroup: AnyPrimitive = {
  Root: BaseRadioGroup,
  Item: BaseRadio.Root,
  Indicator: BaseRadio.Indicator,
}

export const ScrollArea: AnyPrimitive = {
  ...BaseScrollArea,
  ScrollAreaScrollbar: BaseScrollArea.Scrollbar,
  ScrollAreaThumb: BaseScrollArea.Thumb,
}

export const Select: AnyPrimitive = {
  ...BaseSelect,
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Item: SelectItem,
  Content: SelectContent,
  Viewport: BaseSelect.List,
  Icon: SelectIcon,
  Separator: SelectSeparatorElement,
  ScrollDownButton: SelectScrollDownButton,
  ScrollUpButton: SelectScrollUpButton,
}

export const Separator: AnyPrimitive = {
  Root: BaseSeparator,
}

export const Slider: AnyPrimitive = {
  ...BaseSlider,
  Range: SliderRange,
}

export const Switch: AnyPrimitive = {
  ...BaseSwitch,
  Root: SwitchRoot,
  Thumb: SwitchThumb,
}

export const Tabs: AnyPrimitive = {
  ...BaseTabs,
  Root: TabsRoot,
  Trigger: TabsTrigger,
  Content: TabsContent,
}

export const Toast: AnyPrimitive = BaseToast

export const Toggle: AnyPrimitive = {
  Root: ToggleRoot,
}

export const ToggleGroup: AnyPrimitive = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
}

export const Tooltip: AnyPrimitive = {
  ...BaseTooltip,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
}
