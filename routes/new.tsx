// UndertimeForm
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
import undertime from '@/routes/undertime';
import { User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { differenceInMinutes, format } from 'date-fns';
import { CalendarIcon, Clock3, Timer } from 'lucide-react';
import { useState } from 'react';
import { HOURS_TABLE, MINUTES_TABLE } from './constant/Conversion';

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
        <FieldSet className="w-full max-w-2xl rounded-md border border-sidebar-border/70 md:p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* User */}
                <FieldGroup>
                    <Field>
                        <FieldLabel className="text-slate-700 dark:text-slate-200">
                            Employee Name
                        </FieldLabel>

                        <Combobox
                            onValueChange={(value) => {
                                form.setData('user_id', Number(value));
                            }}
                            items={users}
                        >
                            <ComboboxInput
                                value={
                                    users.find(
                                        (user) => user.id === form.data.user_id,
                                    )?.name ?? null
                                }
                                placeholder="Select employee"
                                className="border-slate-300 focus:border-sky-500 focus:ring-sky-500 dark:border-slate-700"
                            />

                            <ComboboxContent>
                                <ComboboxEmpty>No users found.</ComboboxEmpty>

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

                        <FieldDescription className="text-slate-500 dark:text-slate-400">
                            Select the employee involved in this report.
                        </FieldDescription>
                    </Field>
                </FieldGroup>
                {/* Report Type */}
                <FieldGroup>
                    <Field>
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
                            {/* Tardiness */}
                            <ToggleGroupItem
                                value="tardiness"
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 transition-all duration-300 hover:border-red-400 hover:bg-red-50 data-[state=on]:scale-[1.02] data-[state=on]:border-red-600 data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:shadow-lg dark:border-red-900 dark:hover:bg-red-950/40"
                            >
                                <Clock3 className="size-4" />
                                <span className="font-medium">Tardiness</span>
                            </ToggleGroupItem>

                            {/* Undertime */}
                            <ToggleGroupItem
                                value="undertime"
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-sky-200 transition-all duration-300 hover:border-sky-400 hover:bg-sky-50 data-[state=on]:scale-[1.02] data-[state=on]:border-sky-600 data-[state=on]:bg-sky-600 data-[state=on]:text-white data-[state=on]:shadow-lg dark:border-sky-900 dark:hover:bg-sky-950/40 dark:data-[state=on]:border-sky-500 dark:data-[state=on]:bg-sky-500"
                            >
                                <Timer className="size-4" />

                                <span className="font-medium">Undertime</span>
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <FieldDescription>
                            Choose the attendance issue type.
                        </FieldDescription>
                    </Field>
                </FieldGroup>
                {/* Date and time */}
                <FieldGroup>
                    <Field>
                        {/* Date */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel>Date </FieldLabel>

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
                            </div>

                            {/* Time */}
                            <div>
                                <FieldLabel>Time </FieldLabel>

                                <Input
                                    type="time"
                                    disabled={!form.data.ends_at}
                                    value={time}
                                    step="1"
                                    onChange={(e) => setTime(e.target.value)}
                                    className="border-slate-300 bg-background focus:border-sky-500 focus:ring-sky-500 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        <FieldDescription>
                            Select the date and duration.
                        </FieldDescription>
                    </Field>
                </FieldGroup>
                {/* action */}
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
            </form>
        </FieldSet>
    );
}

// LeaveForm
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import leave from '@/routes/leave';
import { User } from '@/types';
import { Form, Head, useForm, usePage } from '@inertiajs/react';

// date

import { differenceInDays, format, isValid, parse } from 'date-fns';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import React, { EventHandler, useState } from 'react';

type LeaveProps = {
    users: User[];
};

type LeaveFormProps = {
    user_id: number;
    leave_type: string;
    event_type: string;
    event_tag?: string;
    starts_at: string;
    ends_at: string;
    balance: number;
};

type EventType = {
    id: number;
    leave_type: string;
};

const event_types: EventType[] = [
    { id: 1, leave_type: 'Vacation Leave' },
    { id: 2, leave_type: 'Sick Leave' },
    { id: 3, leave_type: 'Force Leave' },
    { id: 4, leave_type: 'Wellness Leave' },
];

