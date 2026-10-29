import { useNavigate } from 'react-router-dom';
import ResumePicker from './ResumePicker';

export default function ResumeRedirect() {
  const navigate = useNavigate();

  return (
    <ResumePicker
      forceOpen
      onClose={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/', { replace: true });
        }
      }}
    />
  );
}
