import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserInfo } from '@/components/user-info';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import EditEvent from './EditEvent';
import ViewEvent from './ViewEvent';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    calendarEvent: CalendarEvent;
}

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

export default function CustomEventModal({
    open,
    onOpenChange,
    calendarEvent,
}: Props) {
    const [mode, setMode] = useState('view');

    const form = useForm();

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) {
                    setMode('view');
                    form.reset();
                }
            }}
        >
            <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b px-5 pt-5 pb-4">
                    <div className="flex h-11 items-center gap-2">
                        <UserInfo user={calendarEvent.user} />
                    </div>
                </div>

                {mode === 'view' ? (
                    <ViewEvent
                        calendarEvent={calendarEvent}
                        setMode={setMode}
                        open={open}
                        onOpenChange={onOpenChange}
                    />
                ) : (
                    <EditEvent
                        calendarEvent={calendarEvent}
                        setMode={setMode}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
