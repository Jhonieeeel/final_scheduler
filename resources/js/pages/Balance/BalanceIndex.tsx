import balance from '@/routes/balance';
import { User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UserColumns } from './columns/UserColumns';
import Pagination from './components/Pagination';
import UserFilterButton from './components/UserFilterButton';
import { fetchUserFiling, fetchUserStatus } from './data/fetchData';
import { BalanceIndexTable } from './table/BalanceIndexTable';
type PageProps = {
    users: User[];
    filters: {
        month: string;
        year: string;
    };
};

export default function BalanceIndex() {
    const [filter, setFilter] = useState({
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        current_page: 1,
    });

    const { data } = useQuery({
        queryKey: ['users', filter.month, filter.year, filter.current_page],
        queryFn: () =>
            fetchUserFiling(filter.month, filter.year, filter.current_page),
        staleTime: 1000 * 60,
    });

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
                        {/* <FilterButton
                            month={month}
                            year={year}
                            onMonthChange={setMonth}
                            onYearChange={setYear}
                        /> */}
                        <UserFilterButton
                            filter={filter}
                            setFilter={setFilter}
                        />
                    </div>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <>
                        <BalanceIndexTable
                            columns={UserColumns}
                            data={data?.users?.data ?? []}
                        />
                        <Pagination links={data?.users?.links} />
                    </>
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
