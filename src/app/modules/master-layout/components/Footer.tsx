import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-nbs-gray border-t border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ACE-NBS Cooperative
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;