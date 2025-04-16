/*import { Link } from "react-router-dom";

const Home = () => {
  return (
    
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold">Welcome to Our Platform</h1>
        <p className="mt-4 text-lg">Secure Authentication with HTTP-only Cookies</p>
        <Link to="/login">
          <button className="mt-6 px-6 py-3 bg-white text-green-600 font-semibold rounded-md shadow-md">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;*/
import { Link } from "react-router-dom";
import backgroundImage from "./backgound.png"; // Adjust path as needed

const Home = () => {
  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center text-white bg-black bg-opacity-50 p-6 rounded-lg">
        <h1 className="text-5xl font-bold">Next-Gen Interview Coach</h1>
        <p className="mt-4 text-lg"></p>
        <Link to="/login">
          <button className="mt-6 px-6 py-3 bg-white text-green-600 font-semibold rounded-md shadow-md">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
