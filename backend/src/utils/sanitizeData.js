
const sanitizeData = (data) => {
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (value === '') {
      delete sanitized[key];
    }
    
    if (value === null || value === undefined) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
};

const sanitizeDateFields = (data, dateFields = []) => {
  const sanitized = { ...data };
  
  dateFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === null || sanitized[field] === undefined) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

const sanitizeIds = (data, idFields = []) => {
  const sanitized = { ...data };
  
  idFields.forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== null && sanitized[field] !== '') {
      sanitized[field] = parseInt(sanitized[field], 10);
    }
  });
  
  return sanitized;
};

module.exports = {
  sanitizeData,
  sanitizeDateFields,
  sanitizeIds
};
