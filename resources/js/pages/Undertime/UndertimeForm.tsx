import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import {
    addHours,
    addMinutes,
    differenceInMinutes,
    format,
    isValid,
    parse,
    parseISO,
} from 'date-fns';
import {
    Calendar1Icon,
    CalendarIcon,
    ChevronDownIcon,
    Clock,
    Clock3,
    Timer,
} from 'lucide-react';
import { useState } from 'react';
import { HOURS_TABLE, MINUTES_TABLE } from './constant/Conversion';
import undertime from '@/routes/undertime';

type UndertimeFormProp = {
    user_id: number | string;
    leave_type: string;
    event_type: string;
    event_tag?: string;
    balance: number;
    starts_at: string;
    ends_at: string;
};

type PageProps = {
    users: User[];
};

export default function UndertimeForm() {
    const [open, setOpen] = useState(false);

    const { users } = usePage<PageProps>().props;

    const [time, setTime] = useState('08:00:00');

    const form = useForm<UndertimeFormProp>({
        user_id: '',
        leave_type: 'vacation leave',
        event_type: 'deduction',
        event_tag: '',
        balance: 0,
        starts_at: '',
        ends_at: '',
    });

    function handleSubmit(e) {
        e.preventDefault();

        const formattedStart = form.data.starts_at
            ? `${form.data.starts_at} 08:00:00`
            : '';

        const formattedEnd = form.data.ends_at
            ? `${form.data.ends_at} ${time}`
            : '';

        const totalMinutes = differenceInMinutes(
            new Date(formattedEnd),
            new Date(formattedStart),
        );

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const convertedHours = HOURS_TABLE[hours] ?? 0;
        const convertedMinutes = MINUTES_TABLE[minutes] ?? 0;

        const totalUndertime = Number(
            (convertedHours + convertedMinutes).toFixed(3),
        );

        form.setData({
            ...form.data,
            balance: -totalUndertime,
            starts_at: formattedStart,
            ends_at: formattedEnd,
        });

        form.submit(undertime.store(), {
            onSuccess: () => {
                form.reset();

                setTime('08:00:00');
            },
        });
    }
    return (
        <>
            <div className="w-full max-w-2xl rounded-t-md">
                <div className="space-y-2 bg-gray-100 p-4">
                    <div className="flex items-center gap-x-2">
                        <Clock />
                        <h3 className="text-2xl font-bold">
                            Report Attendance Issue
                        </h3>
                    </div>
                    <p>
                        Submit a record for undertime or tardiness for HR
                        review.
                    </p>
                </div>
            </div>
            <div className="rounded-t-0 w-full max-w-2xl rounded-b-md border border-sidebar-border/70 md:p-4">
                <FieldSet className="space-y-6">
                    {/* user */}
                    <FieldGroup className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                        <div>
                            <FieldLabel>Employee Name</FieldLabel>
                            <FieldDescription>
                                Choose an employee to report.
                            </FieldDescription>
                        </div>

                        <div>
                            <Combobox
                                onValueChange={(value) => {
                                    form.setData('user_id', Number(value));
                                }}
                                items={users}
                            >
                                <ComboboxInput
                                    value={
                                        users.find(
                                            (user) =>
                                                user.id === form.data.user_id,
                                        )?.name ?? null
                                    }
                                    placeholder="Select an employee"
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        No users found.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(user) => (
                                            <ComboboxItem
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                    </FieldGroup>

                    {/* Undertime */}
                    <FieldGroup className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                        <FieldLabel>Type of Report</FieldLabel>

                        <ToggleGroup
                            type="single"
                            value={form.data.event_tag}
                            disabled={!form.data.user_id}
                            onValueChange={(value) =>
                                value && form.setData('event_tag', value)
                            }
                            className="grid grid-cols-2 gap-3"
                        >
                            {/* TARDINESS */}
                            <ToggleGroupItem
                                value="tardiness"
                                className="flex h-12 items-center gap-2 rounded-lg border transition-all duration-200 hover:border-red-300 hover:bg-red-50 data-[state=on]:scale-[1.02] data-[state=on]:border-red-600 data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:shadow-lg"
                            >
                                <Clock3 className="size-4" />
                                <span className="font-medium">Tardiness</span>
                            </ToggleGroupItem>

                            {/* UNDERTIME */}
                            <ToggleGroupItem
                                value="undertime"
                                className="flex h-12 items-center gap-2 rounded-lg border transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 data-[state=on]:scale-[1.02] data-[state=on]:border-blue-600 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:shadow-lg"
                            >
                                <Timer className="size-4" />
                                <span className="font-medium">Undertime</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </FieldGroup>

                    {/* Date & Time */}
                    <FieldGroup className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                        <div>
                            <FieldLabel>Date & Time</FieldLabel>
                            <FieldDescription>
                                Select the date and duration.
                            </FieldDescription>
                        </div>

                        <div className="space-y-4">
                            {/* Date */}
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!form.data.event_tag}
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />

                                        {form.data.starts_at
                                            ? form.data.starts_at
                                            : 'Select date'}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            form.data.starts_at
                                                ? new Date(form.data.starts_at)
                                                : undefined
                                        }
                                        defaultMonth={
                                            form.data.starts_at
                                                ? new Date(form.data.starts_at)
                                                : undefined
                                        }
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            form.setData(
                                                'starts_at',
                                                date
                                                    ? format(date, 'yyyy-MM-dd')
                                                    : '',
                                            );
                                            form.setData(
                                                'ends_at',
                                                date
                                                    ? format(date, 'yyyy-MM-dd')
                                                    : '',
                                            );
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Field className="w-32">
                                <FieldLabel htmlFor="time-picker-optional">
                                    Time
                                </FieldLabel>
                                <Input
                                    type="time"
                                    disabled={!form.data.ends_at}
                                    id="time-picker-optional"
                                    onChange={(e) => setTime(e.target.value)}
                                    value={time}
                                    step="1"
                                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                            </Field>
                        </div>
                    </FieldGroup>

                    {/* Submit */}
                    <FieldGroup>
                        <div className="flex w-full items-center justify-end gap-3">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={form.processing}
                            >
                                {form.processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </FieldGroup>
                </FieldSet>
            </div>
        </>
    );
}
