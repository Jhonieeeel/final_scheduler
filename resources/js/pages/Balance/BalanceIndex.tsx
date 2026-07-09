import balance from '@/routes/balance';
import { User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { UserColumns } from './columns/UserColumns';
import { BalanceIndexTable } from './table/BalanceIndexTable';
import FilterButton from './components/FilterButton';
import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from './data/fetchData';
import { useState } from 'react';

type PageProps = {
    users: User[];
};

export default function BalanceIndex() {
    const { users } = usePage<PageProps>().props;

    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(new Date().getFullYear()));

    const { data: usersStatus } = useQuery({
        queryKey: ['users', month, year],
        queryFn: () => fetchUserStatus(month, year),
        staleTime: 1000 * 5,
    });

    console.log(usersStatus);

    return (
        <>
            <Head title="Balance" />
            <div className="flex h-full flex-1 flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:p-14">
                <div>
                    <div>
                        <h1 className="text-4xl font-bold text-sky-600">
                            Balance Overview
                        </h1>
                        <p className="">
                            Monitor team leave entitlements, track utilization
                            trends, and manage pending requests across all
                            departments.
                        </p>
                    </div>
                    <div>
                        <FilterButton
                            month={month}
                            year={year}
                            onMonthChange={setMonth}
                            onYearChange={setYear}
                        />
                    </div>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <BalanceIndexTable
                        columns={UserColumns}
                        data={usersStatus ?? []}
                    />
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
