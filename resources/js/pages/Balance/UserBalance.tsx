import { Spinner } from '@/components/ui/spinner';
import { User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { useState } from 'react';
import AccumulateButton from './components/AccumulateButton';
import BalanceCard from './components/BalanceCard';
import FilterButton from './components/FilterButton';
import { fetchBalances } from './data/fetchData';

type PageProps = { user: User };

type BalanceResponse = {
    date?: string;
    balances: {
        leave_type: string;
        previousBalance: number;
        usedBalance: number;
        estimatedBalance: number;
    };
};

export default function UserBalance() {
    const { user } = usePage<PageProps>().props;

    const [month, setMonth] = useState(String(new Date().getMonth() + 1));
    const [year, setYear] = useState(String(new Date().getFullYear()));

    const currentDate = new Date(Number(year), Number(month) - 1, 1);
    const monthName = format(currentDate, 'MMMM');

    const filteredMonth = format(currentDate, 'yyyy-MM-dd');

    const { data: balances, isLoading } = useQuery<BalanceResponse>({
        queryKey: ['balances', user.id, month, year],
        queryFn: () => fetchBalances(month, year, user.id),
    });

    console.log(balances);

    const balanceItems = balances?.balances ?? [];
    const filteredDate = balances?.date ?? null;

    return (
        <>
            <Head title="Balance" />
            <div className="flex flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:p-14">
                <div className="flex items-start justify-between">
                    <div className="flex w-full items-center justify-between">
                        <div>
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-sky-500">
                                {monthName}
                            </h3>

                            <h1 className="text-4xl font-bold">
                                Balance Overview
                            </h1>

                            <p className="text-muted-foreground">
                                Monitor team leave entitlements, track
                                utilization trends, and manage pending requests
                                across all departments.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <FilterButton
                                month={month}
                                year={year}
                                onMonthChange={setMonth}
                                onYearChange={setYear}
                            />
                        </div>
                        {filteredDate && (
                            <AccumulateButton
                                key={filteredDate}
                                user={user}
                                date={filteredDate}
                            />
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="mx-auto">
                        <Spinner />
                    </div>
                ) : (
                    <div className="relative grid grid-cols-3 gap-4 rounded-xl">
                        {balanceItems.map((bal, index) => (
                            <BalanceCard data={bal} key={index} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
