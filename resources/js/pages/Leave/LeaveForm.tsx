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
        event_tag: '',
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
                                        users.find(
                                            (user) =>
                                                user.id === form.data.user_id,
                                        )?.name
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
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                data-test="login-button"
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
