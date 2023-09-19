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
  const [currentUser, setCurrentUser] = useState(null);  // <-- Add this line for current user
  const [currentUserEmail, setCurrentUserEmail] = useState('');  // <-- Add this line for the email
  const [showAllComments, setShowAllComments] = useState(false); // <-- Add this state variable for the toggle

  // YouTube video options
  const videoOptions = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };
  // App styles
  const appStyle = {
    fontFamily: 'Arial, sans-serif',
    margin: '2rem',
    textAlign: 'center',
  };

  const commentBoxStyle = {
    padding: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    backgroundColor: '#007BFF',
    color: '#FFF',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  };

  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(user => {
      setCurrentUserEmail(user.attributes.email);
    })
    .catch(err => console.log(err));
  
    const fetchComments = async () => {
      try {
        const filterCondition = showAllComments ? {} : { filter: { publish: { eq: true } } };
        
        const commentsData = await API.graphql(graphqlOperation(listComments, filterCondition));
  
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
      clearInterval(intervalId);  // Clear the interval
    };
  }, [showAllComments]);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    try {
      const commentData = {
        comment: comment,
        publish: false,
        user: currentUserEmail,

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
  const commentStyle = {
    fontSize: '18px',  // Larger font size
    margin: '10px 0',  // Add some margin to each comment
  };
  
  const userNameStyle = {
    fontWeight: 'bold',
  };
  
  const timestampStyle = {
    fontStyle: 'italic',
    color: '#888',
  };
  
  return (
    <div style={appStyle}>
      <button style={buttonStyle} onClick={signOut}>
        Sign Out
      </button>
      <h1>Broadcast</h1>
  
      <YouTube videoId="RfvL_423a-I" opts={videoOptions} />
  
      <div style={commentBoxStyle}>
        <h2>Submit Comment:</h2>
        <input type="text" value={comment} onChange={handleInputChange} />
        <button style={buttonStyle} onClick={submitComment}>
          Submit
        </button>
      </div>
      <label>
        Show All Comments
        <input type="checkbox" checked={showAllComments} onChange={() => setShowAllComments(!showAllComments)} />
      </label>

      <div>
        <h2>Comments:</h2>
        <ul>
          {allComments.map((item) => (
            <li key={item.id} style={{...commentStyle, textDecoration: item.publish ? 'none' : 'line-through red'}}>
              <span style={userNameStyle}>
                {item.user ? item.user.split('@')[0] : 'Anonymous'}
              </span>
              <span style={timestampStyle}>
                {' - ' + new Date(item.createdAt).toLocaleString()}
              </span>
              <div>
                {item.comment}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
