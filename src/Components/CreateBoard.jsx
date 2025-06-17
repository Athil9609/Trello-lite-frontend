import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const CreateBoardModal = ({
  open,
  onClose,
  onSubmit,
  boardName,
  setBoardName,
  isEdit = false,
}) => {
  const handleSubmit = () => {
    if (boardName.trim()) {
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Edit Board' : 'Create New Board'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Board Name"
          fullWidth
          variant="outlined"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBoardModal;
