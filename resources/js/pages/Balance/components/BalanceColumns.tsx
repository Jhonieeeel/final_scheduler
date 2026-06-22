import { ColumnDef } from '@tanstack/react-table';

export type BalanceProps = {
    user_id: number;
    leave_type: string;
    event_type: string;
    event_tag: string;
    balance: number;

    starts_at: string;
    ends_at: string;

    user?: {
        id: number;
        name: string;
    };
};

export const BalanceColumns: ColumnDef<BalanceProps>[] = [
    {
        accessorKey: 'user',
        header: 'Employee Name',
    },
    {
        accessorKey: 'leave_type',
        header: 'Leave Type',
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
    },
];
