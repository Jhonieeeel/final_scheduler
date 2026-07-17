import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import undertime from '@/routes/undertime';
import { Head } from '@inertiajs/react';
import UndertimeForm from './UndertimeForm';

export default function UndertimeIndex() {
    return (
        <>
            <Head title="Undertime" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:px-14 md:py-4">
                <div>
                    <h1 className="text-4xl font-bold text-sky-600">
                        File an Undertime
                    </h1>
                    <p className="text-muted-foreground">
                        Submit undertime or tardiness records for HR review.e
                    </p>
                </div>
                <div className="min-h-100vh relative flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <UndertimeForm />
                </div>
            </div>
        </>
    );
}

UndertimeIndex.layout = {
    breadcrumbs: [
        {
            title: 'Undertime',
            href: undertime.index(),
        },
    ],
};
