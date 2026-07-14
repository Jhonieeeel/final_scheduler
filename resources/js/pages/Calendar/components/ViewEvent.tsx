import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import calendar from '@/routes/calendar';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, CalendarDays, Pencil, Trash2 } from 'lucide-react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setMode: (mode: string) => void;
    calendarEvent: CalendarEvent;
};

type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    user: User;
    user_id: number;
    status: boolean;
    calendarTitle: string;
    calendarTheme: {
        lightColors: {
            main: string;
            container: string;
            onContainer: string;
        };
    };
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return {
        date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

export default function ViewEvent({
    open,
    onOpenChange,
    calendarEvent,
    setMode,
}: Props) {
    const start = formatDate(calendarEvent.start);
    const end = formatDate(calendarEvent.end);

    const deleteForm = useForm({
        id: Number(calendarEvent?.id),
    });

    const queryClient = useQueryClient();

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        deleteForm.submit(calendar.destroy(deleteForm.data.id), {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['calendarEvents'],
                });
                onOpenChange(false);
            },
        });
    }

    return (
        <>
            {/* Title badge */}
            <div className="border-b px-5 py-3.5">
                <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize"
                    style={{
                        backgroundColor:
                            calendarEvent.calendarTheme?.lightColors?.container,
                        color: calendarEvent.calendarTheme?.lightColors
                            ?.onContainer,
                    }}
                >
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                            backgroundColor:
                                calendarEvent.calendarTheme?.lightColors?.main,
                        }}
                    />
                    {calendarEvent.calendarTitle}
                </span>
            </div>

            {/* Date range */}
            <div className="mx-5 my-4 grid grid-cols-2 rounded-md border">
                <div className="border-r px-4 py-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        <CalendarDays size={11} /> Starts at
                    </p>
                    <p className="text-[15px] font-medium">{start.date}</p>
                    <p className="text-xs text-muted-foreground">
                        {start.time}
                    </p>
                </div>
                <div className="px-4 py-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        <CalendarCheck size={11} /> Ends at
                    </p>
                    <p className="text-[15px] font-medium">{end.date}</p>
                    <p className="text-xs text-muted-foreground">{end.time}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-5 py-3.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 size={13} className="mr-1" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete this event?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this event.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => setMode('edit')} size="sm">
                        <Pencil size={13} className="mr-1" /> Edit event
                    </Button>
                </div>
            </div>
        </>
    );
}
