
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Redirecting to kanban from index page");
    navigate('/kanban');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <span className="loading">Redirecionando...</span>
    </div>
  );
}

export default Index;
