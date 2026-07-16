import balance from '@/routes/balance';
import { User } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar1Icon } from 'lucide-react';
import { UserColumns } from './columns/UserColumns';
import Pagination from './components/Pagination';
import UserFilterButton from './components/UserFilterButton';
import { BalanceIndexTable } from './table/BalanceIndexTable';
import GenerateButton from './components/GenerateButton';

type PageProps = {
    users: any; // Adjusted to 'any' or your paginated object structure
    filters: {
        month: string;
        year: string;
    };
    flash?: {
        downloadUrl?: string;
    };
    filename: string;
};

export default function BalanceIndex() {
    const { users, filters, flash, filename } = usePage<PageProps>().props;

    console.log(flash?.downloadUrl);

    const form = useForm({
        month: String(filters.month) ?? String(new Date().getMonth() + 1),
        year: String(filters.year) ?? String(new Date().getFullYear()),
    });

    const currentDate = new Date(
        Number(form.data.year),
        Number(form.data.month) - 1,
        1,
    );
    const monthName = format(currentDate, 'MMMM');

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
                        <h3 className="flex scroll-m-20 items-center gap-1.5 text-2xl font-semibold tracking-tight text-sky-600">
                            <Calendar1Icon /> {monthName} {form.data.year}
                        </h3>
                        <h1 className="text-4xl font-bold text-sky-600">
                            {' '}
                            Balance Overview{' '}
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor team leave entitlements, track utilization
                            trends, and manage pending requests across all
                            departments.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserFilterButton
                            filter={form.data}
                            handleFilter={handleFilter}
                        />
                        <GenerateButton
                            month={form.data.month}
                            year={form.data.year}
                        />
                    </div>
                </div>

                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {users && (
                        <>
                            <BalanceIndexTable
                                columns={UserColumns}
                                data={users?.data ?? []}
                            />
                            <Pagination links={users?.links} />
                        </>
                    )}
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
