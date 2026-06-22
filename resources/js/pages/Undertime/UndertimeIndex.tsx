import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import undertime from '@/routes/undertime';
import { Head } from '@inertiajs/react';
import UndertimeForm from './UndertimeForm';

export default function UndertimeIndex() {
    return (
        <>
            <Head title="Undertime" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-14">
                <div>{/* Title/Description of page */}</div>
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
