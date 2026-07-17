import { Head, useForm, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import dashboard from '@/routes/dashboard';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Clock10, Sigma, TrendingUp, UserX } from 'lucide-react';
import DashboardCard from './components/DashboardCard';
import FilterButton from '../Balance/components/FilterButton';
import balance from '@/routes/balance';
import UserFilterButton from '../Balance/components/UserFilterButton';

type DashboardProp = {
    total_leaves: number;
    filters: {
        month: number;
        year: number;
    };
};

export default function Dashboard() {
    const { total_leaves, filters } = usePage<DashboardProp>().props;

    const filterForm = useForm({
        month: String(filters.month) ?? String(new Date().getMonth() + 1),
        year: String(filters.year) ?? String(new Date().getFullYear()),
    });

    function handleFilter(
        newFilter: Partial<{ month?: string; year?: string }>,
    ) {
        filterForm.setData({ ...filterForm.data, ...newFilter });
        filterForm.get(balance.index().url, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    <div>
                        <h3 className="text-4xl font-bold text-sky-600">
                            Dashboard
                        </h3>
                        <p className="text-sm text-gray-600">
                            Monitor and maange employee leave balances and
                            requests
                        </p>
                    </div>
                    <div>
                        <UserFilterButton
                            filter={filterForm.data}
                            handleFilter={handleFilter}
                        />
                    </div>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* CTO */}
                    <DashboardCard content={total_leaves} />
                </div>
                <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Table */}
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard.index(),
        },
    ],
};
