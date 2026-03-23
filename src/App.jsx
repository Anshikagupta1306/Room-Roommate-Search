import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext'; // Add this import
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// import BrowseJobs from '../src/pages/Jobs';
// import AddJob from '../src/pages/AddJob';
// import Application from '../src/pages/Applications';
import Profile from './components/Profile';
// import JobApplication from './pages/JobApplication';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// import AppliedJobs from './pages/AppliedJobs';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
// import ManageJobs from './pages/ManageJobs';
import UpdateProfile from './pages/UpdateProfile';
// import SavedItems from './pages/SavedItems';
import './App.css';










import FindRoom from './pages/FindRoom';
import RoomDetails from './pages/RoomDetails';
import FindRoommate from './pages/FindRoommate';
import RoommateProfile from './pages/RoommateProfile';
import PostRoom from './pages/PostRoom';
import PostRoommate from './pages/PostRoommate';
import SavedItems from './pages/SavedItems';

function App() {
  return (
    <NotificationProvider>
      <DarkModeProvider> {/* Wrap with DarkModeProvider */}
        <AuthProvider>
          <div className="App">
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/about" element={<About />} />


                {/* Protected Routes */}
                {/* Seeker Routes */}
                {/* <Route path="/browse-jobs" element={
                  <ProtectedRoute allowedRoles={["seeker"]}>
                    <BrowseJobs />
                  </ProtectedRoute>
                } /> */}
                {/* <Route path="/apply/:id" element={
                  <ProtectedRoute allowedRoles={["seeker"]}>
                    <JobApplication />
                  </ProtectedRoute>
                } /> */}




                <Route path="/find-room" element={
                  // <ProtectedRoute allowedRoles={["seeker", "recruiter"]}>
                    <FindRoom />
                  // </ProtectedRoute>
                } />
                <Route path="/room/:id" element={
                  // <ProtectedRoute allowedRoles={["seeker", "recruiter"]}>
                    <RoomDetails />
                  // </ProtectedRoute>
                } />
                <Route path="/find-roommate" element={
                  // <ProtectedRoute allowedRoles={["seeker", "recruiter"]}>
                    <FindRoommate />
                  // </ProtectedRoute>
                } />
                <Route path="/roommate/:id" element={
                  // <ProtectedRoute allowedRoles={["seeker", "recruiter"]}>
                    <RoommateProfile />
                  // </ProtectedRoute>
                } />


                <Route path="/post-room" element={
                  <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                    <PostRoom />
                  </ProtectedRoute>
                } />
                <Route path="/post-roommate" element={
                  <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                    <PostRoommate />
                  </ProtectedRoute>
                } />









                {/* <Route path="/application" element={
                  <ProtectedRoute allowedRoles={["seeker"]}>
                    <AppliedJobs />
                  </ProtectedRoute>
                } /> */}
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={["seeker", "recruiter", "admin"]}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/update-profile" element={
                  <ProtectedRoute allowedRoles={["seeker", "recruiter", "admin"]}>
                    <UpdateProfile />
                  </ProtectedRoute>
                } />

                <Route path="/saved-items" element={
                  <ProtectedRoute allowedRoles={["seeker", "recruiter", "admin"]}>
                    <SavedItems />
                  </ProtectedRoute>
                } />


                {/* <Route path="/manage-users" element={<ManageUsers />} /> */}

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </DarkModeProvider>
    </NotificationProvider>
  );
}

export default App;