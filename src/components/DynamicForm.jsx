import React, { useState, useEffect } from "react";

// API URLs
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DynamicForm = () => {
  const [basicFields, setBasicFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryFields, setCategoryFields] = useState([]);
  const [formData, setFormData] = useState({});

  // Loading and Error state variables
  const [basicFieldsLoading, setBasicFieldsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryFieldsLoading, setCategoryFieldsLoading] = useState(false);
  const [basicFieldsError, setBasicFieldsError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [categoryFieldsError, setCategoryFieldsError] = useState(null);
  const [formSubmitError, setFormSubmitError] = useState(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState(false);

  // Fetch basic fields
  useEffect(() => {
    const fetchBasicFields = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/basicfields`);
        if (!response.ok)
          throw new Error(
            `Error fetching basic fields: ${response.statusText}`
          );
        const data = await response.json();
        setBasicFields(data.fields);
      } catch (error) {
        setBasicFieldsError(error.message);
        console.error(error);
      } finally {
        setBasicFieldsLoading(false);
      }
    };

    fetchBasicFields();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/categories`);
        if (!response.ok)
          throw new Error(`Error fetching categories: ${response.statusText}`);
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        setCategoriesError(error.message);
        console.error(error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch fields for selected category
  useEffect(() => {
    if (selectedCategory) {
      setCategoryFieldsLoading(true);
      const fetchCategoryFields = async () => {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/categories/${selectedCategory}/fields`
          );
          if (!response.ok)
            throw new Error(
              `Error fetching category fields: ${response.statusText}`
            );
          const data = await response.json();
          setCategoryFields(data.fields);
        } catch (error) {
          setCategoryFieldsError(error.message);
          console.error(error);
        } finally {
          setCategoryFieldsLoading(false);
        }
      };

      fetchCategoryFields();
    } else {
      setCategoryFields([]); // Clear category fields if no category is selected
    }
  }, [selectedCategory]);

  // Handle input change
  const handleInputChange = (fieldName, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Submit form data
  const submitFormData = async (data) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`Form submission failed: ${response.statusText}`);
      const result = await response.json();
      console.log("Form submitted successfully:", result);
      return result;
    } catch (error) {
      setFormSubmitError(error.message);
      console.error("Error submitting form data:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setFormSubmitError(null);
    submitFormData(formData)
      .then((result) => {
        setFormSubmitSuccess(true);
        setFormData({});
        setSelectedCategory(null);
        setCategoryFields([]);
        setTimeout(() => setFormSubmitSuccess(false), 2000);
      })
      .catch((error) => console.error("Error submitting form data:", error));
  };

  // Handle form cancellation
  const handleCancel = () => {
    setFormData({});
    setSelectedCategory(null);
    setCategoryFields([]);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Basic Information</h2>
      {basicFieldsLoading ? (
        <p className="loading">Loading basic fields...</p>
      ) : basicFieldsError ? (
        <p className="error">Error loading basic fields: {basicFieldsError}</p>
      ) : (
        basicFields
          .filter((field) => field.column_name !== "id")
          .map((field) => (
            <div key={field.column_name} className="fieldGroup">
              <label htmlFor={field.column_name} className="label">
                {field.column_name.charAt(0).toUpperCase() +
                  field.column_name.slice(1)}
              </label>
              <input
                type={
                  field.data_type === "integer"
                    ? "number"
                    : field.data_type === "character varying"
                    ? "text"
                    : "text"
                }
                id={field.column_name}
                value={formData[field.column_name] || ""}
                onChange={(e) =>
                  handleInputChange(field.column_name, e.target.value)
                }
                required={
                  field.data_type === "text" && field.column_name === "address"
                }
                className="input"
              />
            </div>
          ))
      )}

      <h2>Category Selection</h2>
      {categoriesLoading ? (
        <p className="loading">Loading categories...</p>
      ) : categoriesError ? (
        <p className="error">Error loading categories: {categoriesError}</p>
      ) : (
        <div className="fieldGroup">
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            id="category"
            className="select"
          >
            <option value="">Select a category</option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
      )}

      {selectedCategory && (
        <>
          <h2>Additional Fields</h2>
          {categoryFieldsLoading ? (
            <p className="loading">Loading category fields...</p>
          ) : categoryFieldsError ? (
            <p className="error">
              Error loading category fields: {categoryFieldsError}
            </p>
          ) : (
            categoryFields.map((field) => (
              <div key={field.id} className="fieldGroup">
                <label htmlFor={`category-field-${field.id}`} className="label">
                  {field.name}
                </label>
                <input
                  type={field.field_type === "number" ? "number" : "text"}
                  id={`category-field-${field.id}`}
                  value={formData[`category-field-${field.id}`] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      `category-field-${field.id}`,
                      e.target.value
                    )
                  }
                  required={field.is_required}
                  className="input"
                />
              </div>
            ))
          )}
        </>
      )}

      <div className="buttons">
        <button type="submit" className="submitButton">
          Submit
        </button>
        <button type="button" onClick={handleCancel} className="cancelButton">
          Cancel
        </button>
      </div>

      {formSubmitError && (
        <p className="error">Error submitting form: {formSubmitError}</p>
      )}

      {formSubmitSuccess && (
        <p className="success">Form submitted successfully!</p>
      )}
    </form>
  );
};

export default DynamicForm;
