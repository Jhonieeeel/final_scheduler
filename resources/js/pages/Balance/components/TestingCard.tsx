import {
    AlertTriangle,
    CalendarDays,
    Stethoscope,
    TrendingDown,
    Wallet,
} from 'lucide-react';

type LeaveCardProps = {
    data: {
        leave_type: string;
        previous: number;
        current: number;
        used: number;
        estimated: number | null;
    };
};

const leaveConfig: Record<string, { icon: React.ReactNode; accent: string }> = {
    'vacation leave': {
        icon: <CalendarDays className="size-4 text-sky-500" />,
        accent: 'bg-sky-400',
    },
    'sick leave': {
        icon: <Stethoscope className="size-4 text-sky-500" />,
        accent: 'bg-sky-400',
    },
    'force leave': {
        icon: <AlertTriangle className="size-4 text-slate-400" />,
        accent: 'bg-slate-400',
    },
};

export default function TestingCard({ data }: LeaveCardProps) {
    const config =
        leaveConfig[data.leave_type] ?? leaveConfig['vacation leave'];
    const isForceLeave = data.leave_type === 'force leave';
    const unused = isForceLeave
        ? data.current.toFixed(1)
        : data?.estimated?.toFixed(3);

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
            {/* accent bar */}
            <div className={`h-1 w-full ${config.accent}`} />

            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground capitalize">
                    {config.icon}
                    {data.leave_type}
                </div>
                {isForceLeave ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Fixed: 5 days
                    </span>
                ) : (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                        +1.25 next mo.
                    </span>
                )}
            </div>

            <div className="p-4">
                <p
                    className={`text-3xl font-medium ${isForceLeave ? 'text-slate-500' : 'text-sky-600'}`}
                >
                    {data.current.toFixed(3)}
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                    Current balance
                </p>

                <div className="space-y-2">
                    {' '}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="size-4" /> Previous
                        </div>
                        <span className="font-medium text-yellow-600">
                            {data.previous.toFixed(3)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="size-4" /> Current
                        </div>
                        <span className="font-medium">
                            {data.current.toFixed(3)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="size-4" /> Used
                        </div>
                        <span className="font-medium text-destructive">
                            -{data.used.toFixed(0)}
                        </span>
                    </div>
                </div>

                <hr className="my-3 border-border" />

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {isForceLeave
                            ? 'Unused (deducts VL)'
                            : 'Est. next month'}
                    </span>
                    <span
                        className={`text-base font-medium ${isForceLeave ? 'text-destructive' : 'text-sky-600'}`}
                    >
                        {unused}
                    </span>
                </div>
            </div>
        </div>
    );
}
