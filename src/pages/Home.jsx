import React from 'react';
import '../../styles/utility.css';
import Navbar from '../components/Navbar';
import Main from '../components/Main';
// import JobBoard from '../components/JobBoard';
import Footer from '../components/Footer';
// import jobsData from '../data/jobData';
// import jobCategory from '../data/jobCategory';
// import JobCategory from '../components/JobCategory';
import { useAuth } from "../contexts/AuthContext";
import Profile from '../components/Profile'
// import CategorySlider from '../components/CategorySlider'

const Home = () => {
  const { user, data } = useAuth();
  console.log(user)
  // Public view (when no user is logged in)
  if (!user) {
    return (
      <>
        <Navbar />
        <Main />
        {/* <JobCategory jobs={jobCategory} />
        <JobBoard jobs={jobsData} /> */}

        {/* <CategorySlider></CategorySlider> */}
        {/* <JobBoard jobs={data?.recentJobs} /> */}
        <Footer />
      </>
    );
  }

  return (
    <>
      {user?.user_type === "seeker" && (
        <>
          <Navbar />
          <Main />
          {/* <JobCategory jobs={jobCategory} /> */}
          {/* <CategorySlider></CategorySlider>
          <JobBoard jobs={data?.recentJobs} /> */}
        </>
      )}

      {user?.user_type === "recruiter" && (
        <>
          <Navbar />
          <Main />
          
          {/* <Profile></Profile> */}
        </>
      )}

      {user?.user_type === "admin" && (
        <>
          <Navbar />
          <Main />
          {/* <Profile></Profile> */}
        </>
      )}
      <Footer />

    </>
  );
};

export default Home;