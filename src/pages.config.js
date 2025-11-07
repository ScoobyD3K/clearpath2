import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Debts from './pages/Debts';
import DebtDetail from './pages/DebtDetail';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Profile": Profile,
    "Debts": Debts,
    "DebtDetail": DebtDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};