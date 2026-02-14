
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, Search, X, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If not authenticated
  if (!user) {
    return (
      <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo - Simple version for better compatibility */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-blue-400">
              SnapNote
            </span>
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/login" className="text-sm sm:text-base text-gray-300 hover:text-blue-400 transition">
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-sm sm:text-base bg-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navbar with search
  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-400">
              SnapNote
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/" 
                  ? "text-blue-400 font-semibold bg-blue-400/10" 
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/create" 
                  ? "text-blue-400 font-semibold bg-blue-400/10" 
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800"
              }`}
            >
              Create Note
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-300">{user?.name || "User"}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row - Logo and Icons */}
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-400">
                SnapNote
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <Search className="w-5 h-5 text-gray-300" />
              </button>

              {/* Mobile Menu Toggle (Profile) */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/create"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Create Note
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Dropdown */}
          {isSearchOpen && (
            <div
              ref={searchRef}
              className="mt-3"
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-2.5"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;