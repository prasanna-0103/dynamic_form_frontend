import React, { useState } from "react";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AddCategoryForm = () => {
  const [name, setName] = useState("");
  const [fields, setFields] = useState([
    { name: "", field_type: "text", is_required: false },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFieldChange = (index, event) => {
    const newFields = fields.slice();
    newFields[index][event.target.name] = event.target.value;
    setFields(newFields);
  };

  const handleFieldTypeChange = (index, event) => {
    const newFields = fields.slice();
    newFields[index].field_type = event.target.value;
    setFields(newFields);
  };

  const handleFieldAdd = () => {
    setFields([
      ...fields,
      { name: "", field_type: "text", is_required: false },
    ]);
  };

  const handleFieldRemove = (index) => {
    const newFields = fields.slice();
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (
      fields.some(
        (field) =>
          !field.name.trim() ||
          !["text", "number", "date"].includes(field.field_type)
      )
    ) {
      setError("All fields must have a name and valid type");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, fields }),
      });

      if (response.ok) {
        setSuccess("Category created successfully");
        setName("");
        setFields([{ name: "", field_type: "text", is_required: false }]);
      } else {
        const result = await response.json();
        setError(result.error || "Failed to create category");
      }
    } catch (error) {
      setError("Failed to create category");
    }
  };

  return (
    <div className="container">
      <h2>Add New Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Category Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>

        {fields.map((field, index) => (
          <div key={index} className="field-group">
            <label htmlFor={`field-name-${index}`}>Field Name</label>
            <input
              type="text"
              id={`field-name-${index}`}
              name="name"
              value={field.name}
              onChange={(e) => handleFieldChange(index, e)}
              placeholder="Enter field name"
            />
            <label htmlFor={`field-type-${index}`}>Field Type</label>
            <select
              id={`field-type-${index}`}
              name="field_type"
              value={field.field_type}
              onChange={(e) => handleFieldTypeChange(index, e)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
            <label htmlFor={`field-required-${index}`}>Required</label>
            <input
              type="checkbox"
              id={`field-required-${index}`}
              name="is_required"
              checked={field.is_required}
              onChange={() => {
                const newFields = fields.slice();
                newFields[index].is_required = !newFields[index].is_required;
                setFields(newFields);
              }}
            />
            <button type="button" className="remove-field" onClick={() => handleFieldRemove(index)}>
              Remove Field
            </button>
          </div>
        ))}

        <div className="buttons">
          <button type="button" onClick={handleFieldAdd}>
            Add Field
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default AddCategoryForm;
