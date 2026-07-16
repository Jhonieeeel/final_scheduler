import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock10, TrendingUp } from 'lucide-react';

type DashboardProp = {
    hours: number;
};

export default function DashboardCard() {
    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-sky-200/40 bg-gradient-to-br from-sky-50/70 via-white/40 to-sky-100/60 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/50 hover:shadow-sky-200/40 dark:border-sky-800/40 dark:from-sky-950/40 dark:via-slate-900/40 dark:to-sky-900/30">
            {/* Glass glow */}
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-sky-300/20 blur-3xl" />

            <CardHeader className="relative">
                <CardTitle className="flex items-start justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>Total Overtime Rendered</span>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-gradient-to-br from-sky-200/80 to-sky-400/60 shadow-md backdrop-blur-md dark:border-sky-700/40 dark:from-sky-900 dark:to-sky-700">
                        <Clock10 className="h-5 w-5 text-sky-700 dark:text-sky-300" />
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-3">
                <div>
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        412
                    </p>

                    <p className="text-sm text-slate-500">hours this month</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+8%</span>
                    </div>

                    <span className="text-slate-500">
                        compared to last month
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
