import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
  getColumnsByBoard,
  getTasksByColumn,
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from "../services/allApis";

export default function Board() {
  const nav = useNavigate();
  const { _id: boardId } = useParams();
  const [columns, setColumns] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");
  const [newTaskInput, setNewTaskInput] = useState({});
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cols = await getColumnsByBoard(boardId, headers);
        const columnData = {};
        for (const col of cols.data) {
          const tasks = await getTasksByColumn(col._id, headers);
          columnData[col._id] = {
            id: col._id,
            title: col.title,
            tasks: tasks.data,
          };
        }
        setColumns(columnData);
      } catch (err) {
        console.error("Error loading board data:", err);
      }
    };
    fetchData();
  }, [boardId]);

  const findContainer = (taskId) =>
    Object.keys(columns).find((colId) =>
      columns[colId].tasks.some((task) => task._id === taskId)
    );

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return;

    const activeColId = findContainer(active.id);
    const overColId = findContainer(over.id);
    if (!activeColId || !overColId) return;

    const activeTasks = [...columns[activeColId].tasks];
    const overTasks = [...columns[overColId].tasks];
    const activeIndex = activeTasks.findIndex((t) => t._id === active.id);
    const overIndex = overTasks.findIndex((t) => t._id === over.id);
    const draggedTask = activeTasks[activeIndex];

    const updatedColumns = { ...columns };

    if (activeColId === overColId) {
      const newTasks = arrayMove(activeTasks, activeIndex, overIndex);
      updatedColumns[activeColId].tasks = newTasks;
    } else {
      activeTasks.splice(activeIndex, 1);
      overTasks.splice(overIndex + 1, 0, draggedTask);
      updatedColumns[activeColId].tasks = activeTasks;
      updatedColumns[overColId].tasks = overTasks;
    }

    setColumns(updatedColumns);

    const tasksByColumn = Object.entries(updatedColumns).map(
      ([columnId, colData]) => ({
        columnId,
        taskIds: colData.tasks.map((t) => t._id),
      })
    );

    try {
      await reorderTasks({ tasksByColumn }, headers);
    } catch (err) {
      console.error("Failed to reorder tasks:", err);
    }
  };

  const handleTaskEdit = (taskId, content) => {
    setEditingTaskId(taskId);
    setEditValues((prev) => ({ ...prev, [taskId]: content }));
  };

  const handleTaskSave = async (taskId) => {
    const content = editValues[taskId];
    if (!content) return;

    const updated = { ...columns };
    for (let col in updated) {
      updated[col].tasks = updated[col].tasks.map((task) =>
        task._id === taskId ? { ...task, content } : task
      );
    }
    setColumns(updated);
    setEditingTaskId(null);
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    await updateTask(taskId, { content }, headers);
  };

  const handleTaskDelete = async (taskId) => {
    const updated = { ...columns };
    for (let col in updated) {
      updated[col].tasks = updated[col].tasks.filter((t) => t._id !== taskId);
    }
    setColumns(updated);
    await deleteTask(taskId, headers);
  };

  const handleAddTask = async (columnId) => {
    const content = newTaskInput[columnId];
    if (!content) return;
    try {
      const res = await createTask({ content, columnId }, headers);
      const newTask = res.data;
      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          tasks: [...prev[columnId].tasks, newTask],
        },
      }));
      setNewTaskInput((prev) => ({ ...prev, [columnId]: "" }));
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      const res = await createColumn({ boardId, title: newColumnTitle }, headers);
      const newCol = res.data;
      setColumns((prev) => ({
        ...prev,
        [newCol._id]: { ...newCol, tasks: [] },
      }));
      setNewColumnTitle("");
    } catch (err) {
      console.error("Add column failed:", err);
    }
  };

  const handleEditColumn = (id, title) => {
    setEditingColumnId(id);
    setEditColumnTitle(title);
  };

  const handleSaveColumn = async (id) => {
    try {
      await updateColumn(id, { title: editColumnTitle }, headers);
      setColumns((prev) => ({
        ...prev,
        [id]: { ...prev[id], title: editColumnTitle },
      }));
      setEditingColumnId(null);
    } catch (err) {
      console.error("Update column failed:", err);
    }
  };

  const handleDeleteColumn = async (id) => {
    try {
      await deleteColumn(id, headers);
      const updated = { ...columns };
      delete updated[id];
      setColumns(updated);
    } catch (err) {
      console.error("Delete column failed:", err);
    }
  };

  const TaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: task._id });

    return (
      <Box
        ref={setNodeRef}
        {...attributes}
        sx={{
          transform: CSS.Transform.toString(transform),
          transition: "all 0.2s ease",
          p: "12px 16px",
          mb: 1.5,
          bgcolor: "background.paper",
          borderRadius: "10px",
          color: "text.primary",
          boxShadow: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0px 4px 25px rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        <Box {...listeners} sx={{ cursor: "grab", pr: 1 }}>
          <DragIndicatorIcon sx={{ color: "grey.500" }} />
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {editingTaskId === task._id ? (
            <>
              <TextField
                variant="standard"
                value={editValues[task._id] || ""}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [task._id]: e.target.value,
                  }))
                }
                size="small"
                autoFocus
                sx={{
                  bgcolor: "background.default",
                  input: { color: "text.primary" },
                  borderRadius: 1,
                  width: "100%",
                }}
              />
              <IconButton onClick={() => handleTaskSave(task._id)} size="small">
                <SaveIcon color="primary" />
              </IconButton>
            </>
          ) : (
            <>
              <Typography sx={{ flex: 1 }}>{task.content}</Typography>
              <IconButton onClick={() => handleTaskEdit(task._id, task.content)} size="small">
                <EditIcon color="primary" />
              </IconButton>
              <IconButton onClick={() => handleTaskDelete(task._id)} size="small">
                <DeleteIcon color="primary" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 3 }}>
        <Button variant="contained" color="primary" onClick={() => nav("/")}>
          ← Back to Dashboard
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, mt: 5, display: "flex", gap: 2 }}>
          <TextField
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="New column title"
            size="small"
            sx={{
              bgcolor: "background.paper",
              input: { color: "text.primary" },
              borderRadius: 1,
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddColumn}>
            Add Column
          </Button>
        </Box>

        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <SortableContext
            items={Object.values(columns).flatMap((col) => col.tasks.map((t) => t._id))}
            strategy={verticalListSortingStrategy}
          >
            <Grid container spacing={3}>
              {Object.values(columns).map((column) => (
                <Grid item xs={12} sm={6} md={4} key={column.id}>
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: "12px",
                      p: 2,
                      boxShadow: 3,
                      minHeight: "400px",
                      minWidth: 400,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0px 4px 25px rgba(255, 255, 255, 0.2)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      {editingColumnId === column.id ? (
                        <>
                          <TextField
                            value={editColumnTitle}
                            onChange={(e) => setEditColumnTitle(e.target.value)}
                            size="small"
                            sx={{
                              bgcolor: "background.default",
                              input: { color: "text.primary" },
                              borderRadius: 1,
                            }}
                          />
                          <IconButton onClick={() => handleSaveColumn(column.id)} size="small">
                            <SaveIcon color="primary" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Typography variant="h6">{column.title}</Typography>
                          <Box>
                            <IconButton onClick={() => handleEditColumn(column.id, column.title)}>
                              <EditIcon color="primary" />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteColumn(column.id)}>
                              <DeleteIcon color="primary" />
                            </IconButton>
                          </Box>
                        </>
                      )}
                    </Box>

                    {column.tasks.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))}

                    <Box sx={{ display: "flex", mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="New task"
                        value={newTaskInput[column.id] || ""}
                        onChange={(e) =>
                          setNewTaskInput((prev) => ({
                            ...prev,
                            [column.id]: e.target.value,
                          }))
                        }
                        sx={{
                          bgcolor: "background.default",
                          input: { color: "text.primary" },
                          borderRadius: 1,
                        }}
                      />
                      <IconButton onClick={() => handleAddTask(column.id)}>
                        <AddIcon color="primary" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      </Box>
    </>
  );
}
