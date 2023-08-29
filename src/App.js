import React, { useState, useEffect } from 'react';
import { DataStore } from "@aws-amplify/datastore";
import { Predicates } from "@aws-amplify/datastore";
import { listComments } from './graphql/queries';

import { Amplify, API, Auth, graphqlOperation, Storage } from "aws-amplify";
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
  

    const subscription = DataStore.observe(Comment).subscribe(msg => {
      fetchComments();
    });

    fetchComments();

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const submitComment = async () => {
    try {
      await DataStore.save(
        new Comment({
          "comment": comment,
          "publish": true // Will be updated by your Lambda function
        })
      );
    } catch (err) {
      console.error("Error submitting comment: ", err);
    }
  };

  return (
    <div className="App">
      <h1>Video Broadcast</h1>
      <div>Video Player Here</div>
      
      <h2>Submit your comment:</h2>
      <input type="text" value={comment} onChange={handleInputChange} />
      <button onClick={submitComment}>Submit</button>
      
      <h2>Approved Comments:</h2>
      <ul>
        {allComments.map((item) => (
          <li key={item.id}>{item.comment}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
