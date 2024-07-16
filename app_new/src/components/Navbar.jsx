import React from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingCart } from 'react-icons/hi';

const Navbar = ({ cartCount }) => {
    return (
        <nav className="bg-purple-700 p-4 text-white flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">My Store</Link>
            <Link to="/cart" className="text-xl flex items-center relative">
                <HiShoppingCart className="mr-2" />
                Cart
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </Link>
        </nav>
    );
};

export default Navbar;
