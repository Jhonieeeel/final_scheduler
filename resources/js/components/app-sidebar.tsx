import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import balance from '@/routes/balance';
import calendar from '@/routes/calendar';
import dashboard from '@/routes/dashboard';
import leave from '@/routes/leave';
import undertime from '@/routes/undertime';
import type { MainNav } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Calendar1Icon,
    CalendarArrowUp,
    LayoutGrid,
    ListOrdered,
    TimerOff,
} from 'lucide-react';

const mainNavItems: MainNav[] = [
    {
        groupLabel: 'Dashboard',
        items: [
            {
                title: 'Dashboard',
                href: dashboard.index(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        groupLabel: 'Leave Management',
        items: [
            {
                title: 'Balances',
                href: balance.index(),
                icon: ListOrdered,
            },
            {
                title: 'File Leave',
                href: leave.index(),
                icon: CalendarArrowUp,
            },
            {
                title: 'File Undertime',
                href: undertime.index(),
                icon: TimerOff,
            },
        ],
    },
    {
        groupLabel: 'Planning',
        items: [
            {
                title: 'Schedule',
                href: calendar.index(),
                icon: Calendar1Icon,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={dashboard.index()}
                                prefetch={['mount', 'hover']}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
