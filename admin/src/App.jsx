import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DafaultLayout/DefaultLayout";
import { routes } from "@/routes/routes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import GlobalProvider from "./context/GlobalProvider";
import Login from "./components/Authentication/Login";
import { PrivateRoute, PublicRoute } from "./components/AuthRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "sonner";

function App() {
  return (
    <GlobalProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <NotificationProvider>
          <Router>
            <div className="h-screen">
              <Routes>
                {/* Public route: chỉ vào login nếu chưa đăng nhập */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                {/* Private routes: phải có token mới vào được */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Navigate to="/overview" />
                    </PrivateRoute>
                  }
                />
                {routes.map((route, index) => {
                  const Page = route.component;
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        <PrivateRoute>
                          <DefaultLayout>
                            <Page />
                          </DefaultLayout>
                        </PrivateRoute>
                      }
                    />
                  );
                })}
              </Routes>
            </div>
          </Router>
          <Toaster position="top-right" />
        </NotificationProvider>
      </ThemeProvider>
    </GlobalProvider>
  );
}

export default App;
