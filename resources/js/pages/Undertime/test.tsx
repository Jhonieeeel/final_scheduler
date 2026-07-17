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
import { Fieldset } from '@base-ui/react';

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
            {/* Header */}

            <div className="w-full max-w-2xl rounded-md border border-sidebar-border/70 md:p-4">
                <div className="relative overflow-hidden rounded-t-xl border border-sky-200/50 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 p-5 shadow-sm dark:border-sky-800/50 dark:from-sky-950/60 dark:via-slate-900 dark:to-sky-900/40">
                    {/* Glow */}
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />

                    <div className="relative space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-100 shadow-sm dark:border-sky-700 dark:bg-sky-900/50">
                                <Clock className="size-5 text-sky-600 dark:text-sky-300" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Report Attendance Issue
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Submit undertime or tardiness records for HR
                                    review.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="relative w-full max-w-2xl rounded-b-xl border border-sky-200/50 bg-white/70 p-5 shadow-lg backdrop-blur-xl dark:border-sky-800/50 dark:bg-slate-900/60">
                    <FieldSet className="space-y-7">
                        {/* User */}
                        <FieldGroup className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel className="text-slate-700 dark:text-slate-200">
                                    Employee Name
                                </FieldLabel>

                                <FieldDescription className="text-slate-500 dark:text-slate-400">
                                    Select the employee involved in this report.
                                </FieldDescription>
                            </div>

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
                                    placeholder="Select employee"
                                    className="border-slate-300 focus:border-sky-500 focus:ring-sky-500 dark:border-slate-700"
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
                        </FieldGroup>

                        {/* Report Type */}
                        <FieldGroup className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel>Type of Report</FieldLabel>

                                <FieldDescription>
                                    Choose the attendance issue type.
                                </FieldDescription>
                            </div>

                            <ToggleGroup
                                type="single"
                                value={form.data.event_tag}
                                disabled={!form.data.user_id}
                                onValueChange={(value) =>
                                    value && form.setData('event_tag', value)
                                }
                                className="grid grid-cols-2 gap-3"
                            >
                                {/* Tardiness */}
                                <ToggleGroupItem
                                    value="tardiness"
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 transition-all duration-300 hover:border-red-400 hover:bg-red-50 data-[state=on]:scale-[1.02] data-[state=on]:border-red-600 data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:shadow-lg dark:border-red-900 dark:hover:bg-red-950/40"
                                >
                                    <Clock3 className="size-4" />
                                    <span className="font-medium">
                                        Tardiness
                                    </span>
                                </ToggleGroupItem>

                                {/* Undertime */}
                                <ToggleGroupItem
                                    value="undertime"
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-sky-200 transition-all duration-300 hover:border-sky-400 hover:bg-sky-50 data-[state=on]:scale-[1.02] data-[state=on]:border-sky-600 data-[state=on]:bg-sky-600 data-[state=on]:text-white data-[state=on]:shadow-lg dark:border-sky-900 dark:hover:bg-sky-950/40 dark:data-[state=on]:border-sky-500 dark:data-[state=on]:bg-sky-500"
                                >
                                    <Timer className="size-4" />

                                    <span className="font-medium">
                                        Undertime
                                    </span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </FieldGroup>

                        {/* Date Time */}
                        <FieldGroup className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel>Date & Time</FieldLabel>

                                <FieldDescription>
                                    Select the date and duration.
                                </FieldDescription>
                            </div>

                            <div className="space-y-4">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline-sky"
                                            disabled={!form.data.event_tag}
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 size-4 text-sky-500" />

                                            {form.data.starts_at
                                                ? form.data.starts_at
                                                : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="rounded-xl border-sky-200 bg-white shadow-xl dark:border-sky-800 dark:bg-slate-900">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                form.data.starts_at
                                                    ? new Date(
                                                          form.data.starts_at,
                                                      )
                                                    : undefined
                                            }
                                            defaultMonth={
                                                form.data.starts_at
                                                    ? new Date(
                                                          form.data.starts_at,
                                                      )
                                                    : undefined
                                            }
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                form.setData(
                                                    'starts_at',
                                                    date
                                                        ? format(
                                                              date,
                                                              'yyyy-MM-dd',
                                                          )
                                                        : '',
                                                );

                                                form.setData(
                                                    'ends_at',
                                                    date
                                                        ? format(
                                                              date,
                                                              'yyyy-MM-dd',
                                                          )
                                                        : '',
                                                );

                                                setOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Field className="w-32">
                                    <FieldLabel>Time</FieldLabel>

                                    <Input
                                        type="time"
                                        disabled={!form.data.ends_at}
                                        value={time}
                                        step="1"
                                        onChange={(e) =>
                                            setTime(e.target.value)
                                        }
                                        className="border-slate-300 bg-background focus:border-sky-500 focus:ring-sky-500 dark:border-slate-700"
                                    />
                                </Field>
                            </div>
                        </FieldGroup>

                        {/* Actions */}
                        <FieldGroup>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline-sky">
                                    Cancel
                                </Button>

                                <Button
                                    variant="sky"
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
            </div>
        </>
    );
}
