import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DafaultLayout/DefaultLayout";
import { routes } from "@/routes/routes";
import "./App.css";
import { ThemeProvider } from "@/components/ui/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Router>
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" />} />
          {routes.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <DefaultLayout>
                    <Page />
                  </DefaultLayout>
                }
              />
            );
          })}
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
