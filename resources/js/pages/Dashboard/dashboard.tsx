import { Head } from '@inertiajs/react';
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

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-14">
                <div>
                    <h3 className="text-2xl font-bold text-sky-600">
                        Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">
                        Monitor and maange employee leave balances and requests
                    </p>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* css size-full per card */}
                    {/* CTO */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md flex justify-between font-bold tracking-wide text-wrap text-gray-500 uppercase">
                                <span>Overall Employee Overtime Rendered</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950">
                                    <Clock10 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardTitle>
                            <CardAction>{/* real action here */}</CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="flex-col items-center gap-2">
                                <p className="text-2xl font-bold">412 hours</p>
                                <span className="flex items-center gap-1 text-sm text-green-600">
                                    <TrendingUp
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    +8% vs last month
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Absent Without Filong */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md flex justify-between font-bold tracking-wide text-wrap text-gray-500 uppercase">
                                <span>Absent without Filing</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 dark:bg-red-950">
                                    <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                            </CardTitle>
                            <CardAction>{/* real action here */}</CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="flex-col items-center gap-2">
                                <p className="text-2xl font-bold">
                                    12 applications
                                </p>
                                <span className="flex items-center gap-1 text-sm text-green-600">
                                    <TrendingUp
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    +8% vs last month
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Rendered Leave Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md flex justify-between font-bold tracking-wide text-wrap text-gray-500 uppercase">
                                <span>Total Rendered Applications</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                                    <Sigma className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                            </CardTitle>
                            <CardAction>{/* real action here */}</CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="flex-col items-center gap-2">
                                <p className="text-2xl font-bold">
                                    32 applications
                                </p>
                                <span className="flex items-center gap-1 text-sm text-green-600">
                                    <TrendingUp
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    +8% vs last month
                                </span>
                            </div>
                        </CardContent>
                    </Card>
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
