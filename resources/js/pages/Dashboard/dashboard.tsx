import { Head, usePage } from '@inertiajs/react';
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

type DashboardProp = {
    total_leaves: number;
};

export default function Dashboard() {
    const { total_leaves } = usePage<DashboardProp>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    <h3 className="text-2xl font-bold text-sky-600">
                        Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">
                        Monitor and maange employee leave balances and requests
                    </p>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* CTO */}
                    <DashboardCard />
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
