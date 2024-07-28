import React, { useState, useEffect } from "react";

const DynamicForm = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  console.log(BACKEND_URL);

  const [basicFields, setBasicFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryFields, setCategoryFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({}); // State for tracking validation errors

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
          throw new Error(`Error fetching basic fields: ${response.statusText}`);
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
  const handleInputChange = (fieldName, value, fieldType) => {
    // Perform validation based on field type
    let error = "";

    switch (fieldName) {
      case "name":
        if (/[^a-zA-Z\s]/.test(value)) { // Check if any special character is present
          error = "Name cannot contain special characters.";
        }
        break;
      case "age":
        if (!Number.isInteger(Number(value)) || value < 1 || value > 120) {
          error = "Please enter a valid age between 1 and 120.";
        }
        break;
      case "email":
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) { // Basic email regex
          error = "Please enter a valid email address.";
        }
        break;
      case "address":
        // No specific validation for address as it can contain both text and numbers
        break;
      default:
        switch (fieldType) {
          case "text":
            if (/\d/.test(value)) { // Check if any number is present
              error = "Text fields cannot contain numbers.";
            }
            break;
          case "number":
            if (isNaN(value) || value === '') {
              error = "This field requires a valid number.";
            }
            break;
          default:
            break;
        }
        break;
    }

    // Update form data and errors
    setFormData((prevFormData) => ({ ...prevFormData, [fieldName]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [fieldName]: error }));
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

    // Check for any errors before submitting
    const hasErrors = Object.values(formErrors).some((error) => error !== "");
    if (hasErrors) {
      console.error("Form has validation errors.");
      return;
    }

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

  // Define the desired order of basic fields
  const orderedFieldNames = ["name", "age", "gender", "email", "address"];

  // Sort basic fields based on the desired order
  const orderedBasicFields = basicFields
    .filter((field) => orderedFieldNames.includes(field.column_name))
    .sort(
      (a, b) =>
        orderedFieldNames.indexOf(a.column_name) -
        orderedFieldNames.indexOf(b.column_name)
    );

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Basic Information</h2>
      {basicFieldsLoading ? (
        <p className="loading">Loading basic fields...</p>
      ) : basicFieldsError ? (
        <p className="error">Error loading basic fields: {basicFieldsError}</p>
      ) : (
        orderedBasicFields.map((field) => (
          <div key={field.column_name} className="fieldGroup">
            <label htmlFor={field.column_name} className="label">
              {field.column_name.charAt(0).toUpperCase() +
                field.column_name.slice(1)}
            </label>
            {field.column_name === "gender" ? (
              // Render a dropdown for the gender field
              <select
                id={field.column_name}
                value={formData[field.column_name] || ""}
                onChange={(e) =>
                  handleInputChange(field.column_name, e.target.value, field.data_type)
                }
                required
                className="select"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Other</option>
              </select>
            ) : (
              // Render input for other fields
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
                  handleInputChange(field.column_name, e.target.value, field.data_type)
                }
                required={
                  field.data_type === "text" && field.column_name === "address"
                }
                className="input"
              />
            )}
            {formErrors[field.column_name] && (
              <p className="error">{formErrors[field.column_name]}</p>
            )}
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
                      e.target.value,
                      field.field_type
                    )
                  }
                  required={field.is_required}
                  className="input"
                />
                {formErrors[`category-field-${field.id}`] && (
                  <p className="error">
                    {formErrors[`category-field-${field.id}`]}
                  </p>
                )}
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
