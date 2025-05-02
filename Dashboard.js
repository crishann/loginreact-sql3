import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    idno: '',
    lastname: '',
    firstname: '',
    course: '',
    level: '',
    photo: null
  });
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState('');

  const courses = ['BSIT', 'BSCS', 'BSBA', 'BSED', 'BEED'];
  const levels = ['1', '2', '3', '4'];

  const fetchStudents = () => {
    axios.get('http://localhost:5000/students', { withCredentials: true })
      .then((res) => setStudents(res.data))
      .catch((err) => console.log('Error fetching students:', err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    axios.post('http://localhost:5000/students', data, { withCredentials: true })
      .then(() => {
        fetchStudents();
        cancelEdit();
      })
      .catch((err) => console.log('Error adding student:', err));
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value || key === 'photo') { // Ensure photo gets updated if there's a new file
        data.append(key, value);
      }
    });

    axios.put(`http://localhost:5000/students/${editingId}`, data, { withCredentials: true })
      .then(() => {
        fetchStudents();
        cancelEdit();
      })
      .catch((err) => console.error('Error updating student:', err));
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      idno: student.idno,
      lastname: student.lastname,
      firstname: student.firstname,
      course: student.course,
      level: student.level,
      photo: null
    });
    setPreview(`http://localhost:5000/uploads/${student.photo}`); // assuming student.photo holds filename
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/students/${id}`, { withCredentials: true })
      .then(() => fetchStudents())
      .catch((err) => console.error('Error deleting student:', err));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ idno: '', lastname: '', firstname: '', course: '', level: '', photo: null });
    setPreview('');
  };

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '40px' }}>
      {/* Left: Student Table */}
      <div style={{ flex: 1 }}>
        <h2>Student List</h2>
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th>ID Number</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Course</th>
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.idno}</td>
                <td>{student.lastname}</td>
                <td>{student.firstname}</td>
                <td>{student.course}</td>
                <td>{student.level}</td>
                <td>
                  <button onClick={() => handleEdit(student)} style={{ marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(student.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right: Student Form */}
      <div style={{ flex: 1 }}>
        <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
          {/* Image Preview */}
          <div style={{ textAlign: 'center' }}>
            <img
              src={preview || 'https://via.placeholder.com/150x150.png?text=Student+Photo'}
              alt="Preview"
              style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ccc' }}
            />
            <input type="file" name="photo" onChange={handleFile} />
          </div>

          <input
            type="text"
            name="idno"
            placeholder="ID Number"
            value={formData.idno}
            onChange={handleInput}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleInput}
            required
          />
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleInput}
            required
          />
          <select name="course" value={formData.course} onChange={handleInput} required>
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <select name="level" value={formData.level} onChange={handleInput} required>
            <option value="">Select Level</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px', border: 'none', borderRadius: '4px' }}>
            {editingId ? 'Save Changes' : 'Add Student'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#ccc', padding: '8px', border: 'none', borderRadius: '4px' }}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
