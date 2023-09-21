import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

import { Button, Flex, View } from '@aws-amplify/ui-react';

import { listComments } from './graphql/queries';
import { createComment } from './graphql/mutations';
import { onUpdateComment } from './graphql/subscriptions';
import { deleteComment } from './graphql/mutations';
import NavBarHeader2_pedram from './ui-components/NavBarHeader2_pedram';
import CommentCard from './ui-components/CommentCard';
import CTASection from './ui-components/CTASection';
import Filters from './ui-components/Filters';
import SideBar from './ui-components/SideBar';

import { Amplify, API, graphqlOperation, Auth } from "aws-amplify";
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Switch, Slider } from '@mui/material';


Amplify.configure(awsconfig);

function App() {
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);  // <-- Add this line for current user
  const [currentUserEmail, setCurrentUserEmail] = useState('');  // <-- Add this line for the email
  const [showAllComments, setShowAllComments] = useState(false); // <-- Add this state variable for the toggle
  const [sliderValue, setSliderValue] = useState(0);

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
    // border: '1px solid #ccc',
    border: 'none',
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
  
  
    setSliderValue(allComments.length);  // Adjust the slider to the max value


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
  }, [showAllComments, allComments.length]);

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
  const elegantButtonStyle = {
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#555555',
    }
  };
  
  const elegantInputStyle = {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '60%',
    marginRight: '16px'
  };
  
  const elegantCommentCard = {
    padding: '16px',
    margin: '16px 0',
    borderRadius: '8px',
    backgroundColor: '#F1F1F1',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };
  const commentsContainerStyle = {
    maxHeight: '300px',
    overflowY: 'auto',
    width: '80%',   // Adjust as per your requirement
    borderRight: '1px solid #ccc',  // Optional: To visually separate comments from the right
};
  return (
    <div style={appStyle}>
        <NavBarHeader2_pedram signOut={signOut} />

        <YouTube videoId="LHCTW4pckDo" opts={videoOptions} />

        <div style={commentBoxStyle}>
            <input 
                type="text" 
                value={comment} 
                onChange={handleInputChange} 
                placeholder="Your comment..."
                style={elegantInputStyle}
            />
            <button style={elegantButtonStyle} onClick={submitComment}>
                Submit
            </button>
        </div>

        <div>
            Show All Comments
            <Switch 
                checked={showAllComments} 
                onChange={() => setShowAllComments(!showAllComments)} 
            />
        </div>

        {/* Flex container */}
        <Flex direction="row" justifyContent="space-between" alignItems="flex-start" style={{ marginTop: '20px' }}>

                {/* Comments Section */}
                <View flexGrow={1} style={commentsContainerStyle}>
                    {allComments.map((item) => (
                        <div key={item.id} style={elegantCommentCard}>
                            <div style={userNameStyle}>
                                {item.user ? item.user.split('@')[0] : 'Anonymous'}
                                <span style={timestampStyle}>
                                    {' - ' + new Date(item.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div style={{
                                ...commentStyle, 
                                textDecoration: item.publish ? 'none' : 'line-through red'
                            }}>
                                {item.comment}
                            </div>
                        </div>
                    ))}
                </View>

            </Flex>

        </div>
    );
}

export default withAuthenticator(App);
