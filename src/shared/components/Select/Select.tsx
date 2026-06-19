import * as SelectPrimitive from '@radix-ui/react-select'

import { SelectContent } from './SelectContent'
import { SelectItem } from './SelectItem'
import { SelectLabel } from './SelectLabel'
import { SelectScrollDownButton } from './SelectScrollDownButton'
import { SelectScrollUpButton } from './SelectScrollUpButton'
import { SelectSeparator } from './SelectSeparator'
import { SelectTrigger } from './SelectTrigger'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
