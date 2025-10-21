import GroupManagement from "../../features/usersgroup/groupuserLayout";
import AdminPage from "../../features/principal/adminPage";
import EmployManagement from "../../features/employ/employLayout";

export const appRoutes = [
  {
    path: "/dashboard/admin",
    element: <AdminPage />,
    children: [

      { path: "usergroup", element: <GroupManagement /> },
      { path: "employ", element: <EmployManagement /> },
 
    ],
  },
];
