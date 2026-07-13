import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import balance from '@/routes/balance';
import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

type Leave = {
    id: number;
    user_id: number;
    leave_type: string;
    event_type: string;
    event_tag: string;
    balance: number;
    starts_at: string;
    ends_at: string;

    //
    status: boolean;
    remarks: string;

    //
    user: User;
};

type UserProp = {
    name: string;
    email: string;
};

export const UserColumns: ColumnDef<UserProp>[] = [
    {
        accessorKey: 'name',
        header: () => <div className="text-left">Employee Name</div>,
        cell: ({ row }) => {
            const name = row.original.name;

            const status = row.original.leave.status;

            return <div className="text-left font-medium">{name}</div>;
        },
    },

    // {
    //     id: 'actions',
    //     header: () => <div className="text-left">Action</div>,
    //     cell: ({ row }) => {
    //         let user_id = row.original.user_id;
    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal className="h-4 w-4" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuItem>
    //                         <Link href={balance.show(user_id)}>
    //                             View Balance
    //                         </Link>
    //                     </DropdownMenuItem>
    //                     {/* <DropdownMenuSeparator /> */}
    //                     {/* <DropdownMenuItem>View customer</DropdownMenuItem>
    //                     <DropdownMenuItem>
    //                         View payment details
    //                     </DropdownMenuItem> */}
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         );
    //     },
    // },
];
