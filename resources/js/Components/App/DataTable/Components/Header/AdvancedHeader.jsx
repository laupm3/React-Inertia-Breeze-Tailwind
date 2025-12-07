import RangeFilterHeader from "./Partials/RangeFilterHeader";
import FilterHeader from "./Partials/FilterHeader";
import SortHeader from "./Partials/SortHeader";
import DateRangeFilterHeader from "./Partials/DateRangeFilterHeader";

export default function AdvancedHeader({
  column,
  labelFn,
  valueFn,
  className,
  filterType = "default",
}) {
  const { title } = column.columnDef;

  return (
    <div className="flex items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground w-full min-h-10 h-auto justify-between hover:bg-inherit [&_svg]:pointer-events-auto dark:text-custom-white rounded-full">
      <div className="flex justify-between items-center flex-1">
        {title &&
          <div className={`pointer-events-none text-muted-foreground dark:text-custom-white ${valueFn && "z-10 ml-4 opacity-50 font-normal"}`}>{title}</div>
        }

        {filterType === "range"
          ? (
            <RangeFilterHeader column={column} />
          )
          : (filterType === "date")
            ? (
              <DateRangeFilterHeader column={column} />
            )
            : (
              <FilterHeader
                column={column}
                labelFn={labelFn}
                valueFn={valueFn}
                className={className}
              />
            )
        }
      </div>
      <div>
        <SortHeader column={column} />
      </div>
    </div>
  );
}