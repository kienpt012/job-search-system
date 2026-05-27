import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, createContext, lazy, useState } from "react";
import { ToastContainer } from "react-toastify";

const Home = lazy(() => import("./view/candidate/HomeCandidate"));
const CompanyList = lazy(() => import("./view/candidate/CompanyList"));
const Company = lazy(() => import("./view/candidate/Company"));
const JobList = lazy(() => import("./view/candidate/JobList"));
const Job = lazy(() => import("./view/candidate/Job"));
const EmployerLayout = lazy(() => import("./view/employer/layouts/Layout"));
const EmployerLogin = lazy(() => import("./view/employer/auth/Login"));
const EmployerRegister = lazy(() => import("./view/employer/auth/Register"));
const AdminLayout = lazy(() => import("./view/admin/Layout"));
const AdminLogin = lazy(() => import("./view/admin/Login"));
const AdminDashboard = lazy(() => import("./view/admin/Dashboard"));
const AdminJobs = lazy(() => import("./view/admin/Jobs"));
const AdminCompanies = lazy(() => import("./view/admin/Companies"));
const AdminAppearance = lazy(() => import("./view/admin/Appearance"));
const AdminSkills = lazy(() => import("./view/admin/Skills"));
const EmployerApprovals = lazy(() => import("./view/admin/EmployerApprovals"));
const CandidateList = lazy(() => import("./view/employer/candidates/CandidateList"));
const CandidateSearch = lazy(() => import("./view/employer/candidates/CandidateSearch"));
const JobManagement = lazy(() => import("./view/employer/jobs/JobManagement"));
const EmployerDashboard = lazy(() => import("./view/employer/dashboard/Dashboard"));
const EmployerBilling = lazy(() => import("./view/employer/billing/Billing"));
const EmployerBranches = lazy(() => import("./view/employer/company/BranchManagement"));
const EmployerMembers = lazy(() => import("./view/employer/company/MemberManagement"));
const CandidateLayout = lazy(() => import("./view/candidate/management/layouts/CandidateLayout"));
const CandidateDashboard = lazy(() => import("./view/candidate/management/Dashboard"));
const AppliedJobs = lazy(() => import("./view/candidate/management/AppliedJobs"));
const SavedJobs = lazy(() => import("./view/candidate/management/SavedJobs"));
const Signup = lazy(() => import("./view/candidate/auth/Signup"));
const Layout = lazy(() => import("./view/candidate/layouts/Layout"));
const Profile = lazy(() => import("./view/candidate/management/profile"));

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
                    <Route path="companies" element={<AdminCompanies />} />
                    <Route path="jobs" element={<AdminJobs />} />
                    <Route path="skills" element={<AdminSkills />} />
                    <Route path="appearance" element={<AdminAppearance />} />
                    <Route path="employer-approvals" element={<EmployerApprovals />} />
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
                            <Route path="resumes" element={<Navigate to="/candidate/applied-jobs" replace />} />
                            <Route path="resumes/create" element={<Navigate to="/candidate/applied-jobs" replace />} />
                            <Route path="resumes/:id" element={<Navigate to="/candidate/applied-jobs" replace />} />
                          </Routes>
                        </CandidateLayout>
                      }
                    />
                  </Routes>
                </Layout>
              }
            />
            <Route path="employer/login" element={<EmployerLogin />} />
            <Route path="employer/register" element={<EmployerRegister />} />
            <Route
              path="employer/*"
              element={
                <EmployerLayout>
                  <Routes>
                    <Route index element={<EmployerDashboard />} />
                    <Route path="candidates" element={<CandidateList />} />
                    <Route path="candidate-search" element={<CandidateSearch />} />
                    <Route path="jobs" element={<JobManagement />} />
                    <Route path="branches" element={<EmployerBranches />} />
                    <Route path="members" element={<EmployerMembers />} />
                    <Route path="billing" element={<EmployerBilling />} />
                  </Routes>
                </EmployerLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
