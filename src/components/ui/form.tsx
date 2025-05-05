

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
// Removed Slot import as it's causing issues and we'll use React.cloneElement
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  // Check if itemContext exists before accessing its id
  const id = itemContext?.id;
  if (!id && Object.keys(itemContext).length === 0) { // Check if context is empty object
    // Allow usage outside FormItem for flexibility, but provide default IDs or handle appropriately
    // console.warn("useFormField is used outside <FormItem>. Accessibility features might be limited.");
    // For simplicity, let's return default IDs based on the field name if outside FormItem
    const defaultId = fieldContext.name;
     return {
      id: defaultId,
      name: fieldContext.name,
      formItemId: `${defaultId}-form-item`,
      formDescriptionId: `${defaultId}-form-item-description`,
      formMessageId: `${defaultId}-form-item-message`,
      ...fieldState,
    }
    // Alternatively, throw: throw new Error("useFormField should be used within <FormItem>");
  }


  return {
    id: id!, // Use non-null assertion if you ensure it's always within FormItem or handle null case
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

// Provide a default value for the context
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)


const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"


// Refactored FormControl using React.cloneElement instead of Slot
const FormControl = React.forwardRef<
  HTMLElement, // Use a more general type or the specific element type if known
  React.HTMLAttributes<HTMLElement> // Adjust props type accordingly
>(({ children, className, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  try {
    // Ensure there is only one child
    const child = React.Children.only(children);

    // Check if the child is a valid React element before cloning
    if (!React.isValidElement(child)) {
      // This case should ideally not happen if used correctly, but good to handle
      console.error("FormControl expects a single valid React element child.");
      return <>{children}</>;
    }

    // Clone the child and add the necessary props
    // The ref is passed down; the child component (e.g., Input) must use React.forwardRef
    return React.cloneElement(child as React.ReactElement, {
      ref: ref, // Pass the ref down
      id: formItemId,
      'aria-describedby': !error
        ? formDescriptionId // Use the ID directly
        : `${formDescriptionId} ${formMessageId}`, // Combine IDs if error exists
      'aria-invalid': !!error,
      // Merge className, ensuring child's className and FormControl's className are combined
      className: cn(child.props.className, className),
      ...props, // Spread other props passed to FormControl (careful not to overwrite child props unintentionally)
      // Note: React.cloneElement automatically preserves existing props on the child,
      // so explicitly spreading child.props is usually not needed unless overriding specific ones.
    });
  } catch (e) {
     // Catch the "React.Children.only" error if it still occurs (e.g., multiple children passed)
     console.error("FormControl received multiple children or an invalid child. Expected a single valid React element.", children, e);
     // Render children directly as a fallback, though this breaks accessibility wiring
     return <>{children}</>;
  }
});
FormControl.displayName = "FormControl";


const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

