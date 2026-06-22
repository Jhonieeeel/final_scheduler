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
import { format, isValid, parse } from 'date-fns';
import {
    Calendar1Icon,
    CalendarIcon,
    ChevronDownIcon,
    Clock,
    Clock3,
    Timer,
} from 'lucide-react';
import { useState } from 'react';

type UndertimeFormProp = {
    user_id: number;
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

    const form = useForm<UndertimeFormProp>({
        user_id: 0,
        leave_type: '',
        event_type: '',
        event_tag: '',
        balance: 0,
        starts_at: '',
        ends_at: '',
    });

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
                <FieldSet>
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
                                Choose an employee to report.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                    {/* UT/T */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Type of Report</FieldLabel>
                            <ToggleGroup
                                type="single"
                                value={form.data.event_tag}
                                onValueChange={(value) =>
                                    value && form.setData('event_tag', value)
                                }
                                className="grid grid-cols-2 gap-3"
                            >
                                <ToggleGroupItem
                                    value="tardiness"
                                    className="h-10 rounded-md border"
                                >
                                    <Clock3 className="size-4" />
                                    Tardiness
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="undertime"
                                    className="h-10 rounded-md border"
                                >
                                    <Timer className="size-4" />
                                    Undertime
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Field>
                    </FieldGroup>
                    <FieldGroup className="flex-row">
                        <Field>
                            <FieldLabel htmlFor="date-picker-optional">
                                Date
                            </FieldLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!form.data.event_tag}
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
                                            : 'Select date'}
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
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </Field>
                        <Field className="w-32">
                            <FieldLabel htmlFor="time-picker-optional">
                                Time
                            </FieldLabel>
                            <Input
                                type="time"
                                id="time-picker-optional"
                                step="1"
                                defaultValue="08:00:00"
                                disabled={!form.data.starts_at}
                                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </Field>
                    </FieldGroup>
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
                </FieldSet>
            </div>
        </>
    );
}
