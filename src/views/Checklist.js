import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';
import { useAuth } from 'hooks';
import API from 'services/AxiosConfig';
import { toast } from 'react-toastify'


const ChecklistComponent = ({ callback, closeHandler, creation = false, configToEdit, handleSaveEdit, handleSaveCreate, handleSelect, url, options }) => {
  const { user } = useAuth()
  const [columns, setColumns] = useState(configToEdit ? configToEdit.columns : []);
  const [title, setTitle] = useState(configToEdit?.name || '')
  const [choices, setChoices] = useState(options);


  const handleCheckboxChange = (field) => {
    const isSelected = columns.find((column) => column.name === field.name);

    if (isSelected) {
      setColumns(columns.filter((column) => column.name !== field.name));
    } else {
      setColumns([...columns, field]);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Check if the destination is a valid drop target
    if (!destination) {
      return;
    }

    // Check if the item was dropped in a different list
    if (source.droppableId !== destination.droppableId) {
      const sourceList = source.droppableId === 'columns' ? columns : choices;
      const destinationList = source.droppableId === 'columns' ? choices : columns;

      const [removed] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, removed);

      setColumns([...columns]);
      setChoices([...choices]);
    } else {
      // Reorder items within the same list
      const list = source.droppableId === 'columns' ? columns : choices;

      const [removed] = list.splice(source.index, 1);
      list.splice(destination.index, 0, removed);

      if (source.droppableId === 'columns') {
        setColumns([...columns]);
      } else {
        setChoices([...choices]);
      }
    }
  };


  const grid = 8;



  return (
    <div style={{ overflowY: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {creation}

        <TextField value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: '10px', marginBottom: '10px' }} size='small' variant='outlined' label='Title' />
        <div className="checklist">
          <div className="columns-list">
            <h2>Columns</h2>
            <Droppable droppableId="columns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {columns.map((field, index) => (
                    <Draggable key={field.name} draggableId={field.name} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="column-card draggable"
                        >
                          <CardContent>
                            <Typography>{field.title}</Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div className="choices-list">
            <h2>Fields</h2>
            <div className="choices-grid">
              {choices.map((field) => (
                <div key={field.name} className="choice-item">
                  <input
                    type="checkbox"
                    id={field.name}
                    checked={columns.some((column) => column.name === field.name)}
                    onChange={() => handleCheckboxChange(field)}
                  />
                  <label htmlFor={field.name}>{field.title}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style = {{width:'100%', display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
          <Button
            onClick={() => {
              closeHandler()
            }}
            variant="contained" sx={{ bgcolor: '#a3a3ab' }}
          >Cancel</Button>
          <Button
            variant='contained'
            onClick={creation === true ? () => {
              if (!title || title === '') {
                toast.error('Title required')
                return
              }
              if (columns.length === 0) {
                toast.error('Atleast one column required')
                return
              }
              callback([...columns, { name: '_id', title: '_id' }])
              API.post(`/${url}`, {
                name: title,
                columns: columns,
                createdBy: user._id,
              })
            
            } : () => handleSaveEdit(columns, title)}>Save</Button>

        </div>

      </DragDropContext>
    </div>
  );
};

export default ChecklistComponent;
