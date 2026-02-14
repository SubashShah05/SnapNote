
import React, { useContext, useState, useEffect } from 'react'
import Notecard from '../components/Notecard'
import { NoteContext } from '../context/NoteContext'
import { useLocation } from 'react-router-dom'

function Home() {
  const { notes, loading } = useContext(NoteContext)
  const location = useLocation()
  const [filteredNotes, setFilteredNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('search')
    setSearchTerm(query || '')
  }, [location.search])

  // Filter notes based on search term
  useEffect(() => {
    if (!notes) return
    
    if (searchTerm) {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes(notes)
    }
  }, [notes, searchTerm])
  
  if(loading){
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-300 mb-4'>Loading notes...</p>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto'></div>
        </div>
      </div>
    )
  }
  
  if(notes.length === 0){
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-400 mb-4'>No notes available.</p>
          <p className='text-gray-500'>Create your first note to get started!</p>
        </div>
      </div>
    )
  }

  if (filteredNotes.length === 0 && searchTerm) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-400 mb-2'>No notes found for "{searchTerm}"</p>
          <p className='text-gray-500'>Try different keywords</p>
        </div>
      </div>
    )
  }
  
  return(
    <>
      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-300">
            Found <span className="text-blue-400 font-semibold">{filteredNotes.length}</span> notes for "{searchTerm}"
          </p>
        </div>
      )}
      
      {/* Notes Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4'>
        {filteredNotes.map((note) => (
          <Notecard key={note._id} note={note}/>
        ))}
      </div>
    </>
  )
}

export default Home