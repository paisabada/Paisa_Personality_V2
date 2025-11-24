// pages/result.js
import SubmitForm from '../components/SubmitForm';

export default function ResultPage({ query }) {
  // Example: get resultType from query string or server props
  const resultType = query?.type || 'budget';
  return (
    <div style={{ padding: 20 }}>
      <h1>Your result: {resultType}</h1>
      <p>Show the image preview here if you want</p>
      <SubmitForm initialResultType={resultType} />
    </div>
  );
}
