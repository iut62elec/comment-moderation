import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

import { listComments } from './graphql/queries';
import { createComment } from './graphql/mutations';
import { onUpdateComment } from './graphql/subscriptions';
import { deleteComment } from './graphql/mutations';

import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
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
          const sortedComments = commentsData.data.listComments.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllComments(sortedComments);
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
          setAllComments(prevComments => [...prevComments, updatedComment].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      }
    });
    const intervalId = setInterval(() => {
      fetchComments();
    }, 5000);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    try {
      const commentData = {
        comment: comment,
        publish: false,
      };

      await API.graphql(graphqlOperation(createComment, { input: commentData }));
    } catch (err) {
      console.error("Error submitting comment: ", err);
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  return (
    <div className="App">
      <button onClick={signOut}>Sign Out</button>
      <h1>Broadcast</h1>

      <YouTube
        videoId="RfvL_423a-I"
        opts={videoOptions}
      />

      <h2>Submit comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={submitComment}>Submit</button>

      <h2>Comments:</h2>
      <ul>
        {allComments.map((item) => (
          <li key={item.id}>
            <strong>{new Date(item.createdAt).toLocaleString()}: </strong> {item.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuthenticator(App);
