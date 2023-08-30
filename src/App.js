import React, { useState, useEffect } from 'react';

import YouTube from 'react-youtube';

import { listComments } from './graphql/queries';
import { createComment } from './graphql/mutations';
import { onUpdateComment } from './graphql/subscriptions';
import { deleteComment } from './graphql/mutations';

import { Amplify, API, graphqlOperation } from "aws-amplify";
import { Comment } from './models';
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
Amplify.configure(awsconfig);

function App() {
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState([]);
  // YouTube video options
  const videoOptions = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

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
  const deleteAllComments = async () => {
  try {
    const deletedComments = [];

    for (let comment of allComments) {
      const deleteData = {
        id: comment.id,
        _version: comment._version,
      };
      const result = await API.graphql(graphqlOperation(deleteComment, { input: deleteData }));
      
      // Log the result for debugging
      console.log('Delete result:', result);

      if (result.data.deleteComment) {
        deletedComments.push(comment.id);
      }
    }

    // Log the deletedComments for debugging
    console.log('Successfully deleted comments:', deletedComments);

    // Remove deleted comments from state
    setAllComments(prevComments => prevComments.filter(comment => !deletedComments.includes(comment.id)));
  } catch (err) {
    console.error("Error deleting comments: ", err);
  }
};

  
  
  return (
    <div className="App">
      <h1>Broadcast</h1>
      
      {/* YouTube Video Player */}
      <YouTube
        videoId="RfvL_423a-I"
        opts={videoOptions}
      />

      <h2>Submit comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={submitComment}>Submit</button>


      {/* <button onClick={deleteAllComments}>Delete All Comments</button> */}

      <h2>Comments:</h2>
      <ul>
        {allComments.map((item) => (
          <li key={item.id}>{item.comment}</li>
        ))}
      </ul>
    </div>
  );
}
export default withAuthenticator(App);
