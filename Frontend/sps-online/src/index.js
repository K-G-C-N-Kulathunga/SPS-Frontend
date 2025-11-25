import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import './Vars.css';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";
import Form from "./components/Forms/NewCustomerStepper.js";
import SuccessPage from "./components/Forms/SucessPage.js";
import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import Login from "views/auth/Login.js";

import SchedulerPage from "views/admin/SchedulerPage.js";

import Landing from "views/Landing.js";
import Profile from "views/Profile.js";
import Dashboard from "views/admin/Dashboard.js";

import { UserProvider, useUser } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    const { logout } = useUser();
    const history = useHistory();

    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (!user) return;

        let timeoutId = setTimeout(() => {
            logout(); // Call the logout function
            sessionStorage.removeItem("user"); // Remove user session
            alert("You have been logged out due to inactivity.");
            history.push("/");
        }, 360000); // 1 minute

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                logout();
                sessionStorage.removeItem("user");
                alert("You have been logged out due to inactivity.");
                history.push("/");
            }, 360000);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keypress", resetTimer);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
        };
    }, [logout, history]);

    return (
        <Switch>
            <Route path="/form/" component={Form}/>
            <Route path="/success" component={SuccessPage } />
            <Route path="/admin" component={Admin} />
            <Route path="/auth" component={Auth} />
            <Route path="/landing" exact component={Landing} />
            <Route path="/profile" exact component={Profile} />
            <Route path="/" exact component={Login} />
            <ProtectedRoute path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/scheduler" exact component={SchedulerPage} />
            <Redirect from="*" to="/" />
        </Switch>
    );
};

ReactDOM.render(
    <UserProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </UserProvider>,
    document.getElementById("root")
);
