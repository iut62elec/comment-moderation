import React from 'react';

const CommentList = ({ comments }) => {
  return (
    <div className="comment-list">
      <h2>Comments:</h2>
      <ul>
        {comments.map((item) => (
          <li key={item.id}>
            <strong>{new Date(item.createdAt).toLocaleString()}:</strong> {item.comment}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
