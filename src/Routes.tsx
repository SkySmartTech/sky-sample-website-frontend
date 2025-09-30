import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";
import { AuditCalendar } from "./views/AuditAndInspection/Calendar/Calendar";

//Login Page
const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

//Register Page
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage")
);

//Insight Page
const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

//Administration
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable")
);

//Design - Components
const AccordionAndDividers = React.lazy(
  () => import("./views/Components/AccordionAndDividers")
);
const ImageDesigns = React.lazy(
  () => import("./views/Components/ImageDesigns")
);
const TabPanel = React.lazy(
  () => import("./views/Components/TabPanel")
);
const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

//Design - Input Fields
const TextField = React.lazy(() => import("./views/Components/TextField"));
const DatePickers = React.lazy(() => import("./views/Components/DatePickers"));
const OtherInputs = React.lazy(() => import("./views/Components/OtherInputs"));
const EnvironmentDashBoard = React.lazy(
  () => import("./views/Environment/Dashboard")
);

//Sample CRUD - Chemical management
const ChemicalRequestTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalRequestTable")
);
const ChemicalPurchaseInventoryTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalPurchaseInventoryTable")
);
const ChemicalTransactionTable = React.lazy(
  () => import("./views/ChemicalMng/TransactionTable")
);
const ChemicalDashboard = React.lazy(
  () => import("./views/ChemicalMng/Dashboard")
);

const Autocomplete = React.lazy(
  () => import("./views/Components/Autocomplete")
);

function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
      <Component />
    </Suspense>
  );
}

const ProtectedRoute = () => {
  const { user, status } = useCurrentUser();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);
  console.log("user", user);
  return (
    <Routes>
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
      <Route element={<ProtectedRoute />}>
        {/* Insight */}
        <Route
          path="/home"
          element={withLayout(
            MainLayout,
            InsightsPage,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* Admin Controller */}
        <Route
          path="/admin/users"
          element={withLayout(
            MainLayout,
            UserTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
          )}
        />
        <Route
          path="/admin/access-management"
          element={withLayout(
            MainLayout,
            AccessManagementTable,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* Design - Components */}
        <Route
          path="/components/accordion-divider"
          element={withLayout(
            MainLayout,
            AccordionAndDividers,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/components/image-designs"
          element={withLayout(
            MainLayout,
            ImageDesigns,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/components/tab-panels"
          element={withLayout(
            MainLayout,
            TabPanel,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/components/under-development"
          element={withLayout(MainLayout, UnderDevelopment)}
        />

        {/* Design - Input Fields */}
        <Route
          path="/input-fields/autocomplete"
          element={withLayout(
            MainLayout,
            Autocomplete,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/input-fields/textfield"
          element={withLayout(
            MainLayout,
            TextField,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/input-fields/date-pickers"
          element={withLayout(
            MainLayout,
            DatePickers,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/input-fields/other-inputs"
          element={withLayout(
            MainLayout,
            OtherInputs,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* chemical management */}
        <Route
          path="/chemical-mng/dashboard"
          element={withLayout(
            MainLayout,
            ChemicalDashboard,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/chemical-mng/chemical-requests"
          element={withLayout(MainLayout, ChemicalRequestTable)}
        />
        <Route
          path="/chemical-mng/purchase-inventory"
          element={withLayout(MainLayout, ChemicalPurchaseInventoryTable)}
        />
        <Route
          path="/chemical-mng/transaction"
          element={withLayout(MainLayout, ChemicalTransactionTable)}
        />
        <Route
          path="/chemical-mng/assigned-tasks"
          element={withLayout(MainLayout, () => (
            <ChemicalRequestTable isAssignedTasks={true} />
          ))}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
