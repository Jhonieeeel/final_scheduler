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
