import React, { useState } from 'react';
import axios from 'axios';
import "@aws-amplify/ui-react/styles.css"; // default theme
// import awsconfig from './aws-exports';
// Amplify.configure(awsconfig);
function App() {
  const [comment, setComment] = useState('');
  const [isCommentApproved, setIsCommentApproved] = useState(null);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    try {
      const response = await axios.post('https://your-api-gateway-url/comments', { comment });
      setIsCommentApproved(response.data.approved);
    } catch (error) {
      console.error('An error occurred while submitting the comment:', error);
    }
  };

  return (
    <div className="App">
      <h1>Video Broadcast</h1>
      <div>Video Player Here</div>
      
      <h2>Submit your comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={submitComment}>Submit</button>
      
      {isCommentApproved !== null && (
        isCommentApproved
          ? <p>Your comment has been approved!</p>
          : <p>Your comment was not approved.</p>
      )}
    </div>
  );
}

export default App;
