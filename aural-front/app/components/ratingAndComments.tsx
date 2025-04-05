import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings'; 

// Define el tipo para cada comentario
interface Comment {
  rating: number;
  comment: string;
}

export default function SongRating() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // Handles when someone puts a comment
  const handleCommentSubmit = () => {
    if (comment.trim()) {
      
      const newComment = { rating, comment };
      setComments([...comments, newComment]); // Add new comment
      setComment(''); // Clear comment after sending it
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate this Song</Text>
      
      {/* Rating - 5 stars */}
      <Rating
        showRating
        onFinishRating={setRating}
        style={styles.rating}
        startingValue={rating}
        imageSize={40}
        ratingBackgroundColor="#444"  // Background color of the stars
        ratingColor="#F05858"  // Color of the filled stars
      />

      {/* Comment */}
      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="Write your comment here..."
        multiline
        maxLength={200}
      />
      
      {/* Send comment button */}
      <Button title="Submit Comment" onPress={handleCommentSubmit} />

      {/* Show comments */}
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>Comments:</Text>
        {comments.map((item, index) => (
          <View key={index} style={styles.comment}>
            <Text style={styles.commentText}>
              <Text style={styles.ratingText}>Rating: {item.rating} stars</Text>
            </Text>
            <Text>{item.comment}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  rating: {
    marginBottom: 20,
  },
  commentInput: {
    height: 80,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 10,
    marginBottom: 20,
    borderRadius: 5,
    width: '100%',
    paddingTop: 5,
  },
  commentsContainer: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  comment: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  commentText: {
    fontWeight: 'bold',
  },
  ratingText: {
    color: '#F05858',
  }
});
