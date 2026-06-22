import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import leave from '@/routes/leave';
import { Head } from '@inertiajs/react';
import LeaveForm from './LeaveForm';

export default function LeaveIndex() {
    return (
        <>
            <Head title="Leave" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-14">
                <div>
                    <h1 className="text-4xl font-bold">File a Leave Request</h1>
                    <p className="">
                        Submit your time off request for approval by your
                        manager.
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <LeaveForm />
                </div>
            </div>
        </>
    );
}

LeaveIndex.layout = {
    breadcrumbs: [
        {
            title: 'Leave',
            href: leave.index(),
        },
    ],
};
