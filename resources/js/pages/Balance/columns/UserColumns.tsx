import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import balance from '@/routes/balance';
import { Leave } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Hash, MoreHorizontal } from 'lucide-react';
import MonthlyFilingDialog from '../components/MonthlyFilingDialog';

export const UserColumns: ColumnDef<Leave>[] = [
    {
        accessorKey: 'name',
        header: () => (
            <div className="text-left text-xs tracking-wide text-gray-500 uppercase">
                Employee Name
            </div>
        ),
        cell: ({ row }) => {
            const name = row.original.user.name;

            return <div className="text-left">{name}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: () => (
            <div className="text-left text-xs tracking-wide text-gray-500 uppercase">
                Monthly Status
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            const isCompleted = Boolean(status);

            return (
                <div className="text-left">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            isCompleted
                                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset'
                                : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10 ring-inset',
                        )}
                    >
                        <span
                            className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                isCompleted ? 'bg-green-600' : 'bg-gray-400',
                            )}
                        />
                        {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'section',
        header: () => (
            <div className="text-left text-xs tracking-wide text-gray-500 uppercase">
                Section
            </div>
        ),
        cell: ({ row }) => {
            const name = row.original.user.name;

            return <div className="text-left"></div>;
        },
    },
    {
        id: 'actions',
        header: () => (
            <div className="text-left text-xs tracking-wide text-gray-500 uppercase">
                Action
            </div>
        ),
        cell: ({ row }) => {
            let user_id = row.original.user.id;

            let filing = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>View Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Link
                                className="inline-flex w-full items-center justify-start gap-3"
                                href={balance.show(user_id)}
                            >
                                <Hash />
                                Balance
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <MonthlyFilingDialog filing={filing} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
