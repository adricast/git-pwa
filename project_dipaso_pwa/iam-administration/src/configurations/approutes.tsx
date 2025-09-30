import GroupManagement from "./../features/usersgroup/groupuserLayout";
import AdminPage from "./../features/principal/adminPage";

export const appRoutes = [
  {
    path: "/dashboard/admin",
    element: <AdminPage />,
    children: [

      { path: "usergroup", element: <GroupManagement /> },
 
    ],
  },
];
