import { useParams } from 'react-router-dom';

function TeamDetailPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Team Detail Page: {id}</h1>
    </div>
  );
}

export default TeamDetailPage;