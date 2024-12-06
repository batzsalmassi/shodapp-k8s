import * as React from "react"

const Alert = React.forwardRef(({ children, variant = "default", className = "", ...props }, ref) => {
  const baseStyles = "relative w-full rounded-lg border p-4 mb-4"
  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-800",
    destructive: "bg-red-50 border-red-300 text-red-800",
    success: "bg-green-50 border-green-300 text-green-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800"
  }

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`

  return (
    <div ref={ref} role="alert" className={classes} {...props}>
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }