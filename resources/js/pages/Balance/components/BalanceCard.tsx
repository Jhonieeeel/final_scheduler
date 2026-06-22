import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Wallet, TrendingDown } from 'lucide-react';

type LeaveCardProps = {
    leave_type: string;
    current_balance: number;
    used: number;
    next_balance: number;
};

export default function BalanceCard({
    leave_type,
    current_balance,
    used,
    next_balance,
}: LeaveCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="size-4" />
                        {leave_type}
                    </CardTitle>

                    <Badge variant="secondary">{next_balance} Days Left</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Available Balance
                    </p>

                    <p className="text-3xl font-bold">{current_balance}</p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="size-4" />
                            Current
                        </div>

                        <span className="font-medium">{current_balance}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="size-4" />
                            Used
                        </div>

                        <span className="font-medium text-destructive">
                            -{used}
                        </span>
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Remaining</span>

                            <span className="text-lg font-bold">
                                {next_balance}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
