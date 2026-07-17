import calendar from '@/routes/calendar';
import { Head, usePage } from '@inertiajs/react';
import LeaveCalendar from './components/LeaveCalendar';
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageProps = {
    flash: {
        message: string;
    };
};

export default function CelendarIndex() {
    const { flash } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 space-y-2 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    {flash?.message && (
                        <Alert>
                            <InfoIcon />
                            <AlertTitle>Deleted!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                            <AlertAction>
                                <Button variant="outline">Enable</Button>
                            </AlertAction>
                        </Alert>
                    )}
                    <h1 className="text-4xl font-bold text-sky-600">
                        Leave Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        View approved leaves, upcoming absences, and company
                        holidays in one place.
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <LeaveCalendar />
                </div>
            </div>
        </>
    );
}

CelendarIndex.layout = {
    breadcrumbs: [
        {
            title: 'Calendar',
            href: calendar.index(),
        },
    ],
};
