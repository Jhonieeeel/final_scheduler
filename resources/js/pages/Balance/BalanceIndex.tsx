import balance from '@/routes/balance';
import { Head } from '@inertiajs/react';
import LeaveForm from '../Leave/LeaveForm';
import BalanceCard from './components/BalanceCard';

export default function BalanceIndex() {
    return (
        <>
            <Head title="Balance" />
            <div className="flex h-full flex-1 flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:p-14">
                <div>
                    <h1 className="text-4xl font-bold">Balance Overview</h1>
                    <p className="">
                        Monitor team leave entitlements, track utilization
                        trends, and manage pending requests across all
                        departments.
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* <BalanceCard  /> */}
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
