import balance from '@/routes/balance';
import { User } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
    const { users, filters } = usePage<PageProps>().props;

    const form = useForm({
        month: String(filters.month) ?? String(new Date().getMonth() + 1),
        year: String(filters.year) ?? String(new Date().getFullYear()),
    });

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
            <div className="flex h-full flex-1 flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:p-14">
                <div className="flex items-center justify-between">
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
                            filter={form.data}
                            handleFilter={handleFilter}
                        />
                    </div>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <>
                        <BalanceIndexTable
                            columns={UserColumns}
                            data={users?.data ?? []}
                        />
                        <Pagination links={users?.links} />
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
