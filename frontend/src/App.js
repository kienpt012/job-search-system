import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, createContext, lazy, useState } from "react";
import { ToastContainer } from "react-toastify";

const Home = lazy(() => import("./view/candidate/HomeCandidate"));
const CompanyList = lazy(() => import("./view/candidate/CompanyList"));
const Company = lazy(() => import("./view/candidate/Company"));
const JobList = lazy(() => import("./view/candidate/JobList"));
const Job = lazy(() => import("./view/candidate/Job"));
const EmployerLayout = lazy(() => import("./view/employer/layouts/Layout"));
const EmployerLogin = lazy(() => import("./view/employer/auth/Login"));
const AdminLayout = lazy(() => import("./view/admin/Layout"));
const AdminLogin = lazy(() => import("./view/admin/Login"));
const AdminDashboard = lazy(() => import("./view/admin/Dashboard"));
const AdminJobs = lazy(() => import("./view/admin/Jobs"));
const AdminAppearance = lazy(() => import("./view/admin/Appearance"));
const CandidateList = lazy(() => import("./view/employer/candidates/CandidateList"));
const JobManagement = lazy(() => import("./view/employer/jobs/JobManagement"));
const EmployerDashboard = lazy(() => import("./view/employer/dashboard/Dashboard"));
const CandidateLayout = lazy(() => import("./view/candidate/management/layouts/CandidateLayout"));
const CandidateDashboard = lazy(() => import("./view/candidate/management/Dashboard"));
const AppliedJobs = lazy(() => import("./view/candidate/management/AppliedJobs"));
const SavedJobs = lazy(() => import("./view/candidate/management/SavedJobs"));
const Signup = lazy(() => import("./view/candidate/auth/Signup"));
const Layout = lazy(() => import("./view/candidate/layouts/Layout"));
const Profile = lazy(() => import("./view/candidate/management/profile"));
const Resume = lazy(() => import("./view/candidate/management/resumes"));
const Template = lazy(() => import("./view/candidate/management/resumes/templates"));

export const AppContext = createContext();

function RouteFallback() {
  return <div className="page-section">Dang tai...</div>;
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage }}>
      <ToastContainer autoClose={500} position="bottom-right" />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="jobs" element={<AdminJobs />} />
                    <Route path="appearance" element={<AdminAppearance />} />
                  </Routes>
                </AdminLayout>
              }
            />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    <Route index element={<Home />} />
                    <Route path="sign-up" element={<Signup />} />
                    <Route path="companies" element={<CompanyList />} />
                    <Route path="companies/:id" element={<Company />} />
                    <Route path="jobs" element={<JobList />} />
                    <Route path="jobs/:id" element={<Job />} />
                    <Route
                      path="candidate/*"
                      element={
                        <CandidateLayout>
                          <Routes>
                            <Route index element={<CandidateDashboard />} />
                            <Route path="applied-jobs" element={<AppliedJobs />} />
                            <Route path="saved-jobs" element={<SavedJobs />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="resumes" element={<Resume />} />
                            <Route path="resumes/create" element={<Template />} />
                            <Route path="resumes/:id" element={<Template />} />
                          </Routes>
                        </CandidateLayout>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
            <Route
              path="employer/*"
              element={
                <EmployerLayout>
                  <Routes>
                    <Route index element={<EmployerDashboard />} />
                    <Route path="candidates" element={<CandidateList />} />
                    <Route path="jobs" element={<JobManagement />} />
                  </Routes>
                </EmployerLayout>
              }
            />
            <Route path="employer/login" element={<EmployerLogin />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
