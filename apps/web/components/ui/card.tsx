import { cn } from "@/lib/utils";
import * as React from "react";

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
};

export function Card({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("p-4 pb-0", className)} {...props} />;
}

export function CardTitle({
  className,
  children,
  ...props
}: Readonly<CardTitleProps>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
