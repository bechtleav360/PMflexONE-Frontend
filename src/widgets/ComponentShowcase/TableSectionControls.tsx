import {
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
  type TableSelectionMode,
} from '@/shared/components'

interface TableSectionControlsProps {
  pageSize: number
  pageSizeOptions: number[]
  selectionMode: TableSelectionMode
  columnReordering: boolean
  columnResizing: boolean
  virtualized: boolean
  stickyHeader: boolean
  loading: boolean
  onPageSizeChange: (pageSize: number) => void
  onSelectionModeChange: (mode: TableSelectionMode) => void
  onColumnReorderingChange: (value: boolean) => void
  onColumnResizingChange: (value: boolean) => void
  onVirtualizedChange: (value: boolean) => void
  onStickyHeaderChange: (value: boolean) => void
  onLoadingChange: (value: boolean) => void
  pageSizeLabel: string
  selectionModeLabel: string
  selectionModeNoneLabel: string
  selectionModeSingleLabel: string
  selectionModeMultipleLabel: string
  columnReorderingLabel: string
  columnResizingLabel: string
  virtualizedLabel: string
  stickyHeaderLabel: string
  loadingLabel: string
}

interface ToggleControlProps {
  id: string
  checked: boolean
  label: string
  onCheckedChange: (value: boolean) => void
}

interface SelectionModeControlProps {
  label: string
  value: TableSelectionMode
  noneLabel: string
  singleLabel: string
  multipleLabel: string
  onValueChange: (value: TableSelectionMode) => void
}

// Renders a labeled toggle control for the showcase panel.
function renderToggleControl(props: ToggleControlProps) {
  const { id, checked, label, onCheckedChange } = props

  return (
    <div className="gap-sm flex items-center">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

// Renders the radio-group control used to switch table selection mode.
function renderSelectionModeControl(props: SelectionModeControlProps) {
  const { label, value, noneLabel, singleLabel, multipleLabel, onValueChange } = props

  return (
    <fieldset className="gap-md m-0 flex min-w-0 items-start border-0 p-0">
      <legend className="text-foreground text-sm leading-none font-medium">{label}</legend>
      <RadioGroup
        className="gap-lg flex flex-wrap items-center"
        name="showcase-table-selection-mode"
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue as TableSelectionMode)}
      >
        <div className="gap-sm flex items-center">
          <RadioGroupItem
            value="none"
            id="showcase-table-selection-none"
          />
          <Label htmlFor="showcase-table-selection-none">{noneLabel}</Label>
        </div>
        <div className="gap-sm flex items-center">
          <RadioGroupItem
            value="single"
            id="showcase-table-selection-single"
          />
          <Label htmlFor="showcase-table-selection-single">{singleLabel}</Label>
        </div>
        <div className="gap-sm flex items-center">
          <RadioGroupItem
            value="multiple"
            id="showcase-table-selection-multiple"
          />
          <Label htmlFor="showcase-table-selection-multiple">{multipleLabel}</Label>
        </div>
      </RadioGroup>
    </fieldset>
  )
}

// Renders the page-size selector used in the showcase controls.
function renderPageSizeControl(props: {
  value: number
  options: number[]
  label: string
  onValueChange: (value: number) => void
}) {
  const { value, options, label, onValueChange } = props

  return (
    <div className="gap-sm flex items-center">
      <Label htmlFor="showcase-table-page-size">{label}</Label>
      <select
        id="showcase-table-page-size"
        className="border-input bg-background text-foreground focus-visible:ring-ring px-md py-sm rounded-md border text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Renders the showcase table controls.
 *
 * @param props - Component props.
 * @returns A row of page-size and toggle controls.
 */
export function TableSectionControls(props: TableSectionControlsProps) {
  const {
    pageSize,
    pageSizeOptions,
    selectionMode,
    columnReordering,
    columnResizing,
    virtualized,
    stickyHeader,
    loading,
    onPageSizeChange,
    onSelectionModeChange,
    onColumnReorderingChange,
    onColumnResizingChange,
    onVirtualizedChange,
    onStickyHeaderChange,
    onLoadingChange,
    pageSizeLabel,
    selectionModeLabel,
    selectionModeNoneLabel,
    selectionModeSingleLabel,
    selectionModeMultipleLabel,
    columnReorderingLabel,
    columnResizingLabel,
    virtualizedLabel,
    stickyHeaderLabel,
    loadingLabel,
  } = props

  return (
    <div className="gap-lg flex flex-wrap items-center">
      {renderPageSizeControl({
        value: pageSize,
        options: pageSizeOptions,
        label: pageSizeLabel,
        onValueChange: onPageSizeChange,
      })}
      {renderSelectionModeControl({
        label: selectionModeLabel,
        value: selectionMode,
        noneLabel: selectionModeNoneLabel,
        singleLabel: selectionModeSingleLabel,
        multipleLabel: selectionModeMultipleLabel,
        onValueChange: onSelectionModeChange,
      })}
      {renderToggleControl({
        id: 'showcase-table-column-reordering',
        checked: columnReordering,
        label: columnReorderingLabel,
        onCheckedChange: onColumnReorderingChange,
      })}
      {renderToggleControl({
        id: 'showcase-table-column-resizing',
        checked: columnResizing,
        label: columnResizingLabel,
        onCheckedChange: onColumnResizingChange,
      })}
      {renderToggleControl({
        id: 'showcase-table-virtualized',
        checked: virtualized,
        label: virtualizedLabel,
        onCheckedChange: onVirtualizedChange,
      })}
      {renderToggleControl({
        id: 'showcase-table-sticky-header',
        checked: stickyHeader,
        label: stickyHeaderLabel,
        onCheckedChange: onStickyHeaderChange,
      })}
      {renderToggleControl({
        id: 'showcase-table-loading',
        checked: loading,
        label: loadingLabel,
        onCheckedChange: onLoadingChange,
      })}
    </div>
  )
}
