import React, { useState } from 'react';

const CommentForm = ({ submitComment }) => {
  const [comment, setComment] = useState('');

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  return (
    <div className="comment-form">
      <h2>Submit comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={() => submitComment(comment)}>Submit</button>
    </div>
  );
};

export default CommentForm;
