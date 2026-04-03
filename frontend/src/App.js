import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useState } from "react";
import { ToastContainer } from "react-toastify";
import Home from "./view/candidate/HomeCandidate";
import CompanyList from "./view/candidate/CompanyList";
import Company from "./view/candidate/Company";
import JobList from "./view/candidate/JobList";
import Job from "./view/candidate/Job";
import EmployerLayout from "./view/employer/layouts/Layout";
import EmployerLogin from "./view/employer/auth/Login";
import AdminLayout from "./view/admin/Layout";
import AdminLogin from "./view/admin/Login";
import AdminDashboard from "./view/admin/Dashboard";
import AdminJobs from "./view/admin/Jobs";
import AdminAppearance from "./view/admin/Appearance";
import CandidateList from "./view/employer/candidates/CandidateList";
import JobManagement from "./view/employer/jobs/JobManagement";
import EmployerDashboard from "./view/employer/dashboard/Dashboard";
import CandidateLayout from "./view/candidate/management/layouts/CandidateLayout";
import CandidateDashboard from "./view/candidate/management/Dashboard";
import AppliedJobs from "./view/candidate/management/AppliedJobs";
import SavedJobs from "./view/candidate/management/SavedJobs";
import Signup from "./view/candidate/auth/Signup";
import Layout from "./view/candidate/layouts/Layout";
import Profile from "./view/candidate/management/profile";
import Resume from "./view/candidate/management/resumes";
import Template from "./view/candidate/management/resumes/templates";

export const AppContext = createContext();

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage }}>
      <ToastContainer autoClose={500} position="bottom-right" />
      <BrowserRouter>
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
                  <Route exact path="" element={<Home />} />
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
                          <Route
                            path="applied-jobs"
                            element={<AppliedJobs />}
                          />
                          <Route path="saved-jobs" element={<SavedJobs />} />
                          <Route path="profile" element={<Profile />} />
                          <Route path="resumes" element={<Resume />} />
                          <Route
                            path="resumes/create"
                            element={<Template />}
                          />
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
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
