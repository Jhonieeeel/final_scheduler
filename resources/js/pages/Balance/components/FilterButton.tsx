import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

type FilterButtonProps = {
    month: string;
    year: string;
    onMonthChange: (val: string) => void;
    onYearChange: (val: string) => void;
};

const MONTHS = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: String(year), value: String(year) };
});

console.log(YEARS);

export default function FilterButton({
    month,
    year,
    onMonthChange,
    onYearChange,
}: FilterButtonProps) {
    const handleReset = () => {
        onMonthChange(String(new Date().getMonth() + 1));
        onYearChange(String(new Date().getFullYear()));
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="sky">
                        <Filter className="h-4 w-4" />
                        Filter by
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between border-b px-4 py-3 dark:border-sky-900">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="flex items-center justify-around p-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Month
                            </label>
                            <Select value={month} onValueChange={onMonthChange}>
                                <SelectTrigger className="h-9 w-36">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={m.value}
                                        >
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Year
                            </label>
                            <Select value={year} onValueChange={onYearChange}>
                                <SelectTrigger className="h-9 w-28">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => (
                                        <SelectItem
                                            key={y.value}
                                            value={y.value}
                                        >
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2 border-t bg-muted/40 px-4 py-3 dark:border-sky-900">
                        <Button
                            variant="outline"
                            className="h-8 flex-1 rounded-md bg-sky-700 px-2 py-1.5 text-sm text-white hover:bg-sky-800 hover:text-white dark:bg-sky-800 dark:hover:bg-sky-700"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
