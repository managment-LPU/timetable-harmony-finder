
import React from 'react';
import { Link } from 'react-router-dom';
import StudentForm from '@/components/StudentForm';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div>
      <div className="container mx-auto py-4 flex justify-end">
        <Link to="/admin">
          <Button variant="outline">Admin Dashboard</Button>
        </Link>
      </div>
      <StudentForm />
    </div>
  );
};

export default Index;
