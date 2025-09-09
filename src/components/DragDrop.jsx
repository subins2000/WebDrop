import React, { useState, useEffect, useCallback } from "react";

const DragDrop = ({ onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide overlay if we're leaving the document body
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    setIsDragOver(false);
    onDrop(e);
  }, [onDrop]);

  useEffect(() => {
    const body = document.body;

    body.addEventListener('dragover', handleDragOver);
    body.addEventListener('dragleave', handleDragLeave);
    body.addEventListener('drop', handleDrop);

    return () => {
      body.removeEventListener('dragover', handleDragOver);
      body.removeEventListener('dragleave', handleDragLeave);
      body.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  return isDragOver ? (
    <div className="drag-overlay">
      <div className="drag-overlay-content">
        Drop the file(s) anywhere on this page
      </div>
    </div>
  ) : null;
};

export default DragDrop;
