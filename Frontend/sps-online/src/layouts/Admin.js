import React from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

// components
//import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
//import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";
//import FooterSmall from "components/Footers/Footer.js";
import Header from "components/Headers/Header.js"
import ServiceEstimateDetails from "components/estimate forms/serviceestimatedetails.js";

// views
import Dashboard from "views/admin/Dashboard.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import CostEstimation from "views/admin/CostEstimation";
import SchedulerPage from "views/admin/SchedulerPage";
import NewEstimatePage from "views/admin/NewEstimatePage";
import Form from"views/admin/FormPage.js";
import MenuTaskManagement from "views/admin/new_for_admin.js";
import  MenuPage  from "views/admin/Page_1_Menu.js";
import  TaskPage  from "views/admin/Page_2_Task_Screen";
import RoleTaskPage from "views/admin/RoleTaskPage";
import Admindashboard_4 from "views/admin/Admindashboard_4.js";
import Menu_new_1 from "views/admin/Page_1_Menu_new.js";
import Departments from "views/admin/Departments";

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
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/admin/maps" exact component={Maps} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/service-estimation/details" exact component={ServiceEstimateDetails} />
            <Route path="/admin/tables" exact component={Tables} />
            <Route path="/admin/costestimation/sub-item-2/a" exact component={CostEstimation} />
            <Route path="/admin/scheduler" exact component={SchedulerPage} />
            <Route path="/admin/NewEstimate" exact component={NewEstimatePage} />
            <Route path="/admin/form" exact component={Form} />

           
           <Route path="/admin/menu_page" exact component={MenuPage} />
            <Route path="/admin/task_page" exact component={TaskPage} />
            <Route path="/admin/departments" exact component={Departments} />
            {/* <Route path="/admin/role_task_page" exact component={RoleTaskPage} /> */}

            <Route path="/admin/dashboard_4" component={Admindashboard_4} />
            <Route path="/admin/role_tasks" component={RoleTaskPage} /> {/* see below */}

            <Route path="/admin/menu_new_1" component={Menu_new_1} />



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
