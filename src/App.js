import React, { useState, useEffect } from 'react';
import { listComments } from './graphql/queries';
import { createComment } from './graphql/mutations';
import { onUpdateComment } from './graphql/subscriptions';

import { Amplify, API, graphqlOperation } from "aws-amplify";
import { Comment } from './models';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App() {
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await API.graphql(graphqlOperation(listComments, {
          filter: {
            publish: {
              eq: true
            }
          }
        }));

        if (commentsData.data.listComments) {
          setAllComments(commentsData.data.listComments.items);
        }
      } catch (err) {
        console.error("Error fetching comments: ", err);
      }
    };

    fetchComments();

    const subscription = API.graphql(graphqlOperation(onUpdateComment)).subscribe({
      next: (eventData) => {
        const updatedComment = eventData.value.data.onUpdateComment;
        if (updatedComment.publish) {
          setAllComments(prevComments => [...prevComments, updatedComment]);
        }
      }
    });

    const intervalId = setInterval(() => {
      fetchComments();
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    try {
      const commentData = {
        comment: comment,
        publish: false
      };

      await API.graphql(graphqlOperation(createComment, { input: commentData }));
    } catch (err) {
      console.error("Error submitting comment: ", err);
    }
  };

  return (
    <div className="App">
      <h1>Video Broadcast</h1>
      <div>Video Player</div>

      <h2>Submit comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={submitComment}>Submit</button>

      <h2>Comments:</h2>
      <ul>
        {allComments.map((item) => (
          <li key={item.id}>{item.comment}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
