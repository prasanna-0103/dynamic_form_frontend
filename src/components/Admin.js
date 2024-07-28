import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserGrid = () => {
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    address: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track search state

  useEffect(() => {
    if (!searchPerformed) return; // Skip fetching if no search has been performed

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${BACKEND_URL}/api/search?${queryString}`);
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchParams, searchPerformed]); // Include searchPerformed in dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchPerformed(true); // Indicate a search has been performed
    setSearchParams((prevParams) => ({ ...prevParams }));
  };

  return (
    <div className="container">
      <h1>User Search</h1>

      <form onSubmit={handleSearch}>
        <div className="grid">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={searchParams.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={searchParams.age}
            onChange={handleChange}
          />
          <select
            name="gender"
            value={searchParams.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option> {/* Default option */}
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={searchParams.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={searchParams.address}
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={searchParams.category}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <div className="spinner">
          <div></div>
        </div>
      ) : searchPerformed ? ( // Render table only after search is performed
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Address</th>
              <th>Category</th>
              <th>Dynamic Fields</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.age}</td>
                <td>{user.gender}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.category}</td>
                <td>
                  <ul>
                    {user.dynamic_fields.map((field, index) => (
                      <li key={index}>
                        {field.fieldName}: {field.fieldValue}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null} {/* No table if no search */}

      <br />
      <button>
        <a href="/admin/createCategory" className="button">
          Create Category
        </a>
      </button>
    </div>
  );
};

export default UserGrid;
