import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Debts from './pages/Debts';
import DebtDetail from './pages/DebtDetail';
import Strategy from './pages/Strategy';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Profile": Profile,
    "Debts": Debts,
    "DebtDetail": DebtDetail,
    "Strategy": Strategy,
    "Notifications": Notifications,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};