export default function LeaveForm() {
    const { users } = usePage<LeaveProps>().props;

    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    const form = useForm<LeaveFormProps>({
        user_id: 0,
        leave_type: '',
        event_type: 'deduction',
        event_tag: 'leave',
        starts_at: '',
        ends_at: '',
        balance: 0,
    });

    function handleSubmit(e: React.SubmitEvent) {
        const days =
            differenceInDays(form.data.ends_at, form.data.starts_at) + 1;

        form.setData({
            ...form.data,
            balance: -days,
        });

        e.preventDefault();
        form.submit(leave.store(), {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <>
            <Head title="File Leave" />
            <FieldSet className="w-full max-w-2xl rounded-md border border-sidebar-border/70 md:p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username">
                                Employee Name
                            </FieldLabel>
                            <Combobox
                                onValueChange={(value) => {
                                    form.setData('user_id', Number(value));
                                }}
                                items={users}
                            >
                                <ComboboxInput
                                    value={
                                        users?.find(
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
                            <FieldDescription>
                                Choose an employee to file a leave.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    {/* Leave Type */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Leave Type</FieldLabel>
                            <Combobox
                                items={event_types}
                                onValueChange={(val) => {
                                    form.setData(
                                        'leave_type',
                                        String(val).toLowerCase(),
                                    );
                                    if (
                                        String(val).toLowerCase() ===
                                        'force leave'
                                    )
                                        form.setData(
                                            'event_tag',
                                            'vacation leave',
                                        );
                                }}
                            >
                                <ComboboxInput
                                    disabled={!form.data.user_id}
                                    placeholder="Select an event"
                                    className="border"
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        No events found.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem
                                                key={item.id}
                                                value={item.leave_type}
                                            >
                                                {item.leave_type}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </Field>
                    </FieldGroup>
                    {/* Date */}
                    <FieldGroup className="grid grid-cols-2">
                        {/* starts_at */}
                        <Field>
                            <FieldLabel>Starts at</FieldLabel>
                            <Popover
                                open={startOpen}
                                onOpenChange={setStartOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!form.data.leave_type}
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />

                                        {form.data.starts_at &&
                                        isValid(
                                            parse(
                                                form.data.starts_at,
                                                'yyyy-MM-dd',
                                                new Date(),
                                            ),
                                        )
                                            ? format(
                                                  parse(
                                                      form.data.starts_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  ),
                                                  'PPP',
                                              )
                                            : 'Select start date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            form.data.starts_at
                                                ? parse(
                                                      form.data.starts_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  )
                                                : undefined
                                        }
                                        defaultMonth={
                                            form.data.starts_at
                                                ? parse(
                                                      form.data.starts_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  )
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
                                            setStartOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FieldDescription>
                                Starting date to leave.
                            </FieldDescription>
                        </Field>
                        {/* ends at */}
                        <Field>
                            <FieldLabel htmlFor="date-picker-optional">
                                End Date
                            </FieldLabel>
                            <Popover open={endOpen} onOpenChange={setEndOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        disabled={!form.data.starts_at}
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />

                                        {form.data.ends_at &&
                                        isValid(
                                            parse(
                                                form.data.ends_at,
                                                'yyyy-MM-dd',
                                                new Date(),
                                            ),
                                        )
                                            ? format(
                                                  parse(
                                                      form.data.ends_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  ),
                                                  'PPP',
                                              )
                                            : 'Select end date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            form.data.ends_at
                                                ? parse(
                                                      form.data.ends_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  )
                                                : undefined
                                        }
                                        defaultMonth={
                                            form.data.ends_at
                                                ? parse(
                                                      form.data.ends_at,
                                                      'yyyy-MM-dd',
                                                      new Date(),
                                                  )
                                                : undefined
                                        }
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            form.setData(
                                                'ends_at',
                                                date
                                                    ? format(date, 'yyyy-MM-dd')
                                                    : '',
                                            );
                                            setEndOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FieldDescription>
                                Ending date to leave.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    {/* Alert */}
                    <Field>
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
                            <InfoIcon className="text-amber-600 dark:text-amber-500" />
                            <AlertTitle className="text-amber-900 dark:text-amber-200">
                                Check your balance first
                            </AlertTitle>
                            <AlertDescription className="text-amber-800 dark:text-amber-300">
                                Make sure you have sufficient balance before
                                submitting. Once submitted, requests are
                                typically processed within 48 hours.
                            </AlertDescription>
                        </Alert>
                    </Field>
                    {/* Button */}
                    <FieldGroup>
                        <div className="flex w-full items-center justify-end gap-3">
                            <Button type="button" variant="outline-sky">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                data-test="login-button"
                                variant="sky"
                            >
                                {form.processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </FieldSet>
        </>
    );
}

// Leave Index
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import leave from '@/routes/leave';
import { Head } from '@inertiajs/react';
import LeaveForm from './LeaveForm';

export default function LeaveIndex() {
    return (
        <>
            <Head title="Leave" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    <h1 className="text-4xl font-bold text-sky-600">
                        {' '}
                        Report Attendance Issue
                    </h1>
                    <p className="text-muted-foreground">
                        Submit your time off request for approval by your
                        manager.
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <LeaveForm />
                </div>
            </div>
        </>
    );
}

LeaveIndex.layout = {
    breadcrumbs: [
        {
            title: 'Leave',
            href: leave.index(),
        },
    ],
};

// UndertimeIndex
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import undertime from '@/routes/undertime';
import { Head } from '@inertiajs/react';
import UndertimeForm from './UndertimeForm';

export default function UndertimeIndex() {
    return (
        <>
            <Head title="Undertime" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    <h1 className="text-4xl font-bold text-sky-600">
                        File an Undertime
                    </h1>
                    <p className="text-muted-foreground">
                        Submit undertime or tardiness records for HR review.e
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <UndertimeForm />
                </div>
            </div>
        </>
    );
}

UndertimeIndex.layout = {
    breadcrumbs: [
        {
            title: 'Undertime',
            href: undertime.index(),
        },
    ],
};

// BalanceIndex
import balance from '@/routes/balance';
import { User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar1Icon } from 'lucide-react';
import { UserColumns } from './columns/UserColumns';
import Pagination from './components/Pagination';
import UserFilterButton from './components/UserFilterButton';
import { BalanceIndexTable } from './table/BalanceIndexTable';
import GenerateButton from './components/GenerateButton';

type PageProps = {
    users: any; // Adjusted to 'any' or your paginated object structure
    filters: {
        month: string;
        year: string;
    };
    flash?: {
        downloadUrl?: string;
    };
    filename: string;
};

export default function BalanceIndex() {
    const { users, filters, flash, filename } = usePage<PageProps>().props;

    const form = useForm({
        month: String(filters.month) ?? String(new Date().getMonth() + 1),
        year: String(filters.year) ?? String(new Date().getFullYear()),
    });

    const currentDate = new Date(
        Number(form.data.year),
        Number(form.data.month) - 1,
        1,
    );
    const monthName = format(currentDate, 'MMMM');

    function handleFilter(
        newFilter: Partial<{ month?: string; year?: string }>,
    ) {
        form.setData({ ...form.data, ...newFilter });
        form.get(balance.index().url, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Balance" />
            <div className="flex h-full flex-1 flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="flex scroll-m-20 items-center gap-1.5 text-2xl font-semibold tracking-tight text-sky-600">
                            <Calendar1Icon /> {monthName} {form.data.year}
                        </h3>
                        <h1 className="text-4xl font-bold text-sky-600">
                            {' '}
                            Balance Overview{' '}
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor team leave entitlements, track utilization
                            trends, and manage pending requests across all
                            departments.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserFilterButton
                            filter={form.data}
                            handleFilter={handleFilter}
                        />
                        <GenerateButton
                            month={form.data.month}
                            year={form.data.year}
                        />
                    </div>
                </div>

                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {users && (
                        <>
                            <BalanceIndexTable
                                columns={UserColumns}
                                data={users?.data ?? []}
                            />
                            <Pagination links={users?.links} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

BalanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Balance',
            href: balance.index(),
        },
    ],
};

// button
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/80',

                outline:
                    'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',

                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',

                ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',

                destructive:
                    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',

                link: 'text-primary underline-offset-4 hover:underline',

                // Custom Sky Variant
                sky: 'border border-sky-600 bg-sky-600 text-white shadow-md transition-all duration-300 hover:border-sky-700 hover:bg-sky-700 hover:shadow-sky-300/20 dark:border-sky-500 dark:bg-sky-500 dark:hover:border-sky-400 dark:hover:bg-sky-400',

                'outline-sky':
                    'border border-sky-600 bg-transparent text-sky-600 shadow-sm transition-all duration-300 hover:border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-sky-300/20 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-500 dark:hover:text-white',
            },

            size: {
                default:
                    'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',

                xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

                sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',

                lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',

                icon: 'size-9',

                'icon-xs':
                    "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",

                'icon-sm':
                    'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',

                'icon-lg': 'size-10',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
