import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock10, TrendingUp } from 'lucide-react';

type DashboardProp = {
    hours: number;
};

export default function DashboardCard() {
    return (
        <Card className="card-primary group">
            {/* Glass glow */}
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-sky-300/20 blur-3xl" />

            <CardHeader className="relative">
                <CardTitle className="card-title-primary">
                    <span>Total Overtime Rendered</span>

                    <div className="card-icon-primary">
                        <Clock10 className="card-icon" />
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
