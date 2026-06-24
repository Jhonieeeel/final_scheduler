import { Button } from '@/components/ui/button';
import balance from '@/routes/balance';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { Calendar } from 'lucide-react';

type FormProps = {
    user: User;
    date: any;
};

export default function AccumulateButton({ user, date }: FormProps) {
    const queryClient = useQueryClient();

    const baseDate = addMonths(date, 1);

    const starts_at = format(startOfMonth(baseDate), 'yyyy-MM-dd');
    const ends_at = format(endOfMonth(baseDate), 'yyyy-MM-dd');

    const accrualForm = useForm({
        user_id: user.id,
        leave_type: 'vacation leave',
        event_type: 'accrual',
        event_tag: '',
        balance: 1.25,
        starts_at: starts_at,
        ends_at: ends_at,
    });

    function handleSubmit(e: React.MouseEvent) {
        e.preventDefault();

        console.log(accrualForm.data);
        accrualForm.submit(balance.store(), {
            onSuccess: () =>
                queryClient.invalidateQueries({
                    queryKey: ['balances'],
                }),
        });
    }

    return (
        <Button
            onClick={handleSubmit}
            className="rounded-md border border-sky-700 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-700 hover:text-white dark:border-sky-600 dark:bg-sky-950 dark:text-sky-400 dark:hover:bg-sky-700 dark:hover:text-white"
        >
            <Calendar />
            Simulate Accrual
        </Button>
    );
}
