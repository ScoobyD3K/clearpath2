import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Debts from './pages/Debts';
import DebtDetail from './pages/DebtDetail';
import Strategy from './pages/Strategy';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import PaymentHistory from './pages/PaymentHistory';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Profile": Profile,
    "Debts": Debts,
    "DebtDetail": DebtDetail,
    "Strategy": Strategy,
    "Notifications": Notifications,
    "Settings": Settings,
    "Statistics": Statistics,
    "PaymentHistory": PaymentHistory,
    "Goals": Goals,
    "Calendar": Calendar,
}

export const pagesConfig = {
    mainPage: "DebtDetail",
    Pages: PAGES,
    Layout: Layout,
};