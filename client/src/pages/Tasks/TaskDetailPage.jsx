import { useParams } from 'react-router-dom';

function TaskDetailPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Task Detail Page: {id}</h1>
    </div>
  );
}

export default TaskDetailPage;