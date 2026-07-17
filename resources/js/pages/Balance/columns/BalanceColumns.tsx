import { Button } from '@/components/ui/button';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import balance from '@/routes/balance';
import { useForm } from '@inertiajs/react';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
    differenceInMinutes,
    format,
    isSameDay,
    isSameMonth,
    isSameYear,
    parseISO,
} from 'date-fns';
import {
    CalendarMinus2,
    CalendarOff,
    ClockArrowDown,
    LucideIcon,
    Plane,
    TrendingDown,
    Heart,
    Calendar,
    MoreHorizontal,
    Icon,
} from 'lucide-react';

export type BalanceProps = {
    id: number;
    user_id: number;
    leave_type: string;
    event_type: string;
    event_tag: string;
    balance: number;
    starts_at: string;
    ends_at: string;
};

const leaveIcons: Record<string, LucideIcon> = {
    'sick leave': CalendarOff,
    'vacation leave': Plane,
    'force leave': CalendarMinus2,
    bereavement: Heart,
    tardiness: ClockArrowDown,
    undertime: TrendingDown,
};

function getLeaveIcon(leaveType: string, eventTag: string): LucideIcon {
    const key = (eventTag || leaveType).toLowerCase();
    return leaveIcons[key] ?? Calendar;
}

export const BalanceColumns: ColumnDef<BalanceProps>[] = [
    {
        accessorKey: 'leave_type',
        header: () => (
            <div className="text-left text-[11px] font-medium tracking-wider text-sky-600 uppercase">
                Leave type
            </div>
        ),
        cell: ({ row }) => {
            const leaveType = row.original.leave_type;
            const eventTag = row.original.event_tag;
            const eventType = row.original.event_type;

            const isAttendanceTag =
                eventTag === 'tardiness' || eventTag === 'undertime';

            const label = isAttendanceTag ? eventTag : leaveType;

            const Icon = getLeaveIcon(leaveType, eventTag);

            let badgeColorClass;
            if (eventTag === 'leave' || eventType === 'deduction') {
                badgeColorClass = 'bg-red-100 text-red-700 border-red-200';
            } else if (eventType === 'accrual') {
                badgeColorClass =
                    'bg-green-100 text-green-700 border-green-200';
            } else {
                badgeColorClass =
                    'bg-amber-100 text-amber-700 border-amber-200';
            }

            return (
                <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${badgeColorClass}`}
                >
                    <Icon size={13} aria-hidden="true" />
                    {label}
                </div>
            );
        },
    },
    {
        accessorKey: 'event_type',
        header: () => (
            <div className="text-left text-[11px] font-medium tracking-wider text-sky-600 uppercase">
                Event type
            </div>
        ),
        cell: ({ row }) => {
            const type = row.original.event_type;

            let textColor =
                type === 'accrual' ? 'text-green-700' : 'text-amber-700';

            return (
                <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium capitalize ${textColor}`}
                >
                    {type}
                </div>
            );
        },
    },
    {
        accessorKey: 'balance',
        header: () => (
            <div className="text-left text-[11px] font-medium tracking-wider text-sky-600 uppercase">
                Transaction
            </div>
        ),
        cell: ({ row }) => {
            const balance = row.original.balance;
            const isAccrual = row.original.event_type === 'accrual';

            const sign = isAccrual ? '+' : '';

            return (
                <span
                    className={`text-sm font-medium ${
                        isAccrual ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                    {sign}
                    {balance}
                </span>
            );
        },
    },
    {
        accessorKey: 'starts_at',
        header: () => (
            <div className="text-left text-[11px] font-medium tracking-wider text-sky-600 uppercase">
                Date info
            </div>
        ),
        cell: ({ row }) => {
            const startsAt = parseISO(row.original.starts_at);
            const endsAt = parseISO(row.original.ends_at);

            let dateLabel = '';

            if (isSameDay(startsAt, endsAt)) {
                dateLabel = format(startsAt, 'MMM d, yyyy');
            } else if (
                isSameMonth(startsAt, endsAt) &&
                isSameYear(startsAt, endsAt)
            ) {
                dateLabel = `${format(startsAt, 'MMM d')}-${format(endsAt, 'd, yyyy')}`;
            } else if (isSameYear(startsAt, endsAt)) {
                dateLabel = `${format(startsAt, 'MMM d')}-${format(endsAt, 'MMM d, yyyy')}`;
            } else {
                dateLabel = `${format(startsAt, 'MMM d, yyyy')}-${format(endsAt, 'MMM d, yyyy')}`;
            }

            return <span className="text-sm">{dateLabel}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const leave = row.original;

            const leaveForm = useForm({
                id: 0,
            });

            const queryClient = useQueryClient();

            function handleDelete(e: React.MouseEvent) {
                e.preventDefault();

                leaveForm.submit(balance.destroy(leave), {
                    onSuccess: () => {
                        console.log('Deleted');
                    },
                });
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleDelete}>
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>
                            View payment details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
