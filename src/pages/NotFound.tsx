import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/dashboard" 
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;