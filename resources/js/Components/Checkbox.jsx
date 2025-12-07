import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-custom-orange data-[state=checked]:text-custom-white dark:data-[state=checked]:text-custom-blackSemi dark:border-custom-gray-darker",
      className
    )}
    {...props}
  >
    <Indicator
      className={cn("flex items-center justify-center text-current }")}
    >
      <Check className="h-4 w-4 " strokeWidth={3} />

    </Indicator>
  </Root>
));

Checkbox.displayName = Root.displayName;

export default Checkbox;
