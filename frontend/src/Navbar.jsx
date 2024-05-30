import React,{ useState } from "react";
import { BrowserRouter as Router, Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Navbar() {
  const { authData } = useAuth();
  const [dropdownOpen,setDropdownOpen] = useState(false);
  const location = useLocation();
  const isUserPage = location.pathname === '/user';

  return (
    <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Dental Clinic Consumables System</span>
        </Link>
        <div className="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
          <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
            <li>
              <NavLink to="/home" className={({isActive}) => "block py-2 px-3 md:p-0 " + (isActive ? "text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" : "text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent")}>Home</NavLink>
            </li>
            <li>|</li>
            <li>
              {authData.hasLogin ? (authData.isAdmin ?
                <div
                  className={"relative" + ((isUserPage || dropdownOpen) ? "text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" : "text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent")}
                  onMouseEnter={() => setDropdownOpen(true)}
                  //onMouseLeave={() => setDropdownOpen(false)}
                >
                  {authData.group_name}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <NavLink
                        to="/user"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Account
                      </NavLink>
                      <NavLink
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </NavLink>
                    </div>
                  )}
                </div>
                :
                <NavLink to="/" className={({isActive}) => "block py-2 px-3 md:p-0 " + (isActive ? "text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" : "text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent")}>Logout</NavLink>
              ) :
                <NavLink to="/" className={({isActive}) => "block py-2 px-3 md:p-0 " + (isActive ? "text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" : "text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent")}>Login</NavLink>
              }
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
