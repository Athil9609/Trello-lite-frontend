import React, { useState } from 'react';
import {
    Box,
    Typography,
    AppBar,
    Toolbar,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Fab,
    Button,
    Container,
    useTheme,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import { Add, Edit, Delete, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../Components/CreateBoard';
import { useEffect } from 'react';
import { createBoard, getAllBoards, updateBoard, deleteBoard } from '../services/allApis';
import { toast } from 'react-toastify';


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1e1e2d',
        },
        primary: {
            main: '#4f46e5',
        },
        secondary: {
            main: '#22c55e',
        },
    },
    typography: {
        fontFamily: 'Inter, Roboto, sans-serif',
    },
});

const DashboardPage = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [editId, setEditId] = useState(null);


    const [boards, setBoards] = useState([]);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await getAllBoards(headers);
            setBoards(res.data);
        } catch (err) {
            console.error('Failed to load boards:', err.message);
        }
    };


    const handleCreateBoard = async () => {
        if (boardName.trim()) {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                if (editMode) {
                  const res=  await updateBoard(editId, { name: boardName }, headers);
                  if(res.status==200){
                    toast.success("Board updated successfully!");

                  }else{
                    toast.error("Failed to update Board!")
                  }
                } else {
                  const res=  await createBoard({ name: boardName }, headers);
                   if(res.status==201){
                    toast.success("Board created successfully!");

                  }else{
                    toast.error("Failed to create Board!")
                  }
                }

                await fetchBoards();
                setBoardName('');
                setOpen(false);
                setEditMode(false);
                setEditId(null);
            } catch (err) {
                console.error('Error creating/updating board:', err.message);
                toast.error("Failed to create or update board.");
            }
        }
    };



    const handleEditBoard = (board) => {
        setBoardName(board.name);
        setEditMode(true);
        setEditId(board._id);
        setOpen(true);
    };

    const handleDeleteBoard = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await deleteBoard(id, headers);
            toast.success("Board deleted successfully!");
            await fetchBoards();
        } catch (err) {
            console.error('Error deleting board:', err.message);
            toast.error("Failed to delete board.");
        }
    };



    return (
        <ThemeProvider theme={darkTheme}>
            <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
                {/* AppBar */}
                <AppBar position="static" color="transparent" elevation={0}>
                    <Toolbar>
                        <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
                            Boards
                        </Typography>
                        <Tooltip title="Logout">
                            <IconButton onClick={() => navigate('/auth',sessionStorage.clear())} color="inherit">
                                <Logout />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ py: 5 }}>
                    <Grid container spacing={4}>
                        {boards?.map((board) => (
                            <Grid item xs={12} sm={6} md={4} key={board.id}>
                                <Card
                                    sx={{
                                        backgroundColor: 'background.paper',
                                        borderRadius: 4,
                                        transition: '0.3s',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)',
                                        },
                                        minHeight: 250,
                                        minWidth: 250,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        p: 2,
                                    }}
                                >

                                    <Box onClick={() => navigate(`/board/${board._id}`)} sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            {board.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Click to open board
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: 1,
                                            mt: 2,
                                        }}
                                    >
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleEditBoard(board)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDeleteBoard(board._id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Card>

                            </Grid>
                        ))}
                    </Grid>
                </Container>

                <Tooltip title="Create New Board">
                    <Fab
                        color="primary"
                        onClick={() => {
                            setOpen(true);
                            setEditMode(false);
                            setBoardName('');
                            setEditId(null);
                        }}
                        sx={{ position: 'fixed', bottom: 32, right: 32 }}
                    >
                        <Add />
                    </Fab>
                </Tooltip>

                <CreateBoardModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onSubmit={handleCreateBoard}
                    boardName={boardName}
                    setBoardName={setBoardName}
                    isEdit={editMode}
                />
            </Box>
        </ThemeProvider>
    );
};

export default DashboardPage;
