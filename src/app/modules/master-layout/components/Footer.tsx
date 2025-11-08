import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-nbs-gray border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} National Bookstore Cooperative
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-nbs-red">Terms</a>
            <a href="#" className="hover:text-nbs-red">Privacy</a>
            <a href="#" className="hover:text-nbs-red">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;