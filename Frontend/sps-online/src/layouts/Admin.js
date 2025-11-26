import React from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

// components
//import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
//import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";
//import FooterSmall from "components/Footers/Footer.js";
import Header from "components/Headers/Header.js"

// views
import adminRoutes from "routes/adminRoutes";
import NewPIVPage from "views/admin/NewPIVPage.js";

export default function Admin() {
  const location = useLocation();

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        {/*<AdminNavbar />*/}
        {/* <HeaderStats /> */}
        {/*<Header />*/}
        <Header />
        {/* <HeaderStats /> */}
        {/* {location.pathname !== "/admin/scheduler" && <AdminNavbar />} */}
        {/* {location.pathname !== "/admin/scheduler" && <Header />} */}
        <div
          className={`mx-auto w-full ${
            location.pathname === "/admin/scheduler"
              ? "p-0 m-0" // no padding/margin for scheduler
              : "px-4 md:px-10 -m-24"
          }`}
          style={{
            height: location.pathname === "/admin/scheduler" ? "100vh" : "auto",
          }}
        >

          <Switch>
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.exact !== false}
                component={route.component}
              />
              
            ))}
            <Route path="/admin/newpivpage" exact component={NewPIVPage} />
            <Redirect from="/admin" to="/admin/dashboard" />
            {/*<Route path="/admin/costestimation" exact component={NewEstimatePage} />*/}
          </Switch>
          <FooterAdmin />
          {/* <FooterSmall/> */}
        </div>
      </div>
    </>
  );
}
