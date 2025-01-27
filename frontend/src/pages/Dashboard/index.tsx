import React from 'react';
import { Button } from '@/components/common/Button';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CMO Assessment Dashboard</h1>
      <Button onClick={() => console.log('New Assessment')}>
        Create New Assessment
      </Button>
    </div>
  );
};

export default Dashboard;
