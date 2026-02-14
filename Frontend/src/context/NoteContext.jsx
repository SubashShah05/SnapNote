import { createContext, useEffect, useState } from "react";
// Comment out the backend import since we're using mock data
// import BACKEND_URL from "../api/url";

export const NoteContext = createContext();

export const NoteProvider = ({children}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for testing
  const mockNotes = [
    {
      _id: "1",
      title: "Welcome to NoteKeeper",
      content: "This is a sample note. You can create, edit, and delete notes!",
      createdAt: new Date().toISOString()
    },
    {
      _id: "2",
      title: "Getting Started",
      content: "Click on 'Create Note' to add a new note. Happy note-taking!",
      createdAt: new Date().toISOString()
    }
  ];

  // Fetch notes - using mock data instead of API
  const getNotes = async() => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      setTimeout(() => {
        setNotes(mockNotes);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError(error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    getNotes();
  }, [])

  // Create a note
  const createNote = async(note) => {
    try {
      console.log("Creating note:", note);
      // Create mock note with ID
      const newNote = {
        _id: Date.now().toString(),
        title: note.title,
        content: note.content,
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  // Update a note
  const updateNote = async(id, updatedNote) => {
    try {
      console.log("Updating note:", id, updatedNote);
      setNotes(notes.map((note) => 
        note._id === id 
          ? { ...note, title: updatedNote.title, content: updatedNote.content }
          : note
      ));
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }

  // Delete a note
  const deleteNote = async(id) => {
    try {
      console.log("Deleting note:", id);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  return (
    <NoteContext.Provider value={{
      notes, 
      loading, 
      error,
      createNote, 
      updateNote, 
      deleteNote,
      refreshNotes: getNotes
    }}>
      {children}
    </NoteContext.Provider>
  )
}